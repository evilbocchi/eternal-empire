//!native
//!optimize 2

import Signal from "@antivivi/lemon-signal";
import { OnInit, OnStart, Service } from "@flamework/core";
import { CollectionService, Workspace } from "@rbxts/services";
import { CHALLENGES } from "server/Challenges";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { AREAS } from "shared/Area";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";
import BuildBounds from "shared/placement/BuildBounds";
import ItemPlacement from "shared/placement/ItemPlacement";

declare global {
    /** A {@link PlacedItem} that has an associated placement ID. */
    interface IdPlacedItem extends PlacedItem {
        id: string;
    }
}

const baseplateBounds = Sandbox.createBaseplateBounds(); // cached for performance

const queue = new Array<() => void>();

@Service()
export class ItemsService implements OnInit, OnStart {

    itemsPlaced = new Signal<(player: Player, placedItems: IdPlacedItem[]) => void>();
    itemsUnplaced = new Signal<(player: Player, placedItems: PlacedItem[]) => void>();
    itemsBought = new Signal<(player: Player | undefined, items: Item[]) => void>();
    placedItemsUpdated = new Signal<(placedItems: Map<string, PlacedItem>) => void>();
    modelPerPlacedItem = new Map<PlacedItem, Model>();
    isRendering = (() => {
        const isRendering = this.dataService.empireId === "RENDER";
        if (isRendering === true)
            print("Rendering set to true. Will not spawn item models.");
        return isRendering;
    })();

    constructor(private dataService: DataService, private currencyService: CurrencyService) {

    }

    setItems(itemsData: ItemsData, silent?: boolean) {
        this.dataService.empireData.items = itemsData;
        if (silent !== true) {
            Packets.inventory.set(itemsData.inventory);
            Packets.bought.set(itemsData.bought);
        }
    }

    setInventory(inventory: Inventory, silent?: boolean) {
        const items = this.dataService.empireData.items;
        items.inventory = inventory;
        this.setItems(items, silent);
    }

    getItemAmount(itemId: string) {
        return this.dataService.empireData.items.inventory.get(itemId) ?? 0;
    }

    setItemAmount(itemId: string, amount: number, silent?: boolean) {
        const inventory = this.dataService.empireData.items.inventory;
        inventory.set(itemId, amount);
        this.setInventory(inventory, silent);
    }

    setBought(bought: Inventory, silent?: boolean) {
        const items = this.dataService.empireData.items;
        items.bought = bought;
        this.setItems(items, silent);
    }

    getBoughtAmount(itemId: string) {
        return this.dataService.empireData.items.bought.get(itemId) ?? 0;
    }

    setBoughtAmount(itemId: string, amount: number, silent?: boolean) {
        const bought = this.dataService.empireData.items.bought;
        bought.set(itemId, amount);
        if (silent !== true)
            this.setBought(bought);
    }

    setPlacedItems(placedItems: Map<string, PlacedItem>, silent?: boolean) {
        const items = this.dataService.empireData.items;
        items.worldPlaced = placedItems;
        this.setItems(items, silent);
        if (silent !== true) {
            this.placedItemsUpdated.fire(placedItems);
            Packets.placedItems.set(placedItems);
        }
    }

    /**
     * Removes the specified placement ids from the setup and increments the inventory's item
     * amount accordingly.
     * 
     * @param player Player that performed the unplacing
     * @param placementIds List of placement ids
     * @returns List of unplaced items. If nothing happened, this will be undefined.
     */
    unplaceItems(player: Player, placementIds: string[]): PlacedItem[] | undefined {
        if (!this.dataService.checkPermLevel(player, "build"))
            return undefined;
        const unplacing = new Array<PlacedItem>();
        const placedItems = this.dataService.empireData.items.worldPlaced;
        let somethingHappened = false;
        for (const placementId of placementIds) {
            somethingHappened = true;
            const model = PLACED_ITEMS_FOLDER.FindFirstChild(placementId);
            if (model !== undefined) {
                model.Destroy();
            }
            const placedItem = placedItems.get(placementId);
            if (placedItem !== undefined) {
                unplacing.push(placedItem);
                placedItems.delete(placementId);
            }
        }
        if (somethingHappened === false) {
            return undefined;
        }
        this.setPlacedItems(placedItems);
        for (const placedItem of unplacing) {
            const item = placedItem.item;
            this.setItemAmount(item, this.getItemAmount(item) + 1);
        }
        this.itemsUnplaced.fire(player, unplacing);
        return unplacing;
    }

