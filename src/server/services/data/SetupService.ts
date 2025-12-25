//!native
//!optimize 2

/**
 * @fileoverview Handles saving, loading, and managing item setups for areas.
 *
 * This service provides:
 * - Saving the current placed items as a named setup
 * - Loading setups and placing items for a player
 * - Renaming and toggling autoload for setups
 * - Synchronizing setup data with clients
 *
 * @since 1.0.0
 */

import Signal from "@antivivi/lemon-signal";
import { simpleInterval } from "@antivivi/vrldk";
import { OnInit, OnStart, Service } from "@flamework/core";
import { TextService } from "@rbxts/services";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import ItemService from "server/services/item/ItemService";
import ChatHookService from "server/services/permissions/ChatHookService";
import { log } from "server/services/permissions/LogService";
import PermissionService from "server/services/permissions/PermissionService";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

/**
 * Service that manages saving and loading of item setups for different areas.
 */
@Service()
export default class SetupService implements OnInit, OnStart {
    /** Maximum allowed length for setup names. */
    private static readonly MAX_SETUP_NAME_LENGTH = 32;

    /** Signal fired when a setup is saved. */
    setupSaved = new Signal<(player: Player, area: AreaId) => void>();

    /** Signal fired when a setup is loaded. */
    setupLoaded = new Signal<(player: Player, area: AreaId) => void>();

    constructor(
        private dataService: DataService,
        private chatHookService: ChatHookService,
        private currencyService: CurrencyService,
        private itemService: ItemService,
        private permissionsService: PermissionService,
    ) {}

    /**
     * Truncates a setup name to the maximum allowed length (32 characters).
     *
     * @param name The name to truncate.
     * @returns The truncated name.
     */
    private truncateSetupName(name: string): string {
        if (name.size() > SetupService.MAX_SETUP_NAME_LENGTH) {
            return name.sub(1, SetupService.MAX_SETUP_NAME_LENGTH);
        }
        return name;
    }

    /**
     * Saves the current placed items in an area as a setup with the given name.
     * Updates or creates the setup, calculates total price, and syncs with clients.
     *
     * @param player The player saving the setup.
     * @param area The area ID for the setup.
     * @param name The name of the setup.
     * @returns Map of items and their counts in the setup.
     */
    saveSetup(player: Player, area: AreaId, name: string) {
        if (!this.permissionsService.hasPermission(player, "build")) {
            return;
        }
        const data = this.dataService.empireData;
        const items = new Array<PlacedItem>();
        for (const [_, placedItem] of data.items.worldPlaced) if (placedItem.area === area) items.push(placedItem);
        let totalPrice = new CurrencyBundle();
        const itemCount = new Map<Item, number>();
        for (const placedItem of items) {
            const item = Items.getItem(placedItem.item);
            if (item === undefined) continue;
            const currentItemCount = (itemCount.get(item) ?? 0) + 1;
            const price = item.pricePerIteration.get(currentItemCount);
            if (price !== undefined && item.getResetLayer() < 100) {
                totalPrice = totalPrice.add(price);
            }
            itemCount.set(item, currentItemCount);
        }
        let existingSetup: Setup | undefined;
        for (const setup of data.printedSetups)
            if (setup.name === name) {
                existingSetup = setup;
                break;
            }
        if (existingSetup !== undefined) {
            existingSetup.items = items;
            existingSetup.calculatedPrice = totalPrice.amountPerCurrency;
        } else {
            name = this.truncateSetupName(name);

            data.printedSetups.push({
                name: name,
                area: area,
                items: items,
                autoloads: false,
                alerted: false,
                calculatedPrice: totalPrice.amountPerCurrency,
            });
        }

        Packets.printedSetups.set(data.printedSetups);
        this.setupSaved.fire(player, area);
        return itemCount;
    }

