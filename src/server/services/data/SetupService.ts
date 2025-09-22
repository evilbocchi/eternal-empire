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
import PermissionsService from "server/services/permissions/PermissionsService";
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
    /** Signal fired when a setup is saved. */
    setupSaved = new Signal<(player: Player, area: AreaId) => void>();

    /** Signal fired when a setup is loaded. */
    setupLoaded = new Signal<(player: Player, area: AreaId) => void>();

    constructor(
        private dataService: DataService,
        private chatHookService: ChatHookService,
        private currencyService: CurrencyService,
        private itemService: ItemService,
        private permissionsService: PermissionsService,
    ) {}

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
        if (!this.permissionsService.checkPermLevel(player, "build")) {
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
            // truncate name to 32 characters
            if (name.size() > 32) {
                name = name.sub(1, 32);
            }

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
     * @param name The name of the setup to load.
     * @returns True if loaded successfully, false otherwise.
     */
    loadSetup(player: Player, name: string) {
        if (
            !this.permissionsService.checkPermLevel(player, "build") ||
            !this.permissionsService.checkPermLevel(player, "purchase")
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
        const savedItems = setup.items;
        if (savedItems === undefined) {
            warn(setup);
            return false;
        }

        const items = new Array<PlacingInfo>();
        for (const savedItem of savedItems) {
            const itemId = savedItem.item;
            if (
                this.itemService.getItemAmount(itemId) === 0 &&
                this.itemService.serverBuy(Items.getItem(itemId)!) === false
            ) {
                continue;
            }
            const id = savedItem.uniqueItemId ?? itemId;
            items.push({
                id,
                position: new Vector3(savedItem.posX, savedItem.posY, savedItem.posZ),
                rotation: savedItem.rawRotation ?? 0,
            });
        }
        this.setupLoaded.fire(player, setup.area);
        return this.itemService.waitInQueue(() => {
            return this.itemService.placeItems(player, items);
        });
    }

    /**
     * Initializes the SetupService, sets up packet listeners for renaming and autoload toggling.
     */
    onInit() {
        Packets.printedSetups.set(this.dataService.empireData.printedSetups);

        Packets.renameSetup.fromClient((player, currentName, renameTo) => {
            if (!this.permissionsService.checkPermLevel(player, "build")) return;
            renameTo = TextService.FilterStringAsync(renameTo, player.UserId).GetNonChatStringForBroadcastAsync();
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
            if (!this.permissionsService.checkPermLevel(player, "build")) return;
            const setups = this.dataService.empireData.printedSetups;
            for (const setup of setups) {
                if (setup.name === name) {
                    setup.autoloads = !setup.autoloads;
                    break;
                }
            }
            Packets.printedSetups.set(setups);
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
