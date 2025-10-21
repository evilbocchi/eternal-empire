//!native
//!optimize 2

/**
 * @fileoverview Core item management system for the game.
 *
 * This service handles:
 * - Item inventory management (buying, placing, unplacing)
 * - Item model creation and positioning in the world
 * - Item placement validation and collision detection
 * - Purchase transactions with currency integration
 * - Item permissions and restrictions
 * - World synchronization between server and clients
 *
 * The service manages both the logical item data (inventory, placed items) and
 * the physical 3D models that represent items in the game world.
 *
 * @since 1.0.0
 */

import Signal from "@antivivi/lemon-signal";
import { getAllInstanceInfo, simpleInterval, variableInterval } from "@antivivi/vrldk";
import { OnInit, OnStart, Service } from "@flamework/core";
import { HttpService } from "@rbxts/services";
import { CHALLENGES } from "server/Challenges";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import { OnGameAPILoaded } from "server/services/ModdingService";
import { log } from "server/services/permissions/LogService";
import PermissionsService from "server/services/permissions/PermissionsService";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import {
    applyRepairBoostToItem,
    clearRepairBoostFromModel,
    isProtectionTier,
    REPAIR_PROTECTION_DURATIONS,
    RepairProtectionState,
    RepairResultTier,
} from "shared/item/repair";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import BuildBounds from "shared/placement/BuildBounds";
import ItemPlacement from "shared/placement/ItemPlacement";
import Sandbox from "shared/Sandbox";
import { AREAS } from "shared/world/Area";

declare global {
    /** A {@link PlacedItem} that has an associated placement ID. */
    interface IdPlacedItem extends PlacedItem {
        /** Unique identifier for this placed item instance. */
        id: string;
    }
}

/** Cached baseplate bounds for performance optimization in sandbox mode. */
const baseplateBounds = Sandbox.createBaseplateBounds();

/** Queue for serializing item placement operations to prevent race conditions. */
const queue = new Array<() => void>();

type ItemInstanceInfo = InstanceInfo & {
    PlacementId?: string;
};

/**
 * Core service for managing items, inventory, and item placement in the game world.
 *
 * Handles the complete item lifecycle from purchase to placement to removal,
 * including 3D model management and world synchronization.
 */
@Service()
export default class ItemService implements OnInit, OnStart, OnGameAPILoaded {
    /**
     * Map of placement IDs to their corresponding 3D models in the world.
     */
    readonly modelPerPlacementId = new Map<string, Model>();

    private readonly brokenPlacedItems: Set<string>;
    private readonly repairProtection: Map<string, RepairProtectionState>;
    private readonly worldPlaced: Map<string, PlacedItem>;
    private readonly bought: Map<string, number>;
    private readonly inventory: Map<string, number>;
    private readonly uniqueInstances: Map<string, UniqueItemInstance>;
    private readonly researching: Map<string, number>;
    private readonly shopsPerItem = new Map<string, Item[]>();
    private hasInventoryChanged = false;
    private hasBoughtChanged = false;
    private readonly changedPlacedItems = new Map<string, PlacedItem>();
    private readonly deletedPlacedItems = new Set<string>();
    private readonly changedUniqueInstances = new Map<string, UniqueItemInstance>();
    private readonly deletedUniqueInstances = new Set<string>();
    breakdownsEnabled = true;

    // Signals

    /**
     * Fired when items are successfully placed in the world.
     * @param player The player who placed the items.
     * @param placedItems Array of items that were placed with their IDs.
     */
    readonly itemsPlaced = new Signal<(player: Player | undefined, placedItems: Set<IdPlacedItem>) => void>();

    /**
     * Fired when items are removed from the world.
     * @param player The player who removed the items.
     * @param placedItems Array of items that were removed.
     */
    readonly itemsUnplaced = new Signal<(player: Player | undefined, placedItems: Set<PlacedItem>) => void>();

    /**
     * Fired when items are purchased from the shop.
     * @param player The player who bought the items (undefined for system purchases).
     * @param items Array of items that were bought.
     */
    readonly itemsBought = new Signal<(player: Player | undefined, items: Set<Item>) => void>();