    /**
     * Clones an item model for the specified placed item into the setup.
     * If an existing item model for that placed item already exists, returns false.
     * 
     * @param placedItem Placed item to add an item model for
     * @returns The model that was added, or undefined if it already exists.
     */
    addItemModel(placementId: string, placedItem: PlacedItem) {
        if (PLACED_ITEMS_FOLDER.FindFirstChild(placementId) !== undefined || this.isRendering === true)
            return;

        const item = Items.getItem(placedItem.item);
        if (item === undefined) {
            warn("Cannot find item " + placedItem.item);
            return;
        }

        const model = item.MODEL?.Clone();
        if (model === undefined) {
            warn("Cannot find model for item " + placedItem.item);
            return;
        }

        model.PivotTo(new CFrame(placedItem.posX, placedItem.posY, placedItem.posZ)
            .mul(CFrame.Angles(math.rad(placedItem.rotX), math.rad(placedItem.rotY), math.rad(placedItem.rotZ))));
        model.Name = placementId;
        model.SetAttribute("Area", placedItem.area);
        model.SetAttribute("ItemId", item.id);
        model.SetAttribute("ItemName", item.name);
        model.SetAttribute("Rotation", placedItem.rawRotation);
        model.Parent = PLACED_ITEMS_FOLDER;
        item.LOADS.forEach((callback) => callback(model, item));
        return model;
    }

    /**
     * Places items into the setup.
     * This is a wrapper for {@link serverPlace}, additionally handling replication and firing the {@link itemsPlaced} signal.
     * Checks for permissions and area validity.
     * 
     * @param player Player that performed the placing
     * @param items List of items to place
     * @returns 0 if no items were placed, 1 if items were placed, 2 if items were placed and is allowed to place the same item again
     */
    placeItems(player: Player, items: PlacingInfo[]) {
        if (!this.dataService.checkPermLevel(player, "build")) {
            return 0;
        }

        let area: AreaId | undefined;
        if (baseplateBounds === undefined) { // normal placement
            area = player.GetAttribute("Area") as AreaId | undefined;
            if (area === undefined)
                return 0;
        }

        let overallSuccess = true;
        let i = 0;
        let totalAmount = 0;
        const placedItems = new Array<IdPlacedItem>();
        for (const item of items) {
            const [placedItem, amount] = this.serverPlace(item.itemId, item.position, item.rotation, area);
            if (placedItem !== undefined) {
                totalAmount += amount!;
                placedItems.push(placedItem);
            }
            else
                overallSuccess = false;
            i++;
        }
        this.itemsPlaced.fire(player, placedItems);
        const itemsData = this.dataService.empireData.items;
        Packets.inventory.set(itemsData.inventory);
        Packets.placedItems.set(itemsData.worldPlaced);

        if (i === 0 || overallSuccess === false)
            return 0;
        if (i === 1)
            return totalAmount === 0 ? 1 : 2;
        return 1;
    }

