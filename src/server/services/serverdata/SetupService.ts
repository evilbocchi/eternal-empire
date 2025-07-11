import Signal from "@antivivi/lemon-signal";
import { OnInit, Service } from "@flamework/core";
import { TextService } from "@rbxts/services";
import { DataService } from "server/services/serverdata/DataService";
import { ItemsService } from "server/services/serverdata/ItemsService";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/network/Packets";
import Price from "shared/Price";

@Service()
export class SetupService implements OnInit {

    setupSaved = new Signal<(player: Player, area: AreaId) => void>();
    setupLoaded = new Signal<(player: Player, area: AreaId) => void>();

    constructor(private dataService: DataService, private itemsService: ItemsService) {

    }

    saveSetup(player: Player, area: AreaId, name: string) {
        if (!this.dataService.checkPermLevel(player, "build") || name.size() > 32) {
            return;
        }
        const data = this.dataService.empireData;
        const items = data.items.placed.filter((placedItem) => placedItem.area === area);
        let totalPrice = new Price();
        let itemCount = new Map<Item, number>();
        for (const placedItem of items) {
            const item = Items.getItem(placedItem.item);
            if (item === undefined)
                continue;
            let currentItemCount = (itemCount.get(item) ?? 0) + 1;
            const price = item.pricePerIteration.get(currentItemCount);
            if (price !== undefined)
                totalPrice = totalPrice.add(price);
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
            existingSetup.calculatedPrice = totalPrice.costPerCurrency;
        }
        else {
            data.printedSetups.push({
                name: name,
                area: area,
                items: items,
                autoloads: false,
                alerted: false,
                calculatedPrice: totalPrice.costPerCurrency
            });
        }

        Packets.printedSetups.set(data.printedSetups);
        this.setupSaved.fire(player, area);
        return itemCount;
    }

    loadSetup(player: Player, name: string) {
        if (!this.dataService.checkPermLevel(player, "build")) {
            return false;
        }
        let setup: Setup | undefined;
        for (const s of this.dataService.empireData.printedSetups)
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
        print();
        for (const savedItem of savedItems) {
            const itemId = savedItem.item;
            if (this.itemsService.getItemAmount(itemId) < 1) {
                if (this.itemsService.buyItem(player, itemId) === false)
                    continue;
            }
            this.itemsService.placeItem(player, itemId, new Vector3(savedItem.posX, savedItem.posY, savedItem.posZ), savedItem.rawRotation ?? 0);
        }
        this.setupLoaded.fire(player, setup.area);
        return true;
    }

    onInit() {
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