    /**
     * Fired when an item is given to the empire (e.g. via admin command or quest reward).
     * @param item The item that was given.
     * @param amount The amount of the item given.
     */
    readonly itemGiven = new Signal<(item: Item, amount: number) => void>();

    /**
     * Fired when the placed items collection is updated.
     * @param placedItems The updated map of placed items.
     */
    readonly placedItemsUpdated = new Signal<(placedItems: Map<string, PlacedItem>) => void>();

    // Configuration

    /**
     * Whether the service is in rendering mode (no 3D models created).
     * Used for headless operations and testing.
     */
    readonly IS_RENDERING = (() => {
        const isRendering = this.dataService.empireId === "RENDER";
        if (isRendering === true) print("Rendering set to true. Will not spawn item models.");
        return isRendering;
    })();

    constructor(
        private readonly currencyService: CurrencyService,
        private readonly dataService: DataService,
        private readonly permissionsService: PermissionsService,
    ) {
        this.worldPlaced = dataService.empireData.items.worldPlaced;
        this.brokenPlacedItems = dataService.empireData.items.brokenPlacedItems;
        this.repairProtection = dataService.empireData.items.repairProtection;
        this.inventory = dataService.empireData.items.inventory;
        this.bought = dataService.empireData.items.bought;
        this.uniqueInstances = dataService.empireData.items.uniqueInstances;
        this.researching = dataService.empireData.items.researching;
    }

    private getShopsSellingItem(item: Item) {
        let shops = this.shopsPerItem.get(item.id);
        if (shops !== undefined) {
            return shops;
        }

        shops = new Array<Item>();
        for (const [, candidate] of Items.itemsPerId) {
            const shopTrait = candidate.findTrait("Shop");
            if (shopTrait !== undefined && shopTrait.items.has(item)) {
                shops.push(candidate);
            }
        }

        this.shopsPerItem.set(item.id, shops);
        return shops;
    }

    private hasUnlockedRequiredShop(item: Item) {
        const shops = this.getShopsSellingItem(item);
        if (shops.isEmpty()) {
            return true;
        }

        const pricedShops = new Array<Item>();
        for (const shop of shops) {
            if (shop.getPrice(1) !== undefined) {
                pricedShops.push(shop);
            }
        }

        if (pricedShops.isEmpty() || pricedShops.isEmpty() !== shops.isEmpty()) {
            return true;
        }

        for (const shop of pricedShops) {
            if (this.getBoughtAmount(shop.id) > 0) {
                return true;
            }
        }

        print(`Item ${item.id} requires a shop to be unlocked.`);
        return false;
    }

    /**
     * Gets the current amount of an item in inventory.
     *
     * @param itemId The ID of the item to check.
     * @returns The amount of the item in inventory, or 0 if not found.
     */
    getItemAmount(itemId: string) {
        return this.inventory.get(itemId) ?? 0;
    }

    /**
     * Gets the amount of an item that is currently reserved for research.
     *
     * @param itemId The ID of the item to check.
     * @returns The amount of the item currently being researched.
     */
    getResearchingAmount(itemId: string) {
        return this.researching.get(itemId) ?? 0;
    }

    /**
     * Gets the current amount of an item that is available for placement/usage.
     * This subtracts any units currently being researched from the inventory total.
     *
     * @param itemId The ID of the item to check.
     * @returns The amount of the item available for placement or consumption.
     */
    getAvailableItemAmount(itemId: string) {
        const total = this.getItemAmount(itemId);
        const researching = this.getResearchingAmount(itemId);
        return math.max(total - researching, 0);
    }

    /**
     * Sets the amount of a specific item in inventory.
     *
     * @param itemId The ID of the item to set.
     * @param amount The new amount to set.
     */
    setItemAmount(itemId: string, amount: number) {
        this.inventory.set(itemId, amount);
        this.hasInventoryChanged = true;
    }

    /**
     * Gets the number of times an item has been bought.
     *
     * @param itemId The ID of the item to check.
     * @returns The number of times the item has been bought, or 0 if never bought.
     */
    getBoughtAmount(itemId: string) {
        return this.bought.get(itemId) ?? 0;
    }

