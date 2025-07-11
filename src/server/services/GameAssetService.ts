import { OnInit, OnStart, Service } from "@flamework/core";
import { Debris, HttpService, MarketplaceService, PhysicsService, Players, ReplicatedStorage } from "@rbxts/services";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService, EmpireProfileTemplate } from "server/services/serverdata/DataService";
import { ItemsCanister, ItemsService } from "server/services/serverdata/ItemsService";
import Price from "shared/Price";
import Quest, { Stage } from "shared/Quest";
import { AREAS, PLACED_ITEMS_FOLDER, PlacedItem } from "shared/constants";
import Conveyor from "shared/item/Conveyor";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import NamedUpgrade from "shared/item/NamedUpgrade";
import Upgrader from "shared/item/Upgrader";
import Items from "shared/items/Items";
import ItemPlacement from "shared/utils/ItemPlacement";
import ReserveModels from "shared/utils/ReserveModels";
import { Signal } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { BombsService } from "./BombsService";
import { DarkMatterService } from "./DarkMatterService";
import { LevelService } from "./serverdata/LevelService";
import { QuestCanister, QuestsService } from "./serverdata/QuestsService";
import { UnlockedAreasService } from "./serverdata/UnlockedAreasService";
import { UpgradeBoardService } from "./serverdata/UpgradeBoardService";

declare global {
    interface ItemUtils {
        balanceChanged: Signal<(balance: Map<Currency, InfiniteMath>) => void>;
        itemsBought: Signal<(player: Player, items: Item[]) => void>;
        itemPlaced: Signal<(player: Player, placedItem: PlacedItem) => void>;
        unlockArea: (area: keyof (typeof AREAS)) => boolean;
        getBalance: () => Price;
        setBalance: (bal: Price) => void;
        calculateRawDropletValue: (droplet: BasePart) => Price | undefined;
        calculateDropletValue: (droplet: BasePart) => [Price | undefined, Price | undefined];
        
        /**
         * Gets the PlacedItem object directly linked to the empire's Profile.
         * 
         * @param placementId The placement UUID for the PlacedItem
         * @returns A mutable PlacedItem object that can be used to modify data
         */
        getPlacedItem: (placementId: string) => PlacedItem | undefined;
    
        /**
         * Get the Item object from its Id.
         * 
         * @param itemId Item Id
         * @returns Item
         */
        getItem: (itemId: string) => Item | undefined;
        getAmountPerUpgrade: () => {[upgradeId: string]: number};
        setUpgradeAmount: (upgradeId: string, amount: number) => void;
        checkPermLevel: (player: Player, action: keyof (typeof EmpireProfileTemplate.permLevels)) => boolean;
        getSavedSetup: (area: keyof (typeof AREAS)) => PlacedItem[] | undefined;
        saveSetup: (player: Player, area: keyof (typeof AREAS)) => boolean;
        loadSetup: (player: Player, area: keyof (typeof AREAS)) => boolean;
    }
}

type ProductFunction = (receiptInfo: ReceiptInfo, player: Player) => Enum.ProductPurchaseDecision;

let defMul = new Price();

@Service()
export class GameAssetService implements OnInit, OnStart {

    loadedStages = new Set<Stage>();
    itemPlaced = new Signal<(player: Player, placedItem: PlacedItem) => void>();
    itemsUnplaced = new Signal<(player: Player, placedItems: PlacedItem[]) => void>();
    setupSaved = new Signal<(player: Player, area: keyof (typeof AREAS)) => void>();
    setupLoaded = new Signal<(player: Player, area: keyof (typeof AREAS)) => void>();
    itemUtils: ItemUtils;
    productFunctions = new Map<number, ProductFunction>();

