import { OnStart, Service } from "@flamework/core";
import { HttpService } from "@rbxts/services";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService, EmpireProfileTemplate } from "server/services/serverdata/DataService";
import { Inventory, ItemsData, PlacedItem } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import { Fletchette, RemoteFunc, RemoteProperty, RemoteSignal, Signal } from "@antivivi/fletchette";
import { OnoeNum } from "@antivivi/serikanum";

declare global {
    interface FletchetteCanisters {
        ItemsCanister: typeof ItemsCanister;
    }
}

export const ItemsCanister = Fletchette.createCanister("ItemsCanister", {
    items: new RemoteProperty<ItemsData>(EmpireProfileTemplate.items),
    placedItems: new RemoteProperty<PlacedItem[]>([]),
    buyItem: new RemoteFunc<(itemId: string) => boolean>(),
    buyAllItems: new RemoteFunc<(shopId: string) => boolean>(),
    placeItem: new RemoteFunc<(itemId: string, position: Vector3, rotation: number) => [boolean, number?]>(),
    moveItem: new RemoteFunc<(placementId: string, position: Vector3, rotation: number) => [boolean, number?]>(),
    unplaceItems: new RemoteSignal<(placementIds: string[]) => void>(),
    multiplierPerItem: new RemoteProperty<Map<string, OnoeNum>>(new Map(), false),
});

@Service()
export class ItemsService implements OnStart {

    itemsBought = new Signal<(player: Player, items: Item[]) => void>();
    placedItemsUpdated = new Signal<(...placedItems: PlacedItem[]) => void>();
    modelPerPlacedItem = new Map<PlacedItem, Model>();

    constructor(private dataService: DataService, private currencyService: CurrencyService) {

    }

    getItems() {
        return this.dataService.empireProfile?.Data.items ?? EmpireProfileTemplate.items;
    }

    setItems(itemsData: ItemsData) {
        if (this.dataService.empireProfile !== undefined) {
            this.dataService.empireProfile.Data.items = itemsData;
            ItemsCanister.items.set(itemsData);
        }
    }

    getInventory() {
        return this.getItems().inventory;
    }

    setInventory(inventory: Inventory) {
        const items = this.getItems();
        items.inventory = inventory;
        this.setItems(items);
    }

    getItemAmount(itemId: string) {
        return this.getInventory().get(itemId) ?? 0;
    }

    setItemAmount(itemId: string, amount: number) {
        const inventory = this.getInventory();
        inventory.set(itemId, amount);
        this.setInventory(inventory);
    }

    getBought() {
        return this.getItems().bought;
    }

    setBought(bought: Inventory) {
        const items = this.getItems();
        items.bought = bought;
        this.setItems(items);
    }

    getBoughtAmount(itemId: string) {
        return this.getBought().get(itemId) ?? 0;
    }

    setBoughtAmount(itemId: string, amount: number) {
        const bought = this.getBought();
        bought.set(itemId, amount);
        this.setBought(bought);
    }

    getPlacedItems() {
        return this.getItems().placed;
    }

    setPlacedItems(placedItems: PlacedItem[]) {
        const items = this.getItems();
        items.placed = placedItems;
        this.setItems(items);
        this.placedItemsUpdated.fire(...placedItems);
    }

    serverBuy(item: Item) {
        for (const [required, amount] of item.requiredItems) {
            if (this.getItemAmount(required.id) < amount) {
                return false;
            }
        }
        const itemId = item.id;
        const price = item.getPrice(this.getBoughtAmount(itemId) + 1);    
        const success = price ? this.currencyService.purchase(price) : price;
        if (success === true) {
            for (const [required, amount] of item.requiredItems) {
                this.setItemAmount(required.id, this.getItemAmount(required.id) - amount);
            }
            this.setBoughtAmount(itemId, this.getBoughtAmount(itemId) + 1);
            this.setItemAmount(itemId, this.getItemAmount(itemId) + 1);
        }
        return success ? success : false;
    }

    buyItem(player: Player, itemId: string) {
        if (!this.dataService.checkPermLevel(player, "purchase")) {
            return false;
        }
        const item = Items.getItem(itemId);
        if (item === undefined)
            return false;

        const success = this.serverBuy(item);
        if (success) {
            this.itemsBought.fire(player, [item]);
        }
        return success;
    }

    buyAllItems(player: Player, shopId: string) {
        if (!this.dataService.checkPermLevel(player, "purchase"))
            return false;
        const shop = Items.getItem(shopId);
        if (shop === undefined || !shop.isA("Shop"))
            return false;
        const items = shop.items;
        let oneSucceeded = false;
        const bought = new Array<Item>();
        for (const item of items) {
            if (this.serverBuy(item) === true) {
                oneSucceeded = true;
                bought.push(item);
            }
        }
        this.itemsBought.fire(player, bought);
        return oneSucceeded;
    }

    nextId() {
        const profile = this.dataService.empireProfile;
        if (profile === undefined)
            return HttpService.GenerateGUID(false);
        else
            return tostring(++profile.Data.items.nextId);
    }

    onStart() {
        ItemsCanister.buyItem.onInvoke((player, itemId) => this.buyItem(player, itemId));
        ItemsCanister.buyAllItems.onInvoke((player, shopId) => this.buyAllItems(player, shopId));
        this.dataService.empireProfileLoaded.connect((profile) => ItemsCanister.items.set(profile.Data.items));
        ItemsCanister.items.set(this.getItems());
    }
}