    /**
     * Sets the number of times an item has been bought.
     *
     * @param itemId The ID of the item to set.
     * @param amount The new bought amount.
     */
    setBoughtAmount(itemId: string, amount: number) {
        this.bought.set(itemId, amount);
        this.hasBoughtChanged = true;
    }

    /**
     * Creates a new unique item instance from the given base item.
     *
     * @param baseItemId The ID of the base item to create a unique instance from.
     * @param allPots Optional parameter to specify a fixed value for all pots (0-100).
     * @returns The UUID of the created unique item instance, or undefined if the item doesn't support unique instances.
     */
    createUniqueInstance(baseItemId: string, allPots?: number): string | undefined {
        const baseItem = Items.getItem(baseItemId);
        if (!baseItem) {
            warn(`Base item with ID ${baseItemId} not found.`);
            return undefined;
        }

        const uniqueTrait = baseItem.findTrait("Unique");
        if (!uniqueTrait) {
            warn(`Item ${baseItemId} does not support unique instances.`);
            return undefined;
        }

        const instance = uniqueTrait.generateInstance(allPots);
        const uuid = HttpService.GenerateGUID(false);
        this.uniqueInstances.set(uuid, instance);
        this.changedUniqueInstances.set(uuid, instance);
        return uuid;
    }

    /**
     * Gives an item to the empire, either as a unique instance or as a normal item.
     *
     * @param itemId The ID of the item to give.
     * @param amount The amount of the item to give (default is 1).
     */
    giveItem(itemId: string, amount = 1) {
        const item = Items.getItem(itemId);
        if (item === undefined) {
            warn(`Item ${itemId} not found.`);
            return;
        }

        if (item.isA("Unique")) {
            for (let i = 0; i < amount; i++) {
                this.createUniqueInstance(itemId);
            }
        } else {
            const currentAmount = this.getItemAmount(itemId);
            this.setItemAmount(itemId, currentAmount + amount);
        }
        this.itemGiven.fire(item, amount);
    }

    // Item Placement Methods

    /**
     * Removes the specified placement ids from the setup and increments the inventory's item
     * amount accordingly.
     *
     * @param player Player that performed the unplacing
     * @param placementIds List of placement ids
     * @returns Set of unplaced items. If nothing happened, this will be undefined.
     */
    unplaceItems(player: Player | undefined, placementIds: Set<string>): Set<PlacedItem> | undefined {
        if (player !== undefined && !this.permissionsService.checkPermLevel(player, "build")) {
            return undefined;
        }
        const unplacing = new Set<PlacedItem>();
        const placedItems = this.worldPlaced;

        let somethingHappened = false;
        for (const placementId of placementIds) {
            // Sanity check: does the placed item exist?
            const placedItem = placedItems.get(placementId);
            if (placedItem === undefined) continue;

            // Prevent unplacing if item is broken
            if (this.brokenPlacedItems.has(placementId)) continue;

            // Destroy model if it exists
            somethingHappened = true;
            const model = this.modelPerPlacementId.get(placementId);
            if (model !== undefined) {
                model.Destroy();
                this.modelPerPlacementId.delete(placementId);
            }
            unplacing.add(placedItem);
            placedItems.delete(placementId);
            this.repairProtection.delete(placementId);
            this.deletedPlacedItems.add(placementId);
        }
        if (somethingHappened === false) {
            return undefined;
        }
        for (const placedItem of unplacing) {
            const item = placedItem.item;
            const uuid = placedItem.uniqueItemId;
            if (uuid === undefined) {
                this.setItemAmount(item, this.getItemAmount(item) + 1);
            } else {
                const uniqueItem = this.uniqueInstances.get(uuid);
                if (uniqueItem === undefined) throw `Unique item ${uuid} not found.`;
                uniqueItem.placed = undefined; // Clear the placement ID
                this.changedUniqueInstances.set(uuid, uniqueItem);
            }
        }

        this.itemsUnplaced.fire(player, unplacing);
        return unplacing;
    }

