//!native
//!optimize 2

/**
 * @fileoverview ItemsService - Core item management system for the game.
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
import { OnInit, OnStart, Service } from "@flamework/core";
import { CollectionService, Workspace } from "@rbxts/services";
import { CHALLENGES } from "server/Challenges";
import { OnGameAPILoaded } from "server/services/ModdingService";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { AREAS } from "shared/Area";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import BuildBounds from "shared/placement/BuildBounds";
import ItemPlacement from "shared/placement/ItemPlacement";
import Sandbox from "shared/Sandbox";

declare global {
    /** A {@link PlacedItem} that has an associated placement ID. */
    interface IdPlacedItem extends PlacedItem {
        /** Unique identifier for this placed item instance. */
        id: string;
    }
}

/** Cached baseplate bounds for performance optimization in sandbox mode. */
const baseplateBounds = Sandbox.createBaseplateBounds(); // cached for performance

/** Queue for serializing item placement operations to prevent race conditions. */
const queue = new Array<() => void>();

/**
 * Core service for managing items, inventory, and item placement in the game world.
 * 
 * Handles the complete item lifecycle from purchase to placement to removal,
 * including 3D model management and world synchronization.
 */
@Service()
export class ItemsService implements OnInit, OnStart, OnGameAPILoaded {

    // Event Signals

    /**
     * Fired when items are successfully placed in the world.
     * @param player The player who placed the items.
     * @param placedItems Array of items that were placed with their IDs.
     */
    itemsPlaced = new Signal<(player: Player, placedItems: IdPlacedItem[]) => void>();

    /**
     * Fired when items are removed from the world.
     * @param player The player who removed the items.
     * @param placedItems Array of items that were removed.
     */
    itemsUnplaced = new Signal<(player: Player, placedItems: PlacedItem[]) => void>();

    /**
     * Fired when items are purchased from the shop.
     * @param player The player who bought the items (undefined for system purchases).
     * @param items Array of items that were bought.
     */
    itemsBought = new Signal<(player: Player | undefined, items: Item[]) => void>();

    /**
     * Fired when the placed items collection is updated.
     * @param placedItems The updated map of placed items.
     */
    placedItemsUpdated = new Signal<(placedItems: Map<string, PlacedItem>) => void>();

    // State Management

    /**
     * Maps placed items to their corresponding 3D models in the world.
     * Used for efficient model lookup and cleanup.
     */
    modelPerPlacedItem = new Map<PlacedItem, Model>();

    /**
     * Whether the service is in rendering mode (no 3D models created).
     * Used for headless operations and testing.
     */
    isRendering = (() => {
        const isRendering = this.dataService.empireId === "RENDER";
        if (isRendering === true)
            print("Rendering set to true. Will not spawn item models.");
        return isRendering;
    })();

    /**
     * Initializes the ItemsService with required dependencies.
     * 
     * @param dataService Service providing persistent empire and player data.
     * @param currencyService Service handling currency transactions for purchases.
     */
    constructor(private dataService: DataService, private currencyService: CurrencyService) {

    }

    // Data Management Methods

    /**
     * Updates the complete items data structure and syncs to clients.
     * 
     * @param itemsData The new items data to set.
     * @param silent Whether to suppress client notifications.
     */
    setItems(itemsData: ItemsData, silent?: boolean) {
        this.dataService.empireData.items = itemsData;
        if (silent !== true) {
            Packets.inventory.set(itemsData.inventory);
            Packets.bought.set(itemsData.bought);
        }
    }

    /**
     * Updates the inventory and syncs to clients.
     * 
     * @param inventory The new inventory to set.
     * @param silent Whether to suppress client notifications.
     */
    setInventory(inventory: Inventory, silent?: boolean) {
        const items = this.dataService.empireData.items;
        items.inventory = inventory;
        this.setItems(items, silent);
    }

    /**
     * Gets the current amount of an item in inventory.
     * 
     * @param itemId The ID of the item to check.
     * @returns The amount of the item in inventory, or 0 if not found.
     */
    getItemAmount(itemId: string) {
        return this.dataService.empireData.items.inventory.get(itemId) ?? 0;
    }

    /**
     * Sets the amount of a specific item in inventory.
     * 
     * @param itemId The ID of the item to set.
     * @param amount The new amount to set.
     * @param silent Whether to suppress client notifications.
     */
    setItemAmount(itemId: string, amount: number, silent?: boolean) {
        const inventory = this.dataService.empireData.items.inventory;
        inventory.set(itemId, amount);
        this.setInventory(inventory, silent);
    }

