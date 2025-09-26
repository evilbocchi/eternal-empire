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
import { simpleInterval } from "@antivivi/vrldk";
import { OnInit, OnStart, Service } from "@flamework/core";
import { CollectionService, HttpService, Workspace } from "@rbxts/services";
import { CHALLENGES } from "server/Challenges";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import { OnGameAPILoaded } from "server/services/ModdingService";
import { log } from "server/services/permissions/LogService";
import PermissionsService from "server/services/permissions/PermissionsService";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
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
export default class ItemService implements OnInit, OnStart, OnGameAPILoaded {
    readonly modelPerPlacementId = new Map<string, Model>();
    readonly items: ItemsData;
    private hasInventoryChanged = false;
    private hasUniqueChanged = false;
    private hasBoughtChanged = false;
    private hasPlacedChanged = false;

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
        if (isRendering === true) print("Rendering set to true. Will not spawn item models.");
        return isRendering;
    })();

    constructor(
        private dataService: DataService,
        private currencyService: CurrencyService,
        private permissionsService: PermissionsService,
    ) {
        this.items = dataService.empireData.items;
    }

    // Data Management Methods

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
     */
    setItemAmount(itemId: string, amount: number) {
        this.dataService.empireData.items.inventory.set(itemId, amount);
        this.hasInventoryChanged = true;
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
     */
    setBoughtAmount(itemId: string, amount: number) {
        this.dataService.empireData.items.bought.set(itemId, amount);
        this.hasBoughtChanged = true;
    }

    /**
     * Updates the placed items collection and syncs to clients.
     *
     * @param placedItems The new placed items map to set.
     */
    setPlacedItems(placedItems: Map<string, PlacedItem>) {
        this.dataService.empireData.items.worldPlaced = placedItems;
        this.hasPlacedChanged = true;
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
        this.dataService.empireData.items.uniqueInstances.set(uuid, instance);
        this.hasUniqueChanged = true;

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
        if (!this.permissionsService.checkPermLevel(player, "build")) return undefined;
        const unplacing = new Array<PlacedItem>();
        const itemsData = this.dataService.empireData.items;
        const placedItems = itemsData.worldPlaced;

        let somethingHappened = false;
        for (const placementId of placementIds) {
            somethingHappened = true;
            const model = this.modelPerPlacementId.get(placementId);
            if (model !== undefined) {
                model.Destroy();
                this.modelPerPlacementId.delete(placementId);
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
            const uuid = placedItem.uniqueItemId;
            if (uuid === undefined) {
                this.setItemAmount(item, this.getItemAmount(item) + 1);
            } else {
                const uniqueInstances = itemsData.uniqueInstances;
                const uniqueItem = uniqueInstances.get(uuid);
                if (uniqueItem === undefined) throw `Unique item ${uuid} not found.`;
                uniqueItem.placed = undefined; // Clear the placement ID
                this.hasUniqueChanged = true;
            }
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
        if (this.modelPerPlacementId.has(placementId) || this.isRendering === true) return;

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
        if (!this.permissionsService.checkPermLevel(player, "build")) {
            return 0;
        }

        let area: AreaId | undefined;
        if (baseplateBounds === undefined) {
            // normal placement
            area = player.GetAttribute("Area") as AreaId | undefined;
            if (area === undefined) return 0;
        }

        let overallSuccess = true;
        let i = 0;
        let totalAmount = 0;
        const placedItems = new Array<IdPlacedItem>();
        for (const item of items) {
            const [placedItem, amount] = this.serverPlace(item.id, item.position, item.rotation, area);
            if (placedItem !== undefined) {
                if (amount !== undefined) {
                    // if this is a normal item
                    totalAmount += amount;
                }
                placedItems.push(placedItem);
            } else overallSuccess = false;
            i++;
        }
        this.itemsPlaced.fire(player, placedItems);
        if (i === 0 || overallSuccess === false) return 0;
        if (i === 1) return totalAmount === 0 ? 1 : 2;
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
        const itemAmount = itemsData.inventory.get(id);
        let uniqueInstance: UniqueItemInstance | undefined;
        if (itemAmount === undefined) {
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
        } else if (itemAmount < 1 || rotation % 90 !== 0) {
            // Validate item requirements
            return $tuple(undefined);
        }

        rotation %= 360;

        const placedItems = itemsData.worldPlaced;
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
            this.hasUniqueChanged = true;
        }

        // Update data and create model
        placedItems.set(nextId, placedItem);
        this.addItemModel(nextId, placedItem);
        this.setPlacedItems(placedItems);
        if (uniqueInstance !== undefined) {
            return $tuple(placedItem);
        } else {
            this.setItemAmount(itemId, itemAmount! - 1);
            return $tuple(placedItem, itemAmount! - 1);
        }
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
        this.modelPerPlacementId.clear();

        // Add missing models
        for (const [placementId, placedItem] of placedItems) this.addItemModel(placementId, placedItem);
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
        const success = this.serverBuy(item);
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
        if (!this.permissionsService.checkPermLevel(player, "purchase")) return false;

        let oneSucceeded = false;
        const bought = new Array<Item>();
        for (const itemId of itemIds) {
            const item = Items.getItem(itemId);
            if (item === undefined) continue;
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
        const mapItemModels = new Set<Model>();
        for (const waypoint of CollectionService.GetTagged("MapItem")) {
            if (!waypoint.IsA("BasePart")) continue;
            const item = Items.getItem(waypoint.Name);
            if (item === undefined) throw `Item ${waypoint.Name} not found`;
            const model = this.addItemModel(`wm${i}`, {
                item: item.id,
                posX: waypoint.Position.X,
                posY: waypoint.Position.Y,
                posZ: waypoint.Position.Z,
                rotX: waypoint.Rotation.X,
                rotY: waypoint.Rotation.Y,
                rotZ: waypoint.Rotation.Z,
            });
            if (model !== undefined) {
                mapItemModels.add(model);
                model.Parent = Workspace;
            } else warn(`Model for ${item.id} not found`);

            i++;
        }
        eat(() => {
            for (const model of mapItemModels) {
                model.Destroy();
            }
        });
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
     * Requests changes to be propagated to clients.
     * Marks all change flags as true to ensure data is sent in the next update cycle.
     */
    requestChanges() {
        this.hasInventoryChanged = true;
        this.hasUniqueChanged = true;
        this.hasBoughtChanged = true;
        this.hasPlacedChanged = true;
    }

    /**
     * Propagates changes to clients by sending updated data packets.
     * This is called periodically to ensure all changes are synchronized.
     */
    propagateChanges() {
        if (this.hasInventoryChanged) {
            Packets.inventory.set(this.dataService.empireData.items.inventory);
            this.hasInventoryChanged = false;
        }
        if (this.hasUniqueChanged) {
            Packets.uniqueInstances.set(this.dataService.empireData.items.uniqueInstances);
            this.hasUniqueChanged = false;
        }
        if (this.hasBoughtChanged) {
            Packets.bought.set(this.dataService.empireData.items.bought);
            this.hasBoughtChanged = false;
        }
        if (this.hasPlacedChanged) {
            Packets.placedItems.set(this.dataService.empireData.items.worldPlaced);
            this.hasPlacedChanged = false;
        }
    }

    /**
     * Initializes the ItemService.
     * Sets up packet handlers, initializes all items, and synchronizes world state.
     */
    onInit() {
        this.refreshEffects();

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

        // Set up automatic model creation for new placed items
        this.placedItemsUpdated.connect((placedItems) => {
            for (const [placementId, placedItem] of placedItems) {
                this.addItemModel(placementId, placedItem);
            }
        });

        // Set up logging for item actions
        this.itemsBought.connect((player, items) =>
            log({
                time: tick(),
                type: "Purchase",
                player: player?.UserId,
                items: items.map((item) => item.id),
            }),
        );

        this.itemsPlaced.connect((player, placedItems) => {
            const time = tick();
            let i = 0;
            for (const placedItem of placedItems) {
                log({
                    time: time + ++i / 1000, // not a hack i swear
                    type: "Place",
                    player: player.UserId,
                    item: placedItem.item,
                    x: placedItem.posX,
                    y: placedItem.posY,
                    z: placedItem.posZ,
                });
            }
        });

        this.itemsUnplaced.connect((player, placedItems) => {
            const time = tick();
            let i = 0;
            for (const placedItem of placedItems) {
                log({
                    time: time + ++i / 1000,
                    type: "Unplace",
                    player: player.UserId,
                    item: placedItem.item,
                    x: placedItem.posX,
                    y: placedItem.posY,
                    z: placedItem.posZ,
                });
            }
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

    /**
     * Starts the ItemService.
     * Adds map items to the world after initialization is complete.
     */
    onStart() {
        this.addMapItems();

        this.requestChanges();
        eat(simpleInterval(() => this.propagateChanges(), 0.1));
        eat(() => {
            for (const model of PLACED_ITEMS_FOLDER.GetChildren()) {
                model.Destroy();
            }
            this.modelPerPlacementId.clear();
        });
    }
}