    /**
     * Unplaces all items in the specified area.
     * @param player The player performing the unplacement (undefined for system actions).
     * @param areaId The area ID to unplace items from, or undefined to unplace from all areas.
     * @returns Set of unplaced items, or undefined if nothing was unplaced.
     */
    unplaceItemsInArea(player: Player | undefined, areaId: AreaId | undefined) {
        const toRemove = new Set<string>();
        for (const [id, placedItem] of this.worldPlaced)
            if (areaId === undefined || placedItem.area === areaId) toRemove.add(id);
        return this.unplaceItems(player, toRemove);
    }

    /**
     * Clones an item model for the specified placed item into the setup.
     * If an existing item model for that placed item already exists, returns false.
     *
     * @param placementId The unique ID for this placement.
     * @param placedItem Placed item to add an item model for
     * @returns The model that was added, or undefined if it already exists.
     */
    private getPlacementInstanceInfo(placementId: string, model: Model) {
        const modelInfo = getAllInstanceInfo(model) as ItemInstanceInfo;
        if (modelInfo.PlacementId === undefined) {
            modelInfo.PlacementId = placementId;
        }
        return modelInfo;
    }

    private addItemModel(placementId: string, placedItem: PlacedItem) {
        if (this.modelPerPlacementId.has(placementId) || this.IS_RENDERING === true) return;

        const item = Items.getItem(placedItem.item);
        if (item === undefined) {
            warn("Cannot find item " + placedItem.item);
            return;
        }

        const model = item.createModel(placedItem);
        if (model === undefined) {
            return;
        }
        model.Name = placementId;
        model.Parent = PLACED_ITEMS_FOLDER;
        this.modelPerPlacementId.set(placementId, model);

        const modelInfo = this.getPlacementInstanceInfo(placementId, model);
        if (this.brokenPlacedItems.has(placementId)) {
            modelInfo.Broken = true;
        }

        // Execute item-specific load callbacks
        item.LOADS.forEach((callback) => callback(model, item));
        return model;
    }

    /**
     * Places items into the setup.
     * This is a wrapper for {@link serverPlace}, additionally handling replication and firing the {@link itemsPlaced} signal.
     * Checks for permissions and area validity.
     *
     * @param player Player that performed the placing
     * @param placingInfoSet List of items to place
     * @returns 0 if no items were placed, 1 if items were placed, 2 if items were placed and is allowed to place the same item again
     */
    placeItems(player: Player | undefined, placingInfoSet: Set<PlacingInfo>) {
        if (player !== undefined && !this.permissionsService.checkPermLevel(player, "build")) {
            return 0;
        }

        let area: AreaId | undefined;
        if (baseplateBounds === undefined) {
            // normal placement
            area = Packets.currentArea.get(player);
            if (area === undefined) return 0;
        }

        let totalAmount = 0;
        const placedItems = new Set<IdPlacedItem>();
        const placementIds = new Set<string>();
        for (const placingInfo of placingInfoSet) {
            const [placedItem, amount] = this.serverPlace(
                placingInfo.id,
                placingInfo.position,
                placingInfo.rotation,
                area,
            );
            if (placedItem === undefined) {
                if (placementIds.size() > 0) {
                    this.unplaceItems(player, placementIds);
                }
                return 0;
            }

            if (amount !== undefined) {
                // if this is a normal item
                totalAmount += amount;
            }
            placedItems.add(placedItem);
            placementIds.add(placedItem.id);
        }
        const placedCount = placedItems.size();
        if (placedCount === 0) {
            return 0;
        }

        this.itemsPlaced.fire(player, placedItems);
        if (placedCount === 1) {
            return totalAmount === 0 ? 1 : 2;
        }
        return 1;
    }