    /**
     * Updates the bought items tracking and syncs to clients.
     * 
     * @param bought The new bought items map to set.
     * @param silent Whether to suppress client notifications.
     */
    setBought(bought: Inventory, silent?: boolean) {
        const items = this.dataService.empireData.items;
        items.bought = bought;
        this.setItems(items, silent);
    }

    /**
     * Gets the number of times an item has been bought.
     * 
     * @param itemId The ID of the item to check.
     * @returns The number of times the item has been bought, or 0 if never bought.
     */
    getBoughtAmount(itemId: string) {
        return this.dataService.empireData.items.bought.get(itemId) ?? 0;
    }

    /**
     * Sets the number of times an item has been bought.
     * 
     * @param itemId The ID of the item to set.
     * @param amount The new bought amount.
     * @param silent Whether to suppress client notifications.
     */
    setBoughtAmount(itemId: string, amount: number, silent?: boolean) {
        const bought = this.dataService.empireData.items.bought;
        bought.set(itemId, amount);
        if (silent !== true)
            this.setBought(bought);
    }

    /**
     * Updates the placed items collection and syncs to clients.
     * 
     * @param placedItems The new placed items map to set.
     * @param silent Whether to suppress client notifications and signals.
     */
    setPlacedItems(placedItems: Map<string, PlacedItem>, silent?: boolean) {
        const items = this.dataService.empireData.items;
        items.worldPlaced = placedItems;
        this.setItems(items, silent);
        if (silent !== true) {
            this.placedItemsUpdated.fire(placedItems);
            Packets.placedItems.set(placedItems);
        }
    }

    // Item Placement Methods

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
     * @param placementId The unique ID for this placement.
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

        // Position and rotate the model based on placed item data
        model.PivotTo(new CFrame(placedItem.posX, placedItem.posY, placedItem.posZ)
            .mul(CFrame.Angles(math.rad(placedItem.rotX), math.rad(placedItem.rotY), math.rad(placedItem.rotZ))));
        model.Name = placementId;

        // Set model attributes for identification and functionality
        model.SetAttribute("Area", placedItem.area);
        model.SetAttribute("ItemId", item.id);
        model.SetAttribute("ItemName", item.name);
        model.SetAttribute("Rotation", placedItem.rawRotation);
        model.Parent = PLACED_ITEMS_FOLDER;

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
     * @param areaId The area to place the item in.
     * @returns A tuple for the placed item and the remaining item count in the inventory
     */
    serverPlace(itemId: string, position: Vector3, rotation: number, areaId?: AreaId): LuaTuple<[IdPlacedItem?, number?]> {
        const empireData = this.dataService.empireData;
        const items = empireData.items;
        const itemAmount = items.inventory.get(itemId);

        rotation %= 360;

        // Validate placement requirements
        if (itemAmount === undefined || itemAmount < 1 || rotation % 90 !== 0) {
            return $tuple(undefined);
        }

        const placedItems = items.worldPlaced;
        const item = Items.getItem(itemId);
        if (item === undefined)
            throw "How did this happen?";

        // Check level requirements
        if (item.levelReq !== undefined && item.levelReq > empireData.level)
            return $tuple(undefined);

        // Check challenge restrictions
        if (empireData.currentChallenge !== undefined) {
            const challenge = CHALLENGES[empireData.currentChallenge as ChallengeId];
            if (challenge !== undefined && challenge.restrictItems !== undefined && challenge.restrictItems(item)) {
                return $tuple(undefined);
            }
        }

        let buildBounds: BuildBounds | undefined;

        // Determine build bounds based on placement mode
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
            // Sandbox mode
            buildBounds = baseplateBounds;
            areaId = AREAS.BarrenIslands.id;
        }

        const model = item.MODEL?.Clone();
        if (model === undefined)
            throw "No model found for " + itemId;

        const primaryPart = model.PrimaryPart!;

        // Calculate final position with snapping
        let cframe = buildBounds.snap(primaryPart.Size, position, math.rad(rotation));
        if (cframe === undefined)
            return $tuple(undefined);

        // Adjust position if not inside build bounds
        if (!buildBounds.isInside(cframe.Position)) {
            cframe = cframe.sub(new Vector3(0, primaryPart.Size.Y / 2, 0));
        }

        model.PivotTo(cframe);

        // Check for collisions with existing items
        if (ItemPlacement.isTouchingPlacedItem(model))
            return $tuple(undefined);

        // Check if placement is in valid area
        if (baseplateBounds === undefined && !ItemPlacement.isInPlaceableArea(model, item))
            return $tuple(undefined);

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