    /**
     * Places an item into the setup. At least 1 of this item needs to exist in the inventory.
     * This also automatically adds the item model into the setup.
     * 
     * This does *not* replicate the changes to the client, nor fires the {@link itemsPlaced} signal.
     * 
     * @param itemId Item id to place
     * @param position Position of the PrimaryPart of the item model to place in.
     * @param rotation Rotation, in degrees, to rotate the item.
     * @returns A tuple for the placed item and the remaining item count in the inventory
     */
    serverPlace(itemId: string, position: Vector3, rotation: number, areaId?: AreaId): LuaTuple<[IdPlacedItem?, number?]> {
        const empireData = this.dataService.empireData;
        const items = empireData.items;
        const itemAmount = items.inventory.get(itemId);

        rotation %= 360;

        if (itemAmount === undefined || itemAmount < 1 || rotation % 90 !== 0) {
            return $tuple(undefined);
        }

        const placedItems = items.worldPlaced;
        const item = Items.getItem(itemId);
        if (item === undefined)
            throw "How did this happen?";

        if (item.levelReq !== undefined && item.levelReq > empireData.level)
            return $tuple(undefined);

        if (empireData.currentChallenge !== undefined) {
            const challenge = CHALLENGES[empireData.currentChallenge as ChallengeId];
            if (challenge !== undefined && challenge.restrictItems !== undefined && challenge.restrictItems(item)) {
                return $tuple(undefined);
            }
        }

        let buildBounds: BuildBounds | undefined;

        if (baseplateBounds === undefined) { // normal placement
            if (areaId === undefined)
                return $tuple(undefined);

            const area = item.bounds === undefined ? ItemPlacement.getAreaOfPosition(position, item.placeableAreas) : AREAS[areaId];
            if (area === undefined || area.buildBounds === undefined)
                return $tuple(undefined);

            areaId = area.id;
            buildBounds = area.buildBounds;
        }
        else {
            buildBounds = baseplateBounds;
            areaId = AREAS.BarrenIslands.id;
        }

        const model = item.MODEL?.Clone();
        if (model === undefined)
            throw "No model found for " + itemId;

        const primaryPart = model.PrimaryPart!;

        let cframe = buildBounds.snap(primaryPart.Size, position, math.rad(rotation));
        if (cframe === undefined)
            return $tuple(undefined);

        if (!buildBounds.isInside(cframe.Position)) {
            cframe = cframe.sub(new Vector3(0, primaryPart.Size.Y / 2, 0));
        }

        model.PivotTo(cframe);

        if (ItemPlacement.isTouchingPlacedItem(model))
            return $tuple(undefined);

        if (baseplateBounds === undefined && !ItemPlacement.isInPlaceableArea(model, item))
            return $tuple(undefined);

        const [rotX, rotY, rotZ] = cframe.ToOrientation();
        const nextId = this.nextId();
        const placedItem: IdPlacedItem = {
            item: itemId,
            posX: cframe.X,
            posY: cframe.Y,
            posZ: cframe.Z,
            rotX: math.deg(rotX),
            rotY: math.deg(rotY),
            rotZ: math.deg(rotZ),
            rawRotation: rotation,
            direction: undefined,
            area: areaId,
            id: nextId,
        };
        placedItems.set(nextId, placedItem);
        this.addItemModel(nextId, placedItem);
        this.setPlacedItems(placedItems, true);
        this.setItemAmount(itemId, itemAmount - 1, true);
        return $tuple(placedItem, itemAmount - 1);
    }

    /**
     * Searches through all placed items and checks if their models exist in the workspace. If not, add them.
     * If any models belong in the workspace but no placed item corresponds, remove them.
     */
    fullUpdatePlacedItemsModels() {
        const placedItems = this.dataService.empireData.items.worldPlaced;
        for (const model of PLACED_ITEMS_FOLDER.GetChildren()) {
            if (!placedItems.has(model.Name)) {
                model.Destroy();
            }
        }
        for (const [placementId, placedItem] of placedItems)
            this.addItemModel(placementId, placedItem);
    }

    /**
     * Purchases the item, spending currency.
     * 
     * @param item Item to purchase.
     * @param silent Whether to suppress changes to the client.
     * @returns Whether the purchase was successful.
     */
    serverBuy(item: Item, silent?: boolean) {
        for (const [required, amount] of item.requiredItems) {
            if (this.getItemAmount(required.id) < amount) {
                return false;
            }
        }
        if (item.isA("HarvestingTool") && item.levelReq !== undefined && item.levelReq > this.dataService.empireData.level)
            return false;
        const itemId = item.id;
        const nextBought = this.getBoughtAmount(itemId) + 1;
        const price = item.getPrice(nextBought);
        if (price === undefined)
            return false;

        const success = this.currencyService.purchase(price);
        if (success === true) {
            for (const [required, amount] of item.requiredItems) {
                this.setItemAmount(required.id, this.getItemAmount(required.id) - amount, silent);
            }
            this.setBoughtAmount(itemId, nextBought, silent);
            // this is different
            this.setItemAmount(itemId, this.getItemAmount(itemId) + 1, silent);
        }
        return success;
    }