    /**
     * Places an item into the setup. At least 1 of this item needs to exist in the inventory.
     * This also automatically adds the item model into the setup.
     *
     * This does *not* replicate the changes to the client, nor fires the {@link itemsPlaced} signal.
     *
     * @param id Item id to place.
     * @param position Position of the PrimaryPart of the item model to place in.
     * @param rotation Rotation, in degrees, to rotate the item.
     * @param areaId The area to place the item in.
     * @returns A tuple for the placed item and the remaining item count in the inventory
     */
    serverPlace(id: string, position: Vector3, rotation: number, areaId?: AreaId): LuaTuple<[IdPlacedItem?, number?]> {
        const empireData = this.dataService.empireData;
        const itemsData = empireData.items;
        const rawInventoryAmount = itemsData.inventory.get(id);
        const inventoryAmount = rawInventoryAmount ?? 0;
        const researchingAmount = itemsData.researching.get(id) ?? 0;
        const availableAmount = math.max(inventoryAmount - researchingAmount, 0);
        let uniqueInstance: UniqueItemInstance | undefined;
        if (rawInventoryAmount === undefined && availableAmount === 0) {
            uniqueInstance = itemsData.uniqueInstances.get(id);
            if (uniqueInstance === undefined) {
                warn(`Item ${id} not found in inventory or unique items.`);
                return $tuple(undefined);
            }
            const itemId = uniqueInstance.baseItemId;
            for (const [uuid, instance] of itemsData.uniqueInstances) {
                if (instance.baseItemId === itemId && instance.placed !== undefined) {
                    warn(`${itemId} is already placed under ${uuid}. Cannot place again.`);
                    return $tuple(undefined);
                }
            }
        } else if (availableAmount < 1) {
            // Validate item requirements
            return $tuple(undefined);
        }

        // Round rotation to nearest 90 degrees
        rotation = math.round(rotation / 90) * 90;
        rotation %= 360;

        const itemId = uniqueInstance?.baseItemId ?? id;
        const item = Items.getItem(itemId);
        if (item === undefined) throw "How did this happen?";

        // Check level requirements
        if (item.levelReq !== undefined && item.levelReq > empireData.level) return $tuple(undefined);

        // Check challenge restrictions
        if (empireData.currentChallenge !== undefined) {
            const challenge = CHALLENGES[empireData.currentChallenge as ChallengeId];
            if (challenge !== undefined && challenge.restrictItems !== undefined && challenge.restrictItems(item)) {
                return $tuple(undefined);
            }
        }

        let buildBounds: BuildBounds | undefined;

        // Determine build bounds based on placement mode
        if (baseplateBounds === undefined) {
            // normal placement
            if (areaId === undefined) return $tuple(undefined);

            const area =
                item.bounds === undefined
                    ? ItemPlacement.getAreaOfPosition(position, item.placeableAreas)
                    : AREAS[areaId];
            if (area === undefined || area.buildBounds === undefined) return $tuple(undefined);

            areaId = area.id;
            buildBounds = area.buildBounds;
        } else {
            // Sandbox mode
            buildBounds = baseplateBounds;
        }

        const model = item.MODEL?.Clone();
        if (model === undefined) throw "No model found for " + id;

        const primaryPart = model.PrimaryPart!;

        // Calculate final position with snapping
        let cframe = buildBounds.snap(primaryPart.Size, position, math.rad(rotation));
        if (cframe === undefined) return $tuple(undefined);

        // Adjust position if not inside build bounds
        if (!buildBounds.isInside(cframe.Position)) {
            cframe = cframe.sub(new Vector3(0, primaryPart.Size.Y / 2, 0));
        }

        model.PivotTo(cframe);

        // Check for collisions with existing items
        if (ItemPlacement.isTouchingPlacedItem(model)) return $tuple(undefined);

        // Check if placement is in valid area
        if (baseplateBounds === undefined && !ItemPlacement.isInPlaceableArea(model, item)) return $tuple(undefined);

        // Create placed item data
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
        if (uniqueInstance !== undefined) {
            placedItem.uniqueItemId = id; // Link unique item UUID
            uniqueInstance.placed = nextId; // Set the placement ID for the unique item
            this.uniqueInstances.set(id, uniqueInstance);
            this.changedUniqueInstances.set(id, uniqueInstance);
        }

        // Update data and create model
        this.worldPlaced.set(nextId, placedItem);
        this.addItemModel(nextId, placedItem);
        this.changedPlacedItems.set(nextId, placedItem);
        if (uniqueInstance !== undefined) {
            return $tuple(placedItem);
        } else {
            this.setItemAmount(itemId, inventoryAmount - 1);
            return $tuple(placedItem, inventoryAmount - 1);
        }
    }

    // Model Management Methods