    /**
     * Loads a setup by name for a player, placing items as needed.
     *
     * @param player The player loading the setup.
     * @param area The area ID of the setup.
     * @param name The name of the setup to load.
     * @returns True if loaded successfully, false otherwise.
     */
    loadSetup(player: Player, area: AreaId | undefined, name: string) {
        if (
            !this.permissionsService.hasPermission(player, "build") ||
            !this.permissionsService.hasPermission(player, "purchase")
        ) {
            return false;
        }
        let setup: Setup | undefined;
        const empireData = this.dataService.empireData;
        for (const s of empireData.printedSetups)
            if (s.name === name) {
                setup = s;
                break;
            }
        if (setup === undefined) {
            warn("No such setup", name);
            return false;
        }
        if (setup.area !== area) {
            warn("Setup area mismatch", setup.area, area);
            return false;
        }

        const savedItems = setup.items;
        if (savedItems === undefined) {
            warn(setup);
            return false;
        }

        const items = new Set<PlacingInfo>();
        for (const savedItem of savedItems) {
            const itemId = savedItem.item;
            const item = Items.getItem(itemId);
            if (item === undefined) {
                warn("No such item", itemId);
                continue;
            }

            if (this.itemService.getAvailableAmount(item) <= 0 && this.itemService.serverBuy(item) === false) {
                continue;
            }

            const id = savedItem.uniqueItemId ?? itemId;
            items.add({
                id,
                position: new Vector3(savedItem.posX, savedItem.posY, savedItem.posZ),
                rotation: savedItem.rawRotation ?? 0,
            });
        }
        this.setupLoaded.fire(player, setup.area);
        return (
            this.itemService.waitInQueue(() => {
                return this.itemService.placeItems(player, items);
            }) !== 0
        );
    }

    /**
     * Initializes the SetupService, sets up packet listeners for renaming and autoload toggling.
     */
    onInit() {
        Packets.printedSetups.set(this.dataService.empireData.printedSetups);

        let debounce = 0;

        Packets.saveSetup.fromClient((player, placementId, name) => {
            const printedItem = this.dataService.empireData.items.worldPlaced.get(placementId);
            if (printedItem === undefined) return false;
            const item = Items.getItem(printedItem.item);
            if (item === undefined) return false;
            const printer = item.findTrait("Printer");
            if (printer === undefined) return false;
            if (printer.area === undefined) return false;

            if (tick() - debounce < 1) {
                return false;
            }
            debounce = tick();

            name = TextService.FilterStringAsync(name, player.UserId).GetNonChatStringForBroadcastAsync();
            this.saveSetup(player, printer.area, name);
            return true;
        });
        Packets.loadSetup.fromClient((player, placementId, name) => {
            const placedItem = this.dataService.empireData.items.worldPlaced.get(placementId);
            if (placedItem === undefined) return false;
            const item = Items.getItem(placedItem.item);
            if (item === undefined) return false;
            const printer = item.findTrait("Printer");
            if (printer === undefined) return false;

            if (tick() - debounce < 1) {
                return false;
            }
            debounce = tick();

            return this.loadSetup(player, printer.area, name);
        });

        Packets.renameSetup.fromClient((player, currentName, renameTo) => {
            if (!this.permissionsService.hasPermission(player, "build")) return;
            renameTo = TextService.FilterStringAsync(renameTo, player.UserId).GetNonChatStringForBroadcastAsync();
            renameTo = this.truncateSetupName(renameTo);
            const setups = this.dataService.empireData.printedSetups;
            for (const setup of setups) {
                if (setup.name === currentName) {
                    setup.name = renameTo;
                    break;
                }
            }
            Packets.printedSetups.set(setups);
        });
        Packets.autoloadSetup.fromClient((player, name) => {
            if (!this.permissionsService.hasPermission(player, "build")) return false;
            const setups = this.dataService.empireData.printedSetups;
            let newState: boolean | undefined;
            for (const setup of setups) {
                if (setup.name === name) {
                    newState = !setup.autoloads;
                    setup.autoloads = newState;
                    break;
                }
            }
            Packets.printedSetups.set(setups);
            return newState ?? false;
        });

        this.setupSaved.connect((player, area) =>
            log({
                time: tick(),
                type: "SetupSave",
                player: player.UserId,
                area: area,
            }),
        );
        this.setupLoaded.connect((player, area) =>
            log({
                time: tick(),
                type: "SetupLoad",
                player: player.UserId,
                area: area,
            }),
        );
    }

    onStart() {
        const setups = this.dataService.empireData.printedSetups;
        const cleanup = simpleInterval(() => {
            const balance = this.currencyService.balance;
            for (const setup of setups) {
                if (setup.alerted === false && setup.autoloads === true && balance.canAfford(setup.calculatedPrice)) {
                    setup.alerted = true;
                    this.chatHookService.sendServerMessage(`${setup.name} can now be purchased!`, "color:255,255,127");
                }
            }
        }, 1);
        eat(cleanup);
    }
}
