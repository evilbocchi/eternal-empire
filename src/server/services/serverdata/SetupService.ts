//!native
//!optimize 2

import Signal from "@antivivi/lemon-signal";
import { OnInit, Service } from "@flamework/core";
import { TextService } from "@rbxts/services";
import { DataService } from "server/services/serverdata/DataService";
import { ItemsService } from "server/services/serverdata/ItemsService";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import CurrencyBundle from "shared/currency/CurrencyBundle";

@Service()
export class SetupService implements OnInit {

    setupSaved = new Signal<(player: Player, area: AreaId) => void>();
    setupLoaded = new Signal<(player: Player, area: AreaId) => void>();

    constructor(private dataService: DataService, private itemsService: ItemsService) {

    }

    saveSetup(player: Player, area: AreaId, name: string) {
        if (!this.dataService.checkPermLevel(player, "build")) {
            return;
        }
        const data = this.dataService.empireData;
        const items = new Array<PlacedItem>();
        for (const [_, placedItem] of data.items.worldPlaced)
            if (placedItem.area === area)
                items.push(placedItem);
        let totalPrice = new CurrencyBundle();
        let itemCount = new Map<Item, number>();
        for (const placedItem of items) {
            const item = Items.getItem(placedItem.item);
            if (item === undefined)
                continue;
            let currentItemCount = (itemCount.get(item) ?? 0) + 1;
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
        }
        else {
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
                calculatedPrice: totalPrice.amountPerCurrency
            });
        }

        Packets.printedSetups.set(data.printedSetups);
        this.setupSaved.fire(player, area);
        return itemCount;
    }

    loadSetup(player: Player, name: string) {
        if (!this.dataService.checkPermLevel(player, "build") || !this.dataService.checkPermLevel(player, "purchase")) {
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
            if (this.itemsService.getItemAmount(itemId) === 0 && this.itemsService.serverBuy(Items.getItem(itemId)!, true) === false) {
                continue;
            }
            items.push({
                itemId,
                position: new Vector3(savedItem.posX, savedItem.posY, savedItem.posZ),
                rotation: savedItem.rawRotation ?? 0
            });
        }
        this.setupLoaded.fire(player, setup.area);
        return this.itemsService.waitInQueue(() => {
            return this.itemsService.placeItems(player, items);
        });
    }

    onInit() {
        Packets.printedSetups.set(this.dataService.empireData.printedSetups);

        Packets.renameSetup.listen((player, currentName, renameTo) => {
            if (!this.dataService.checkPermLevel(player, "build"))
                return;
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
        Packets.autoloadSetup.listen((player, name) => {
            if (!this.dataService.checkPermLevel(player, "build"))
                return;
            const setups = this.dataService.empireData.printedSetups;
            for (const setup of setups) {
                if (setup.name === name) {
                    setup.autoloads = !setup.autoloads;
                    break;
                }
            }
            Packets.printedSetups.set(setups);
        });
    }
}