    /**
     * Searches through all placed items and checks if their models exist in the workspace. If not, add them.
     * If any models belong in the workspace but no placed item corresponds, remove them.
     */
    fullUpdatePlacedItemsModels() {
        // Remove orphaned models
        for (const model of PLACED_ITEMS_FOLDER.GetChildren()) {
            if (!this.worldPlaced.has(model.Name)) {
                model.Destroy();
                this.repairProtection.delete(model.Name);
                this.modelPerPlacementId.delete(model.Name);
            }
        }

        // Add missing models
        for (const [placementId, placedItem] of this.worldPlaced) {
            this.addItemModel(placementId, placedItem);
        }
    }

    // Purchase Methods

    /**
     * Purchases the item, spending currency.
     *
     * @param item Item to purchase.
     * @returns Whether the purchase was successful.
     */
    serverBuy(item: Item) {
        // Check required items
        for (const [required, amount] of item.requiredItems) {
            if (this.getItemAmount(required) < amount) {
                return false;
            }
        }

        // Check level requirements for harvesting tools
        if (item.isA("Gear") && item.levelReq !== undefined && item.levelReq > this.dataService.empireData.level)
            return false;

        const itemId = item.id;
        const nextBought = this.getBoughtAmount(itemId) + 1;
        const price = item.getPrice(nextBought);
        if (price === undefined) return false;

        // Attempt currency purchase
        const success = this.currencyService.purchase(price);
        if (success === true) {
            // Consume required items
            for (const [required, amount] of item.requiredItems) {
                this.setItemAmount(required, this.getItemAmount(required) - amount);
            }
            this.setBoughtAmount(itemId, nextBought);
            // Add item to inventory
            this.setItemAmount(itemId, this.getItemAmount(itemId) + 1);
        }
        return success;
    }

    /**
     * Handles item purchase for a specific player.
     *
     * @param player The player making the purchase (undefined for system purchases).
     * @param itemId The ID of the item to buy.
     * @returns Whether the purchase was successful.
     */
    buyItem(player: Player | undefined, itemId: string) {
        if (player !== undefined && !this.permissionsService.checkPermLevel(player, "purchase")) {
            return false;
        }
        const item = Items.getItem(itemId);
        if (item === undefined) return false;
        if (player !== undefined && !this.hasUnlockedRequiredShop(item)) {
            return false;
        }
        const success = this.serverBuy(item);
        if (success) {
            this.itemsBought.fire(player, new Set([item]));
        }
        return success;
    }

    /**
     * Handles bulk item purchases for a player.
     *
     * @param player The player making the purchases.
     * @param itemIds Set of item IDs to attempt to buy.
     * @returns Whether at least one purchase was successful.
     */
    buyAllItems(player: Player, itemIds: Set<string>) {
        if (!this.permissionsService.checkPermLevel(player, "purchase")) return false;

        let oneSucceeded = false;
        const bought = new Set<Item>();
        for (const itemId of itemIds) {
            const item = Items.getItem(itemId);
            if (item === undefined) continue;
            if (!this.hasUnlockedRequiredShop(item)) {
                continue;
            }
            if (this.serverBuy(item) === true) {
                oneSucceeded = true;
                bought.add(item);
            }
        }
        this.itemsBought.fire(player, bought);
        return oneSucceeded;
    }

    // Utility Methods

