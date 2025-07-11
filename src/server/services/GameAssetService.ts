import { OnStart, Service } from "@flamework/core";
import { HttpService, MarketplaceService, PhysicsService, Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { ItemsCanister, ItemsService } from "server/services/serverdata/ItemsService";
import { AREAS, PlacedItem } from "shared/constants";
import Conveyor from "shared/item/Conveyor";
import Droplet from "shared/item/Droplet";
import Furnace from "shared/item/Furnace";
import Item from "shared/item/Item";
import ItemUtils from "shared/item/ItemUtils";
import Items from "shared/items/Items";
import Upgrader from "shared/item/Upgrader";
import ItemPlacement from "shared/utils/ItemPlacement";
import { UpgradeBoardService } from "./serverdata/UpgradeBoardService";
import NamedUpgrade from "shared/item/NamedUpgrade";
import Price from "shared/Price";

type ProductFunction = (receiptInfo: ReceiptInfo, player: Player) => Enum.ProductPurchaseDecision;

@Service()
export class GameAssetService implements OnStart {

    placedItemsFolder = new Instance("Folder");
    itemModels = new Map<string, Model>();
    productFunctions = new Map<number, ProductFunction>();

    constructor(private dataService: DataService, private itemsService: ItemsService, private currencyService: CurrencyService, private upgradeBoardService: UpgradeBoardService) {

    }
    
    calculateRawDropletValue(dropletModel: BasePart) {
        const droplet = Droplet.getDroplet(dropletModel.GetAttribute("DropletId") as string) as Droplet;
        let worth = droplet.getValue();
        if (worth === undefined) {
            return;
        }
        let totalAdd = new Price();
        let totalMul: Price | undefined = undefined;
        for (const upgrade of dropletModel.GetChildren()) {
            if (!upgrade.IsA("ObjectValue") || upgrade.Value === undefined || upgrade.Value.Parent === undefined) {
                continue;
            }
            const item = Items.getItem(upgrade.GetAttribute("ItemId") as string) as Upgrader | undefined;
            if (item === undefined) {
                continue;
            }
            const add = item.getAdd();
            if (add !== undefined) {
                totalAdd = totalAdd.add(add);
            }
            const mul = item.getMul();
            if (mul !== undefined) {
                totalMul = totalMul === undefined ? mul : totalMul.mul(mul);
            }
        }
        worth = worth.add(totalAdd);
        if (totalMul !== undefined) {
            worth = worth.mul(totalMul);
        }
        return worth;
    }

    calculateDropletValue(dropletModel: BasePart): [Price | undefined, Price | undefined] {
        const rawWorth = this.calculateRawDropletValue(dropletModel);
        if (rawWorth === undefined) {
            return [undefined, undefined];
        }
        let worth = new Price(rawWorth.costPerCurrency);
        for (const [upgradeId, amount] of pairs(this.upgradeBoardService.getAmountPerUpgrade())) {
            const upgrade = NamedUpgrade.getUpgrade(upgradeId as string);
            if (upgrade === undefined)
                continue;
            const formula = upgrade.getDropletFormula();
            if (formula !== undefined) {
                worth = formula(worth, amount, upgrade.getStep());
            }
        }
        return [worth, rawWorth];
    }

    getItemUtils(item: Item): ItemUtils {
        return {
            getPlacedItems: () => this.placedItemsFolder,
            getBalance: () => this.currencyService.getBalance(),
            setBalance: (balance) => this.currencyService.setBalance(balance),
            calculateRawDropletValue: (droplet) => this.calculateRawDropletValue(droplet),
            calculateDropletValue: (droplet) => this.calculateDropletValue(droplet),
            applyFormula: (callback, x, formula) => item.repeat(undefined, () => callback(formula(x())), 1),
            getPlacedItem: (placementId) => {
                for (const placedItem of this.itemsService.getPlacedItems()) {
                    if (placedItem.placementId === placementId)
                        return placedItem;
                }
                return undefined;
            },
            getItem: (itemId) => Items.getItem(itemId),
            getAmountPerUpgrade: () => this.upgradeBoardService.getAmountPerUpgrade(),
            setUpgradeAmount: (upgradeId, amount) => this.upgradeBoardService.setUpgradeAmount(upgradeId, amount),
        }
    }

    loadItemModel(model: Model, item: Item) {
        item.loaded.Fire(model, this.getItemUtils(item), item);
    }

    unplaceItem(placementId: string): [boolean, string | undefined] {
        if (!this.removeItemModel(placementId))
            return [false, undefined];
        const placedItems: PlacedItem[] = [];
        let p: PlacedItem | undefined = undefined;
        for (const placedItem of this.itemsService.getPlacedItems()) {
            if ((placedItem.placementId ?? "default") === placementId) {
                p = placedItem;
            }
            else {
                placedItems.push(placedItem);
            }
        }
        if (p !== undefined) {
            this.itemsService.setPlacedItems(placedItems);
            this.itemsService.setItemAmount(p.item, this.itemsService.getItemAmount(p.item) + 1);
            return [true, p.item];
        }
        return [false, undefined];
    }

    moveItem(placementId: string, position: Vector3, rotation: number): [boolean, number?] {
        const [success, itemId] = this.unplaceItem(placementId);
        if (success && itemId !== undefined) {
            return this.placeItem(itemId, position, rotation);
        }
        return [false];
    }

    placeItem(itemId: string, position: Vector3, rotation: number): [boolean, number?] {
        const itemAmount = this.itemsService.getItemAmount(itemId);
        if (itemAmount < 1 || rotation % 90 !== 0) {
            return [false];
        }
        const placedItems = this.itemsService.getPlacedItems();
        const item = Items.getItem(itemId);
        if (item === undefined) {
            error("How did this happen?");
        }
        const area = ItemPlacement.getAreaOfPosition(position, item.placeableAreas);
        if (area === undefined) {
            return [false];
        }
        const testModel = this.getItemModel(itemId)?.Clone();
        if (testModel === undefined) {
            error("bruh");
        }
        const cframe = area.getBuildBounds().calcPlacementCFrame(testModel, position, math.rad(rotation));
        testModel.PivotTo(cframe);
        let areaId = undefined;
        for (const [id, a] of pairs(AREAS)) {
            if (a.name === area?.name) {
                areaId = id;
            }
        }
        if (areaId === undefined || ItemPlacement.isTouchingPlacedItem(testModel)) {
            return [false];
        }
        const [rotX, rotY, rotZ] = cframe.ToOrientation();
        const placedItem = {
            placementId: HttpService.GenerateGUID(false),
            item: itemId,
            posX: cframe.X,
            posY: cframe.Y,
            posZ: cframe.Z,
            rotX: math.deg(rotX),
            rotY: math.deg(rotY),
            rotZ: math.deg(rotZ),
            rawRotation: rotation,
            area: areaId
        };
        placedItems.push(placedItem);
        this.addItemModels([placedItem]);
        this.itemsService.setPlacedItems(placedItems);
        this.itemsService.setItemAmount(itemId, itemAmount - 1);
        return [true, itemAmount - 1];
    }
    
    removeItemModel(placementId: string) {
        const f = this.placedItemsFolder.FindFirstChild(placementId);
        if (f !== undefined) {
            f.Destroy();
            return true;
        }
        return false;
    }

    addItemModel(placedItem: PlacedItem) {
        if (this.placedItemsFolder.FindFirstChild(placedItem.placementId ?? "default") !== undefined) {
            return false;
        }
        const model = this.getItemModel(placedItem.item)?.Clone();
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
        model.SetAttribute("ItemName", item.getName());
        model.SetAttribute("Rotation", placedItem.rawRotation);
        model.Parent = this.placedItemsFolder;
        this.loadItemModel(model, item);
        return true;
    }

    addItemModels(placedItems: PlacedItem[]) {
        for (const placedItem of placedItems)
            this.addItemModel(placedItem);
        ItemsCanister.placedItems.set(placedItems);
        return true;
    }

    /**
     * Searches through all placed items and checks if their models exist in the workspace. If not, add them.
     * If any models belong in the workspace but no placed item corresponds, remove them.
     * 
     */
    fullUpdatePlacedItemsModels() {
        const placedItems = this.itemsService.getPlacedItems();
        const ids = placedItems.map((value) => value.placementId ?? "default");
        for (const model of this.placedItemsFolder.GetChildren()) {
            if (!ids.includes(model.Name)) {
                model.Destroy();
            }
        }
        this.addItemModels(placedItems);
    }

    getItemModel(itemId: string) {
        return this.itemModels.get(itemId);
    }

    preloadItemModels() {
        const models = ReplicatedStorage.WaitForChild("ItemModels");
        const loaded = new Instance("Folder");
        loaded.Name = "LoadedItemModels";
        for (const model of models.GetDescendants()) {
            if (model.IsA("Model")) {
                for (const c of model.GetChildren()) {
                    if (c.Name === "Conveyor" && c.IsA("BasePart")) {
                        const beam = Conveyor.getBeam(1, c.Size.X);
                        const inverted = (c.FindFirstChild("Inverted") as BoolValue | undefined)?.Value ?? false;
                        const attachment0 = c.WaitForChild("Attachment0") as Attachment;
                        const attachment1 = c.WaitForChild("Attachment1") as Attachment;
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
                }
                this.itemModels.set(model.Name, model);
                const objectValue = new Instance("ObjectValue");
                objectValue.Name = model.Name;
                objectValue.Value = model;
                objectValue.Parent = loaded;
            }
        }
        loaded.Parent = ReplicatedStorage;
    }

    setProductFunction(productID: number, productFunction: ProductFunction) {
        this.productFunctions.set(productID, productFunction);
    }

    onStart() {
        PhysicsService.RegisterCollisionGroup("Droplets");
        PhysicsService.CollisionGroupSetCollidable("Droplets", "Droplets", false);
        this.placedItemsFolder.Name = "PlacedItems";
        this.placedItemsFolder.Parent = Workspace;

        this.preloadItemModels();

        this.dataService.empireProfileLoaded.Connect(() => this.fullUpdatePlacedItemsModels());
        this.fullUpdatePlacedItemsModels();

        this.itemsService.placedItemsUpdated.Connect((...placedItems) => {
            for (const placedItem of placedItems) {
                this.addItemModel(placedItem);
            }
        });
        Items.init().forEach((value) => value.initialised.Fire(this.getItemUtils(value), value));

        MarketplaceService.ProcessReceipt = (receiptInfo: ReceiptInfo) => {
            const productFunction = this.productFunctions.get(receiptInfo.ProductId);
            const player = Players.GetPlayerByUserId(receiptInfo.PlayerId);
            if (productFunction === undefined || player === undefined) {
                print(receiptInfo);
                return Enum.ProductPurchaseDecision.NotProcessedYet;
            }
            return productFunction(receiptInfo, player);
        }

        ItemsCanister.placeItem.onInvoke((_player, itemId, position, rotation) => this.placeItem(itemId, position, rotation));
        ItemsCanister.unplaceItem.onInvoke((_player, placementId) => this.unplaceItem(placementId));
        ItemsCanister.moveItem.onInvoke((_player, placementId, position, rotation) => this.moveItem(placementId, position, rotation));
    }
}