    buyItem(player: Player | undefined, itemId: string, silent?: boolean) {
        if (player !== undefined && !this.dataService.checkPermLevel(player, "purchase")) {
            return false;
        }
        const item = Items.getItem(itemId);
        if (item === undefined)
            return false;

        const success = this.serverBuy(item, silent);
        if (success) {
            this.itemsBought.fire(player, [item]);
        }
        return success;
    }

    buyAllItems(player: Player, itemIds: string[]) {
        if (!this.dataService.checkPermLevel(player, "purchase"))
            return false;

        let oneSucceeded = false;
        const bought = new Array<Item>();
        for (const itemId of itemIds) {
            const item = Items.getItem(itemId);
            if (item === undefined)
                continue;
            if (this.serverBuy(item) === true) {
                oneSucceeded = true;
                bought.push(item);
            }
        }
        this.itemsBought.fire(player, bought);
        return oneSucceeded;
    }

    nextId() {
        return tostring(++this.dataService.empireData.items.nextId);
    }

    /**
     * Gets the PlacedItem object directly linked to the empire's Profile.
     * 
     * @param placementId The placement UUID for the PlacedItem
     * @returns A mutable PlacedItem object that can be used to modify data
     */
    getPlacedItem(placementId: string) {
        return this.dataService.empireData.items.worldPlaced.get(placementId);
    }

    refreshEffects() {
        const particlesEnabled = this.dataService.empireData.particlesEnabled;
        const effects = CollectionService.GetTagged("Effect");
        for (const effect of effects) {
            if (effect !== undefined) {
                (effect as Toggleable).Enabled = particlesEnabled;
            }
        }
    }

    addMapItems() {
        let i = 0;
        for (const waypoint of CollectionService.GetTagged("MapItem")) {
            if (!waypoint.IsA("BasePart"))
                continue;
            const item = Items.getItem(waypoint.Name);
            if (item === undefined)
                throw `Item ${waypoint.Name} not found`;
            const model = this.addItemModel(`wm${i}`, {
                item: item.id,
                posX: waypoint.Position.X,
                posY: waypoint.Position.Y,
                posZ: waypoint.Position.Z,
                rotX: waypoint.Rotation.X,
                rotY: waypoint.Rotation.Y,
                rotZ: waypoint.Rotation.Z,
            });
            if (model !== undefined)
                model.Parent = Workspace;
            else
                warn(`Model for ${item.id} not found`);

            i++;
        }
    }

    /**
     * Waits for the specified callback to finish before returning its value.
     * This is used to prevent race conditions when placing items.
     * 
     * @param callback The callback to wait for
     * @returns The value returned by the callback
     */
    waitInQueue(callback: () => number) {
        queue.push(callback);
        while (task.wait()) {
            if (queue.indexOf(callback) === 0)
                break;
        }
        const value = callback();
        queue.remove(0);
        return value;
    }

    onInit() {
        this.refreshEffects();

        Packets.buyItem.onInvoke((player, itemId) => this.buyItem(player, itemId));
        Packets.buyAllItems.onInvoke((player, itemIds) => this.buyAllItems(player, itemIds));
        Packets.inventory.set(this.dataService.empireData.items.inventory);
        Packets.bought.set(this.dataService.empireData.items.bought);
        Packets.placedItems.set(this.dataService.empireData.items.worldPlaced);

        Packets.placeItems.onInvoke((player, items) => {
            return this.waitInQueue(() => {
                return this.placeItems(player, items);
            });
        });
        Packets.unplaceItems.listen((player, placementIds) => {
            return this.waitInQueue(() => {
                this.unplaceItems(player, placementIds);
                return 1;
            });
        });

        let itemCount = 0;
        Items.itemsPerId.forEach((item) => {
            item.INITALIZES.forEach((callback) => callback(item));
            ++itemCount;
        });
        print("Initialized " + itemCount + " items.");
        
        this.fullUpdatePlacedItemsModels();

        this.placedItemsUpdated.connect((placedItems) => {
            for (const [placementId, placedItem] of placedItems) {
                this.addItemModel(placementId, placedItem);
            }
        });
    }

    onStart() {
        

        this.addMapItems();
    }
}