    /**
     * Generates the next unique ID for placed items.
     *
     * @returns A unique string ID for the next placed item.
     */
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
        return this.worldPlaced.get(placementId);
    }

    /**
     * Retrieves a read-only view of all placement IDs currently marked as broken.
     *
     * @returns Set of placement IDs that require repairs.
     */
    getBrokenPlacedItems(): ReadonlySet<string> {
        return this.brokenPlacedItems;
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
            if (queue.indexOf(callback) === 0) break;
        }
        const value = callback();
        queue.remove(0);
        return value;
    }

    // Lifecycle Methods

    /**
     * Requests changes to be broadcasted to clients.
     * Marks all change flags as true to ensure data is sent in the next update cycle.
     */
    requestChanges() {
        this.hasInventoryChanged = true;
        this.hasBoughtChanged = true;
        for (const [k, v] of this.worldPlaced) {
            this.changedPlacedItems.set(k, v);
        }
        for (const [k, v] of this.uniqueInstances) {
            this.changedUniqueInstances.set(k, v);
        }
    }

    /**
     * Broadcasts changes to clients by sending updated data packets.
     * This is called periodically to ensure all changes are synchronized.
     */
    private broadcastChanges() {
        if (this.hasInventoryChanged) {
            Packets.inventory.set(this.inventory);
            this.hasInventoryChanged = false;
        }
        if (!this.changedUniqueInstances.isEmpty() || !this.deletedUniqueInstances.isEmpty()) {
            Packets.uniqueInstances.setAndDeleteEntries(this.changedUniqueInstances, this.deletedUniqueInstances);
            this.changedUniqueInstances.clear();
            this.deletedUniqueInstances.clear();
        }
        if (!this.changedPlacedItems.isEmpty() || !this.deletedPlacedItems.isEmpty()) {
            Packets.placedItems.setAndDeleteEntries(this.changedPlacedItems, this.deletedPlacedItems);
            this.changedPlacedItems.clear();
            this.deletedPlacedItems.clear();
        }
        if (this.hasBoughtChanged) {
            Packets.bought.set(this.bought);
            this.hasBoughtChanged = false;
        }
    }

    /**
     * Begins the breakdown process for the specified placed items,
     * marking them as broken and removing any repair protection.
     * @param placementIds Array of placement IDs to mark as broken.
     */
    beginBreakdown(placementIds: string[]) {
        let changed = false;
        for (const placementId of placementIds) {
            if (this.brokenPlacedItems.has(placementId)) {
                continue;
            }
            const placedItem = this.worldPlaced.get(placementId);
            if (placedItem === undefined) {
                continue;
            }

            const item = Items.getItem(placedItem.item);
            if (item === undefined || item.isUnbreakable) {
                continue;
            }

            const model = this.modelPerPlacementId.get(placementId);
            if (model) {
                const modelInfo = this.getPlacementInstanceInfo(placementId, model);
                modelInfo.Broken = true;
                clearRepairBoostFromModel(modelInfo);
            }
            this.brokenPlacedItems.add(placementId);
            this.repairProtection.delete(placementId);
            changed = true;
        }
        if (changed) {
            Packets.brokenPlacedItems.set(this.brokenPlacedItems);
        }
    }

    /**
     * Completes the repair process for a broken placed item, applying any repair protection if applicable.
     * @param placementId The placement ID of the item to repair.
     * @param tier The tier of repair performed.
     * @returns Whether the repair was successful.
     */
    completeRepair(placementId: string, tier: RepairResultTier) {
        const success = this.brokenPlacedItems.delete(placementId);
        if (!success) return false;

        this.repairProtection.delete(placementId);

        const model = this.modelPerPlacementId.get(placementId);
        if (!model) return false;

        const modelInfo = this.getPlacementInstanceInfo(placementId, model);
        modelInfo.Broken = false;

        if (isProtectionTier(tier)) {
            const expiresAt = os.time() + REPAIR_PROTECTION_DURATIONS[tier];
            this.repairProtection.set(placementId, { tier, expiresAt });

            const itemId = this.worldPlaced.get(placementId)?.item;
            if (itemId === undefined) return false;

            const item = Items.getItem(itemId);
            if (item === undefined) return false;

            applyRepairBoostToItem(modelInfo, item, tier);
        } else {
            clearRepairBoostFromModel(modelInfo);
        }

        Packets.brokenPlacedItems.set(this.brokenPlacedItems);
        Packets.itemRepairCompleted.toAllClients(placementId, tier);
        return true;
    }

    onInit() {
        // Set up automatic model creation for new placed items
        const placedItemsUpdatedConnection = this.placedItemsUpdated.connect((placedItems) => {
            for (const [placementId, placedItem] of placedItems) {
                this.addItemModel(placementId, placedItem);
            }
        });

        // Set up logging for item actions
        const itemsBoughtConnection = this.itemsBought.connect((player, items) => {
            const serialized = new Array<string>();
            for (const item of items) {
                serialized.push(item.id);
            }
            log({
                time: tick(),
                type: "Purchase",
                player: player?.UserId,
                items: serialized,
            });
        });

        const itemsPlacedConnection = this.itemsPlaced.connect((player, placedItems) => {
            const time = tick();
            let i = 0;
            for (const placedItem of placedItems) {
                log({
                    time: time + ++i / 1000, // not a hack i swear
                    type: "Place",
                    player: player?.UserId,
                    item: placedItem.item,
                    x: placedItem.posX,
                    y: placedItem.posY,
                    z: placedItem.posZ,
                });
            }
        });

        const itemsUnplacedConnection = this.itemsUnplaced.connect((player, placedItems) => {
            const time = tick();
            let i = 0;
            for (const placedItem of placedItems) {
                log({
                    time: time + ++i / 1000,
                    type: "Unplace",
                    player: player?.UserId,
                    item: placedItem.item,
                    x: placedItem.posX,
                    y: placedItem.posY,
                    z: placedItem.posZ,
                });
            }
        });

        eat(() => {
            placedItemsUpdatedConnection.disconnect();
            itemsBoughtConnection.disconnect();
            itemsPlacedConnection.disconnect();
            itemsUnplacedConnection.disconnect();
        });
    }

    onGameAPILoaded() {
        // Initialize all items and their callbacks
        let itemCount = 0;
        Items.itemsPerId.forEach((item) => {
            for (const callback of item.INITIALIZES) {
                callback(item);
            }
            ++itemCount;
        });
        print(`Initialized ${itemCount} items.`);

        // Ensure all placed items have models
        this.fullUpdatePlacedItemsModels();
    }

    onStart() {
        // Set up packet handlers for item operations
        Packets.buyItem.fromClient((player, itemId) => {
            return this.buyItem(player, itemId);
        });
        Packets.buyAllItems.fromClient((player, itemIds) => this.buyAllItems(player, itemIds));

        // Set up placement handlers with queue protection
        Packets.placeItems.fromClient((player, items) => {
            return this.waitInQueue(() => {
                return this.placeItems(player, items);
            });
        });
        Packets.unplaceItems.fromClient((player, placementIds) => {
            return this.waitInQueue(() => {
                this.unplaceItems(player, placementIds);
                return 1;
            });
        });

        Packets.repairItem.fromClient((_, placementId, tier) => this.completeRepair(placementId, tier));
        this.requestChanges();

        // Periodically propagate changes to clients
        eat(simpleInterval(() => this.broadcastChanges(), 0.1));

        // Periodically check for items to break down
        const ref = { interval: 10 };
        const rng = new Random();
        const cleanup = variableInterval(() => {
            if (this.dataService.empireData.playtime < 300 || this.breakdownsEnabled === false) {
                return; // don't break items in first 5 minutes
            }

            const placementIds = new Array<string>();
            for (const [placementId, placedItem] of this.worldPlaced) {
                if (this.brokenPlacedItems.has(placementId)) continue;

                // Check if item is marked as unbreakable
                const item = Items.getItem(placedItem.item);
                if (item?.isUnbreakable) continue;

                const protection = this.repairProtection.get(placementId);
                if (protection !== undefined && protection.expiresAt > os.time()) {
                    continue; // still protected
                }

                if (rng.NextNumber() > 0.997) {
                    placementIds.push(placementId);
                }
            }
            if (!placementIds.isEmpty()) {
                this.beginBreakdown(placementIds);
            }
            ref.interval = 10 + rng.NextNumber() * 15;
        }, ref);
        eat(cleanup);

        // Periodically clean up expired repair protections/boosts
        eat(
            simpleInterval(() => {
                const now = os.time();
                for (const [placementId, protection] of this.repairProtection) {
                    if (protection.expiresAt <= now) {
                        this.repairProtection.delete(placementId);
                        const model = this.modelPerPlacementId.get(placementId);
                        if (model) {
                            const modelInfo = getAllInstanceInfo(model);
                            clearRepairBoostFromModel(modelInfo);
                        }
                    }
                }
            }, 1),
        );

        Packets.brokenPlacedItems.set(this.brokenPlacedItems);

        // Clean up models on shutdown
        eat(() => {
            for (const model of PLACED_ITEMS_FOLDER.GetChildren()) {
                model.Destroy();
            }
            this.modelPerPlacementId.clear();
        });
    }
}
