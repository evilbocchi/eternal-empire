import Signal from "@antivivi/lemon-signal";
import { OnInit, OnStart, Service } from "@flamework/core";
import { Debris, ReplicatedStorage } from "@rbxts/services";
import { CHALLENGES } from "server/Challenges";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { AREAS, PLACED_ITEMS_FOLDER, SOUND_EFFECTS_GROUP } from "shared/constants";
import Conveyor from "shared/item/Conveyor";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/network/Packets";
import ItemPlacement from "shared/utils/ItemPlacement";
import ReserveModels from "shared/utils/ReserveModels";
import { findModels } from "shared/utils/vrldk/InstanceUtils";


@Service()
export class ItemsService implements OnInit, OnStart {

    itemPlaced = new Signal<(player: Player, placedItem: PlacedItem) => void>();
    itemsUnplaced = new Signal<(player: Player, placedItems: PlacedItem[]) => void>();
    itemsBought = new Signal<(player: Player, items: Item[]) => void>();
    placedItemsUpdated = new Signal<(...placedItems: PlacedItem[]) => void>();
    modelPerPlacedItem = new Map<PlacedItem, Model>();
    isRendering = (() => {
        const isRendering = this.dataService.getEmpireId() === "RENDER";
        if (isRendering === true)
            print("Rendering set to true. Will not spawn item models.");
        return isRendering;
    })();

    constructor(private dataService: DataService, private currencyService: CurrencyService) {

    }

    setItems(itemsData: ItemsData) {
        this.dataService.empireData.items = itemsData;
        Packets.inventory.set(itemsData.inventory);
        Packets.bought.set(itemsData.bought);
    }

    setInventory(inventory: Inventory) {
        const items = this.dataService.empireData.items;
        items.inventory = inventory;
        this.setItems(items);
    }

    getItemAmount(itemId: string) {
        return this.dataService.empireData.items.inventory.get(itemId) ?? 0;
    }

    setItemAmount(itemId: string, amount: number) {
        const inventory = this.dataService.empireData.items.inventory;
        inventory.set(itemId, amount);
        this.setInventory(inventory);
    }

    getBought() {
        return this.dataService.empireData.items.bought;
    }

    setBought(bought: Inventory) {
        const items = this.dataService.empireData.items;
        items.bought = bought;
        this.setItems(items);
    }

    getBoughtAmount(itemId: string) {
        return this.dataService.empireData.items.bought.get(itemId) ?? 0;
    }

    setBoughtAmount(itemId: string, amount: number) {
        const bought = this.getBought();
        bought.set(itemId, amount);
        this.setBought(bought);
    }