    constructor(private dataService: DataService, private itemsService: ItemsService, private currencyService: CurrencyService, 
        private upgradeBoardService: UpgradeBoardService, private questsService: QuestsService, private levelService: LevelService,
        private unlockedAreasService: UnlockedAreasService, private darkMatterService: DarkMatterService, private bombsService: BombsService) {
        defMul = new Price();
        for (const [currency] of pairs(Price.DETAILS_PER_CURRENCY)) {
            defMul.setCost(currency, 1);
        }
        this.itemUtils = {
            balanceChanged: this.currencyService.balanceChanged,
            itemsBought: this.itemsService.itemsBought,
            itemPlaced: this.itemPlaced,
            unlockArea: (area) => this.unlockedAreasService.unlockArea(area),
            getBalance: () => this.currencyService.getBalance(),
            setBalance: (balance) => this.currencyService.setBalance(balance),
            calculateRawDropletValue: (droplet) => this.calculateRawDropletValue(droplet),
            calculateDropletValue: (droplet) => this.calculateDropletValue(droplet),
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
            checkPermLevel: (player, action) => this.dataService.checkPermLevel(player, action),
            getSavedSetup: (area) => this.dataService.empireProfile?.Data.savedItems.get(area),
            saveSetup: (player, area) => {
                if (!this.dataService.checkPermLevel(player, "build")) {
                    return false;
                }
                const profile = this.dataService.empireProfile;
                if (profile === undefined)
                    return false;
                profile.Data.savedItems.set(area, profile.Data.items.placed.filter((placedItem) => placedItem.area === area));
                this.setupSaved.fire(player, area);
                return true;
            },
            loadSetup: (player, area) => {
                if (!this.dataService.checkPermLevel(player, "build")) {
                    return false;
                }
                const profile = this.dataService.empireProfile;
                if (profile === undefined)
                    return false;
                const savedItems = profile.Data.savedItems.get(area);
                if (savedItems === undefined)
                    return false;
                for (const savedItem of savedItems) {
                    this.placeItem(player, savedItem.item, new Vector3(savedItem.posX, savedItem.posY, savedItem.posZ), savedItem.rawRotation);
                }
                this.setupLoaded.fire(player, area);
                return true;
            },
        }
    }
    
    
    /**
     * Get the droplet's price with no upgrades.
     * 
     * @param dropletModel Droplet model to valuate
     * @returns Price of droplet
     */
    calculateRawDropletValue(dropletModel: BasePart) {
        const droplet = Droplet.getDroplet(dropletModel.GetAttribute("DropletId") as string) as Droplet;
        let worth = droplet.value;
        if (worth === undefined) {
            return;
        }
        let totalAdd = new Price();
        let totalMul: Price | undefined = defMul;
        for (const upgrade of dropletModel.GetChildren()) {
            if (!upgrade.IsA("ObjectValue") || upgrade.Value === undefined || upgrade.Value.Parent === undefined) {
                continue;
            }
            const item = Items.getItem(upgrade.GetAttribute("ItemId") as string) as Upgrader | undefined;
            if (item === undefined) {
                continue;
            }
            const add = item.add;
            if (add !== undefined) {
                totalAdd = totalAdd.add(add);
            }
            const mul = item.mul;
            if (mul !== undefined) {
                totalMul = totalMul.mul(mul);
            }
        }
        worth = worth.add(totalAdd);
        if (totalMul !== undefined) {
            worth = worth.mul(totalMul);
        }
        worth = worth.mul(math.min(100, dropletModel.GetAttribute("Health") as number) / 100);
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
            const formula = upgrade.dropletFormula;
            if (formula !== undefined) {
                worth = formula(worth, amount, upgrade.step);
            }
        }
        worth = worth.mul(this.darkMatterService.boost);
        if (this.bombsService.fundsBombEnabled) {
            worth = worth.mul(this.bombsService.fundsBombBoost);
        }
        return [worth, rawWorth];
    }

    loadItemModel(model: Model, item: Item) {
        item.loaded.fire(model, this.itemUtils, item);
    }

    unplaceItems(player: Player, placementIds: string[]): PlacedItem[] | undefined {
        if (!this.dataService.checkPermLevel(player, "build"))
            return undefined;
        const filtered = new Array<PlacedItem>();
        const unplacing = new Array<PlacedItem>();
        let somethingHappened = false;
        for (const placedItem of this.itemsService.getPlacedItems()) {
            const placementId = placedItem.placementId ?? "default";
            if (placementIds.includes(placementId)) {
                somethingHappened = true;
                this.removeItemModel(placementId);
                unplacing.push(placedItem);
            }
            else
                filtered.push(placedItem);
        }
        if (somethingHappened === false) {
            return undefined;
        }
        this.itemsService.setPlacedItems(filtered);
        for (const placedItem of unplacing) {
            const item = placedItem.item;
            this.itemsService.setItemAmount(item, this.itemsService.getItemAmount(item) + 1);
        }
        this.itemsUnplaced.fire(player, unplacing);
        return unplacing;
    }

    moveItem(player: Player, placementId: string, position: Vector3, rotation: number, accompanying?: string[]): [boolean, number?] {
        const placedItems = this.unplaceItems(player, accompanying === undefined ? [placementId] : [placementId, ...accompanying]);
        if (placedItems !== undefined) {
            return this.placeItem(player, placedItems[0].item, position, rotation);
        }
        return [false];
    }

    placeItem(player: Player, itemId: string, position: Vector3, rotation: number): [boolean, number?] {
        if (!this.dataService.checkPermLevel(player, "build")) {
            return [false];
        }
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
        if (area === undefined || area.buildBounds === undefined) {
            return [false];
        }
        const testModel = ReserveModels.itemModels.get(itemId);
        if (testModel === undefined) {
            error("bruh");
        }
        const cframe = area.buildBounds.calcPlacementCFrame(testModel, position, math.rad(rotation));
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
        this.itemPlaced.fire(player, placedItem);
        return [true, itemAmount - 1];
    }
    
    removeItemModel(placementId: string) {
        const f = PLACED_ITEMS_FOLDER.FindFirstChild(placementId);
        if (f !== undefined) {
            f.Destroy();
            return true;
        }
        return false;
    }

    addItemModel(placedItem: PlacedItem) {
        if (PLACED_ITEMS_FOLDER.FindFirstChild(placedItem.placementId ?? "default") !== undefined) {
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
        this.loadItemModel(model, item);
        return true;
    }

    addItemModels(placedItems: PlacedItem[]) {
        for (const placedItem of placedItems)
            this.addItemModel(placedItem);
        ItemsCanister.placedItems.set(placedItems);
        return true;
    }

    preloadItemModels() {
        const models = ReplicatedStorage.WaitForChild("ItemModels");
        const loaded = new Instance("Folder");
        loaded.Name = "LoadedItemModels";
        function findModels(instance: Instance): Model[] {
            let models = new Array<Model>();
            const children = instance.GetChildren();
            for (const child of children) {
                if (child.IsA("Folder")) {
                    const found = findModels(child);
                    models = [...models, ...found];
                }
                else if (child.IsA("Model")) {
                    models.push(child);
                }
            }
            return models;
        }
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

        const found = findModels(models);
        for (const model of found) {
            ungroup(model, model);
            for (const c of model.GetChildren()) {
                if (c.IsA("BasePart")) {
                    if (c.Name === "Part") {
                        c.CanTouch = false;
                    }
                    else if (c.Name === "Conveyor") {
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
            }
            ReserveModels.reserveModels(model.Name, model);
            const objectValue = new Instance("ObjectValue");
            objectValue.Name = model.Name;
            objectValue.Value = model;
            objectValue.Parent = loaded;
        }
        loaded.Parent = ReplicatedStorage;
    }

    /**
     * Searches through all placed items and checks if their models exist in the workspace. If not, add them.
     * If any models belong in the workspace but no placed item corresponds, remove them.
     * 
     */
    fullUpdatePlacedItemsModels() {
        const placedItems = this.itemsService.getPlacedItems();
        const ids = placedItems.map((value) => value.placementId ?? "default");
        for (const model of PLACED_ITEMS_FOLDER.GetChildren()) {
            if (!ids.includes(model.Name)) {
                model.Destroy();
            }
        }
        this.addItemModels(placedItems);
    }

    loadAvailableQuests(level?: number) {
        if (level === undefined) {
            level = this.levelService.getLevel();
            if (level === undefined) {
                warn("Level not ready yet");
                return;
            }
        }
        const stagePerQuest = this.questsService.getStagePerQuest();
        if (stagePerQuest === undefined) {
            return;
        }
        const itemUtils = this.itemUtils;
        const quests = Quest.init();
        for (const [id, quest] of quests) {
            if (quest.level > level || quest.loaded) {
                continue;
            }
            const current = stagePerQuest.get(id);
            if (current !== undefined && current < 0) {
                continue;
            }
            quest.loaded = true;
            quest.stages.forEach((stage, index) => {
                if (this.loadedStages.has(stage)) {
                    return;
                }
                const load = stage.load;
                if (load === undefined) {
                    warn("No load found");
                    return;
                }
                this.loadedStages.add(stage);
                const rem = load(itemUtils, stage);
                const connection = stage.completed.connect(() => {
                    const newStage = this.questsService.completeStage(quest, index);
                    if (newStage === undefined) {
                        return;
                    }
                    rem();
                    print(`Completed stage ${index} in ${quest.id}, now in stage ${newStage}`);
                    if (newStage === -1) {
                        this.completeQuest(quest);
                    }
                    this.loadedStages.delete(stage);
                    connection.disconnect();
                });
            });
        }
    }

    completeQuest(quest: Quest) {
        QuestCanister.questCompleted.fireAll(quest.id);
        const reward = quest.reward;
        if (reward.xp !== undefined) {
            const originalXp = this.levelService.getXp();
            if (originalXp === undefined) {
                warn("No original xp, not rewarding");
            }
            else {
                this.levelService.setXp(originalXp + reward.xp);
            }
        }
        if (reward.items !== undefined) {
            for (const [item, amount] of reward.items) {
                this.itemsService.setItemAmount(item.id, this.itemsService.getItemAmount(item.id) + amount);
            }
        }
    }

    setProductFunction(productID: number, productFunction: ProductFunction) {
        this.productFunctions.set(productID, productFunction);
    }

    onInit() {
        this.preloadItemModels();
    }

    onStart() {
        PhysicsService.RegisterCollisionGroup("Droplets");
        PhysicsService.CollisionGroupSetCollidable("Droplets", "Droplets", false);
        PhysicsService.RegisterCollisionGroup("Players");
        PhysicsService.CollisionGroupSetCollidable("Players", "Droplets", false);
        this.dataService.empireProfileLoaded.connect(() => this.fullUpdatePlacedItemsModels());
        this.fullUpdatePlacedItemsModels();
        this.itemsService.placedItemsUpdated.connect((...placedItems) => {
            for (const placedItem of placedItems) {
                this.addItemModel(placedItem);
            }
        });
        Items.init().forEach((value) => value.initialised.fire(this.itemUtils, value));
        Quest.init().forEach((quest, questId) => quest.stages.forEach((stage, index) => {
            const onPositionChanged = (position?: Vector3) => ReplicatedStorage.SetAttribute(`${questId}${index}`, position);
            onPositionChanged(stage.position);
            stage.positionChanged.connect((position) => onPositionChanged(position));
        }));
        this.loadAvailableQuests();
        this.levelService.levelChanged.connect(() => this.loadAvailableQuests());

        MarketplaceService.ProcessReceipt = (receiptInfo: ReceiptInfo) => {
            const productFunction = this.productFunctions.get(receiptInfo.ProductId);
            const player = Players.GetPlayerByUserId(receiptInfo.PlayerId);
            if (productFunction === undefined || player === undefined) {
                print(receiptInfo);
                return Enum.ProductPurchaseDecision.NotProcessedYet;
            }
            return productFunction(receiptInfo, player);
        }

        ItemsCanister.placeItem.onInvoke((player, itemId, position, rotation) => this.placeItem(player, itemId, position, rotation));
        ItemsCanister.unplaceItems.connect((player, placementIds) => this.unplaceItems(player, placementIds));
        ItemsCanister.moveItem.onInvoke((player, placementId, position, rotation) => this.moveItem(player, placementId, position, rotation));
    }
}