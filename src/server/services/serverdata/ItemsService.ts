import { OnStart, Service } from "@flamework/core";
import Signal from "@rbxutil/signal";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { Inventory, ItemsData, PlacedItem } from "shared/constants";
import Items from "shared/item/Items";
import { Fletchette, RemoteFunc, RemoteProperty } from "shared/utils/fletchette";

declare global {
    interface FletchetteCanisters {
        ItemsCanister: typeof ItemsCanister;
    }
}

const defaultItems = {
    inventory: new Map<string, number>(),
    bought: new Map<string, number>(),
    placed: [],
};

export const ItemsCanister = Fletchette.createCanister("ItemsCanister", {
    items: new RemoteProperty<ItemsData>(defaultItems),
    placedItems: new RemoteProperty<PlacedItem[]>([]),
    buyItem: new RemoteFunc<(itemId: string) => boolean>(),
    placeItem: new RemoteFunc<(itemId: string, position: Vector3, rotation: number) => [boolean, number?]>(),
    moveItem: new RemoteFunc<(placementId: string, position: Vector3, rotation: number) => [boolean, number?]>(),
    unplaceItem: new RemoteFunc<(placementId: string) => [boolean, string | undefined]>(),
});

@Service()
export class ItemsService implements OnStart {

    inventoryChanged = new Signal<Inventory>();
    boughtUpdated = new Signal<Inventory>();
    placedItemsUpdated = new Signal<PlacedItem[]>()
    modelPerPlacedItem = new Map<PlacedItem, Model>();

    constructor(private dataService: DataService, private currencyService: CurrencyService) {

    }

    getItems() {
        return this.dataService.empireProfile?.Data.items ?? defaultItems;
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
        this.inventoryChanged.Fire(inventory);
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
        this.boughtUpdated.Fire(bought);
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
        this.placedItemsUpdated.Fire(...placedItems);
    }

    buyItem(itemId: string) {
        const item = Items.getItem(itemId);
        if (item === undefined)
            return false;
        const price = item.getPrice(this.getBoughtAmount(itemId) + 1);
        const success = price ? this.currencyService.purchase(price) : price;
        if (success === true) {
            this.setBoughtAmount(itemId, this.getBoughtAmount(itemId) + 1);
            this.setItemAmount(itemId, this.getItemAmount(itemId) + 1);
        }
        return success ? success : false;
    }

    onStart() {
        ItemsCanister.buyItem.onInvoke((_player, itemId) => this.buyItem(itemId));
        this.dataService.empireProfileLoaded.Connect((profile) => ItemsCanister.items.set(profile.Data.items));
        ItemsCanister.items.set(this.getItems());
    }
}