        // Update data and create model
        placedItems.set(nextId, placedItem);
        this.addItemModel(nextId, placedItem);
        this.setPlacedItems(placedItems, true);
        this.setItemAmount(itemId, itemAmount - 1, true);
        return $tuple(placedItem, itemAmount - 1);
    }

    // Model Management Methods

    /**
     * Searches through all placed items and checks if their models exist in the workspace. If not, add them.
     * If any models belong in the workspace but no placed item corresponds, remove them.
     */
    fullUpdatePlacedItemsModels() {
        const placedItems = this.dataService.empireData.items.worldPlaced;

        // Remove orphaned models
        for (const model of PLACED_ITEMS_FOLDER.GetChildren()) {
            if (!placedItems.has(model.Name)) {
                model.Destroy();
            }
        }

        // Add missing models
        for (const [placementId, placedItem] of placedItems)
            this.addItemModel(placementId, placedItem);
    }

    // Purchase Methods

    /**
     * Purchases the item, spending currency.
     * 
     * @param item Item to purchase.
     * @param silent Whether to suppress changes to the client.
     * @returns Whether the purchase was successful.
     */
    serverBuy(item: Item, silent?: boolean) {
        // Check required items
        for (const [required, amount] of item.requiredItems) {
            if (this.getItemAmount(required.id) < amount) {
                return false;
            }
        }

        // Check level requirements for harvesting tools
        if (item.isA("HarvestingTool") && item.levelReq !== undefined && item.levelReq > this.dataService.empireData.level)
            return false;

        const itemId = item.id;
        const nextBought = this.getBoughtAmount(itemId) + 1;
        const price = item.getPrice(nextBought);
        if (price === undefined)
            return false;

        // Attempt currency purchase
        const success = this.currencyService.purchase(price);
        if (success === true) {
            // Consume required items
            for (const [required, amount] of item.requiredItems) {
                this.setItemAmount(required.id, this.getItemAmount(required.id) - amount, silent);
            }
            this.setBoughtAmount(itemId, nextBought, silent);
            // Add item to inventory
            this.setItemAmount(itemId, this.getItemAmount(itemId) + 1, silent);
        }
        return success;
    }

    /**
     * Handles item purchase for a specific player.
     * 
     * @param player The player making the purchase (undefined for system purchases).
     * @param itemId The ID of the item to buy.
     * @param silent Whether to suppress client notifications.
     * @returns Whether the purchase was successful.
     */
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

    /**
     * Handles bulk item purchases for a player.
     * 
     * @param player The player making the purchases.
     * @param itemIds Array of item IDs to attempt to buy.
     * @returns Whether at least one purchase was successful.
     */
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
        return this.dataService.empireData.items.worldPlaced.get(placementId);
    }

    /**
     * Refreshes particle effects based on empire settings.
     * Enables or disables all tagged effects based on the particlesEnabled setting.
     */
    refreshEffects() {
        const particlesEnabled = this.dataService.empireData.particlesEnabled;
        const effects = CollectionService.GetTagged("Effect");
        for (const effect of effects) {
            if (effect !== undefined) {
                (effect as Toggleable).Enabled = particlesEnabled;
            }
        }
    }

    /**
     * Adds static map items to the world.
     * Processes all objects tagged as "MapItem" and creates their 3D models.
     */
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

    // Lifecycle Methods

    /**
     * Initializes the ItemsService.
     * Sets up packet handlers, initializes all items, and synchronizes world state.
     */
    onInit() {
        this.refreshEffects();

        // Set up packet handlers for item operations
        Packets.buyItem.onInvoke((player, itemId) => this.buyItem(player, itemId));
        Packets.buyAllItems.onInvoke((player, itemIds) => this.buyAllItems(player, itemIds));

        // Sync initial data to clients
        Packets.inventory.set(this.dataService.empireData.items.inventory);
        Packets.bought.set(this.dataService.empireData.items.bought);
        Packets.placedItems.set(this.dataService.empireData.items.worldPlaced);

        // Set up placement handlers with queue protection
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

        // Set up automatic model creation for new placed items
        this.placedItemsUpdated.connect((placedItems) => {
            for (const [placementId, placedItem] of placedItems) {
                this.addItemModel(placementId, placedItem);
            }
        });
    }

    onGameAPILoaded() {
        // Initialize all items and their callbacks
        let itemCount = 0;
        Items.itemsPerId.forEach((item) => {
            item.INITALIZES.forEach((callback) => callback(item));
            ++itemCount;
        });
        print("Initialized " + itemCount + " items.");

        // Ensure all placed items have models
        this.fullUpdatePlacedItemsModels();
    }

    /**
     * Starts the ItemsService.
     * Adds map items to the world after initialization is complete.
     */
    onStart() {
        this.addMapItems();
    }
}