    setPlacedItems(placedItems: PlacedItem[]) {
        const items = this.dataService.empireData.items;
        items.placed = placedItems;
        this.setItems(items);
        this.placedItemsUpdated.fire(...placedItems);
        Packets.placedItems.set(placedItems);
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
        const filtered = new Array<PlacedItem>();
        const unplacing = new Array<PlacedItem>();
        let somethingHappened = false;
        for (const placedItem of this.dataService.empireData.items.placed) {
            const placementId = placedItem.placementId ?? "default";
            if (placementIds.includes(placementId)) {
                somethingHappened = true;
                const model = PLACED_ITEMS_FOLDER.FindFirstChild(placementId);
                if (model !== undefined) {
                    model.Destroy();
                }
                unplacing.push(placedItem);
            }
            else
                filtered.push(placedItem);
        }
        if (somethingHappened === false) {
            return undefined;
        }
        this.setPlacedItems(filtered);
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
     * @returns Whether the operation was successful
     */
    addItemModel(placedItem: PlacedItem) {
        if (PLACED_ITEMS_FOLDER.FindFirstChild(placedItem.placementId ?? "default") !== undefined || this.isRendering === true) {
            return false;
        }
        const model = ReserveModels.fetchReserve(placedItem.item);
        if (model === undefined) {
            warn("Cannot find model for item " + placedItem.item);
            return false;
        }
        const item = Items.getItem(placedItem.item);
        if (item === undefined) {
            warn("Cannot find item " + placedItem.item);
            return false;
        }
        model.PivotTo(new CFrame(placedItem.posX, placedItem.posY, placedItem.posZ)
            .mul(CFrame.Angles(math.rad(placedItem.rotX), math.rad(placedItem.rotY), math.rad(placedItem.rotZ))));
        model.Name = placedItem.placementId ?? "default";
        model.SetAttribute("Area", placedItem.area);
        model.SetAttribute("ItemId", item.id);
        model.SetAttribute("ItemName", item.name);
        model.SetAttribute("Rotation", placedItem.rawRotation);
        model.Parent = PLACED_ITEMS_FOLDER;
        item.LOADS.forEach((callback) => callback(model, item));
        return true;
    }

    /**
     * Places an item into the setup. At least 1 of this item needs to exist in the inventory.
     * This also automatically adds the item model into the setup.
     * 
     * @param player Player that performed the placing
     * @param itemId Item id to place
     * @param position Position of the PrimaryPart of the item model to place in.
     * @param rotation Rotation, in degrees, to rotate the item.
     * @returns A tuple for whether the operation was successful and the remaining item count in the inventory
     */
    placeItem(player: Player, itemId: string, position: Vector3, rotation: number): LuaTuple<[boolean, number?]> {
        if (!this.dataService.checkPermLevel(player, "build")) {
            return $tuple(false);
        }
        const empireData = this.dataService.empireData;
        const items = empireData.items;
        const itemAmount = items.inventory.get(itemId);
        if (itemAmount === undefined || itemAmount < 1 || rotation % 90 !== 0) {
            return $tuple(false);
        }
        const placedItems = items.placed;
        const item = Items.getItem(itemId);
        if (item === undefined || item.levelReq !== undefined && item.levelReq > empireData.level) {
            error("How did this happen?");
        }
        else if (empireData.currentChallenge !== undefined) {
            const challenge = CHALLENGES[empireData.currentChallenge as ChallengeId];
            if (challenge !== undefined && challenge.restrictItems !== undefined && challenge.restrictItems(item)) {
                return $tuple(false);
            }
        }
        const playerArea = player.GetAttribute("Area") as AreaId | undefined;
        if (playerArea === undefined)
            return $tuple(false);

        const area = item.bounds === undefined ? ItemPlacement.getAreaOfPosition(position, item.placeableAreas) : AREAS[playerArea];
        if (area === undefined || area.buildBounds === undefined)
            return $tuple(false);

        const model = ReserveModels.itemModels.get(itemId);
        if (model === undefined)
            throw "No model found for " + itemId;
        const primaryPart = model.PrimaryPart!;
        const cframe = area.buildBounds.calcPlacementCFrame(primaryPart.Size, position, math.rad(rotation));
        model.PivotTo(cframe);

        if (!ItemPlacement.isItemModelAcceptable(model, item))
            return $tuple(false);

        const [rotX, rotY, rotZ] = cframe.ToOrientation();
        const placedItem = {
            placementId: this.nextId(),
            item: itemId,
            posX: cframe.X,
            posY: cframe.Y,
            posZ: cframe.Z,
            rotX: math.deg(rotX),
            rotY: math.deg(rotY),
            rotZ: math.deg(rotZ),
            rawRotation: rotation,
            direction: undefined,
            area: area.id
        };
        placedItems.push(placedItem);
        for (const placedItem of placedItems)
            this.addItemModel(placedItem);
        this.setPlacedItems(placedItems);
        this.setItemAmount(itemId, itemAmount - 1);
        this.itemPlaced.fire(player, placedItem);
        return $tuple(true, itemAmount - 1);
    }

    /**
     * Moves existing placed items to another location.
     * This systematically unplaces items and replaces them.
     * 
     * @param player Player that performed the moving
     * @param placementId Placement id to move
     * @param position Position of the PrimaryPart of the item model to place in.
     * @param rotation Rotation, in degrees, to rotate the item.
     * @param accompanying Which other placement ids are being moved relative to the original placed item.
     * @returns Whether the entire operation was successful
     */
    moveItem(player: Player, placementId: string, position: Vector3, rotation: number, accompanying?: string[]): LuaTuple<[boolean, number?]> {
        const placedItems = this.unplaceItems(player, accompanying === undefined ? [placementId] : [placementId, ...accompanying]);
        if (placedItems !== undefined) {
            return this.placeItem(player, placedItems[0].item, position, rotation);
        }
        return $tuple(false);
    }

    /**
     * Searches through all placed items and checks if their models exist in the workspace. If not, add them.
     * If any models belong in the workspace but no placed item corresponds, remove them.
     */
    fullUpdatePlacedItemsModels() {
        const placedItems = this.dataService.empireData.items.placed;
        const ids = placedItems.map((value) => value.placementId ?? "default");
        for (const model of PLACED_ITEMS_FOLDER.GetChildren()) {
            if (!ids.includes(model.Name)) {
                model.Destroy();
            }
        }
        for (const placedItem of placedItems)
            this.addItemModel(placedItem);
    }

    /**
     * Purchases the item, spending currency.
     * 
     * @param item Item to purchase
     * @returns Whether the purchase was successful
     */
    serverBuy(item: Item) {
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
                this.setItemAmount(required.id, this.getItemAmount(required.id) - amount);
            }
            this.setBoughtAmount(itemId, nextBought);
            // this is different
            this.setItemAmount(itemId, this.getItemAmount(itemId) + 1);
        }
        return success;
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
        return tostring(++this.dataService.empireData.items.nextId);
    }

    /**
     * Gets the PlacedItem object directly linked to the empire's Profile.
     * 
     * @param placementId The placement UUID for the PlacedItem
     * @returns A mutable PlacedItem object that can be used to modify data
     */
    getPlacedItem(placementId: string) {
        return this.dataService.empireData.items.placed.find((placedItem) => placedItem.placementId === placementId);
    }

    /**
     * Clean item models to reduce memory and improve performance
     */
    preloadItemModels() {
        function ungroup(grouped: Instance, destination: Instance, destroy?: boolean) {
            const children = grouped.GetChildren();
            for (const child of children) {
                if (child.IsA("Folder") || (child.IsA("Model") && child.PrimaryPart?.Name !== "HumanoidRootPart" && (child.Name === "Model" || child.PrimaryPart === undefined))) {
                    ungroup(child, destination, true);
                }
                child.Parent = destination;
            }
            if (destroy === true) {
                Debris.AddItem(grouped, 2);
            }
        }

        const handleSound = (sound?: Sound) => {
            if (sound !== undefined)
                sound.SoundGroup = SOUND_EFFECTS_GROUP;
        };
        const found = findModels(ReplicatedStorage.WaitForChild("ItemModels"));
        for (const model of found) {
            model.PivotTo(model.GetPivot().sub(new Vector3(0, -200, 0)));
            ungroup(model, model);
            for (const c of model.GetChildren()) {
                if (c.IsA("BasePart")) {
                    if (c.Name === "Part") {
                        c.CollisionGroup = "Item";
                        c.CanTouch = false;
                    }
                    else if (c.Name === "Conveyor") {
                        const beam = Conveyor.getBeam(1, c.Size.X);
                        const inverted = (c.FindFirstChild("Inverted") as BoolValue | undefined)?.Value ?? false;
                        const attachment0 = c.FindFirstChild("Attachment0") as Attachment | undefined;
                        const attachment1 = c.FindFirstChild("Attachment1") as Attachment | undefined;
                        if (inverted) {
                            beam.Attachment0 = attachment1;
                            beam.Attachment1 = attachment0;
                        }
                        else {
                            beam.Attachment0 = attachment0;
                            beam.Attachment1 = attachment1;
                        }

                        beam.Parent = c;
                        c.FrontSurface = Enum.SurfaceType.Studs;
                    }
                    else if (c.Name === "Hitbox") {
                        c.CollisionGroup = "ItemHitbox";
                    }
                    handleSound(c.FindFirstChildOfClass("Sound"));
                }
                else if (c.IsA("Sound"))
                    handleSound(c);
            }
            ReserveModels.reserveModels(model.Name, model);
        }
    }

    onInit() {
        this.preloadItemModels();
        Packets.buyItem.onInvoke((player, itemId) => this.buyItem(player, itemId));
        Packets.buyAllItems.onInvoke((player, shopId) => this.buyAllItems(player, shopId));
        Packets.inventory.set(this.dataService.empireData.items.inventory);
        Packets.bought.set(this.dataService.empireData.items.bought);
        Packets.placedItems.set(this.dataService.empireData.items.placed);
        Packets.placeItem.onInvoke((player, itemId, position, rotation) => this.placeItem(player, itemId, position, rotation));
        Packets.unplaceItems.listen((player, placementIds) => this.unplaceItems(player, placementIds));
        Packets.moveItem.onInvoke((player, placementId, position, rotation) => this.moveItem(player, placementId, position, rotation));

    }

    onStart() {
        this.fullUpdatePlacedItemsModels();
        this.placedItemsUpdated.connect((...placedItems) => {
            for (const placedItem of placedItems) {
                this.addItemModel(placedItem);
            }
        });
    }
}