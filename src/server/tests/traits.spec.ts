import { getAllInstanceInfo } from "@antivivi/vrldk";
import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { HttpService, Workspace } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Condenser from "shared/item/traits/dropper/Condenser";
import Dropper from "shared/item/traits/dropper/Dropper";
import Generator from "shared/item/traits/generator/Generator";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import IllusionaryPortal from "shared/items/0/automatic/IllusionaryPortal";
import VoidSkyUpgrader from "shared/items/0/happylike/VoidSkyUpgrader";
import CoalescentRefiner from "shared/items/0/ifinitude/CoalescentRefiner";
import Sideswiper from "shared/items/0/winsome/Sideswiper";
import JoyfulPark from "shared/items/1/joyful/JoyfulPark";
import Items from "shared/items/Items";
import TheFirstGenerator from "shared/items/negative/friendliness/TheFirstGenerator";
import TheFirstConveyor from "shared/items/negative/tfd/TheFirstConveyor";
import TheFirstDropper from "shared/items/negative/tfd/TheFirstDropper";
import TheFirstUpgrader from "shared/items/negative/tfd/TheFirstUpgrader";
import BasicCauldron from "shared/items/negative/tlg/BasicCauldron";
import ImprovedFurnace from "shared/items/negative/tlg/ImprovedFurnace";
import SmallReactor from "shared/items/negative/unimpossible/SmallReactor";

type TouchHandle = {
    part: BasePart;
    touch: (droplet: BasePart, dropletInfo: InstanceInfo) => void;
};

type SpawnedModel = {
    item: Item;
    model: Model;
    modelInfo: InstanceInfo;
    placementId: string;
    cleanup: () => void;
};

type SpawnedDroplet = {
    droplet: BasePart;
    dropletInfo: InstanceInfo;
    cleanup: () => void;
};

function withWeatherDisabled<T>(callback: () => T) {
    const revenue = Server.Revenue;
    const previous = revenue.weatherBoostEnabled;
    revenue.weatherBoostEnabled = false;
    try {
        return callback();
    } finally {
        revenue.weatherBoostEnabled = previous;
    }
}

function spawnItemModel(itemId: string): SpawnedModel {
    const item = Items.getItem(itemId);
    expect(item === undefined).toBe(false);

    const placementId = `${itemId}_${HttpService.GenerateGUID(false)}`;
    const placedItem: PlacedItem = {
        item: item!.id,
        posX: 0,
        posY: 0,
        posZ: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
    };

    const model = item!.createModel(placedItem);
    expect(model === undefined).toBe(false);

    model!.Name = placementId;
    model!.Parent = PLACED_ITEMS_FOLDER;
    const modelInfo = getAllInstanceInfo(model!);
    modelInfo.maintained = true;
    Server.Item.modelPerPlacementId.set(placementId, model!);

    item!.load(model!);

    return {
        item: item!,
        model: model!,
        modelInfo,
        placementId,
        cleanup: () => {
            model!.Destroy();
            Server.Item.modelPerPlacementId.delete(placementId);
        },
    };
}

function spawnDroplet(template: Droplet): SpawnedDroplet {
    const dropperModel = new Instance("Model") as Model;
    dropperModel.Name = `TestDropper_${HttpService.GenerateGUID(false)}`;
    dropperModel.Parent = PLACED_ITEMS_FOLDER;
    const dropperInfo = getAllInstanceInfo(dropperModel);
    dropperInfo.itemId = "TestDropper";

    const instantiator = template.getInstantiator(dropperModel);
    const droplet = instantiator() as BasePart;
    droplet.Parent = Workspace;

    const dropletInfo = Droplet.SPAWNED_DROPLETS.get(droplet);
    expect(dropletInfo === undefined).toBe(false);

    return {
        droplet,
        dropletInfo: dropletInfo!,
        cleanup: () => {
            droplet.Destroy();
            dropperModel.Destroy();
        },
    };
}

function getTouchByTag(model: Model, tagName: string): TouchHandle {
    for (const descendant of model.GetDescendants()) {
        if (!descendant.IsA("BasePart") || !descendant.HasTag(tagName)) continue;
        const info = getAllInstanceInfo(descendant);
        const dropletTouched = info.dropletTouched;
        expect(dropletTouched).toBeDefined();
        return {
            part: descendant,
            touch: dropletTouched!,
        };
    }
    throw `No part with tag ${tagName} found in model ${model.Name}`;
}

function getTouchByName(model: Model, partName: string): TouchHandle {
    for (const descendant of model.GetDescendants()) {
        if (!descendant.IsA("BasePart") || descendant.Name !== partName) continue;
        const info = getAllInstanceInfo(descendant);
        const dropletTouched = info.dropletTouched;
        expect(dropletTouched).toBeDefined();

        return {
            part: descendant,
            touch: dropletTouched!,
        };
    }
    throw `Part ${partName} not found in model ${model.Name}`;
}

function setupTestCondenser() {
    const itemId = `TestCondenser_${HttpService.GenerateGUID(false)}`;
    const item = new Item(itemId).addPlaceableArea("BarrenIslands");
    const condenser = item.trait(Condenser).setQuota(1);
    const droplet = Droplet.FundsCompactDroplet;
    condenser.addDroplets(droplet);

    const placementId = `${itemId}_${HttpService.GenerateGUID(false)}`;
    const placedItem: PlacedItem = {
        item: itemId,
        posX: 0,
        posY: 0,
        posZ: 0,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        area: "BarrenIslands",
    };

    Server.Data.empireData.items.worldPlaced.set(placementId, placedItem);

    const model = new Instance("Model") as Model;
    model.Name = placementId;
    model.Parent = PLACED_ITEMS_FOLDER;

    const drop = new Instance("Part") as BasePart;
    drop.Name = "Drop";
    drop.Size = new Vector3(1, 1, 1);
    drop.Anchored = true;
    drop.Parent = model;
    model.PrimaryPart = drop;

    Server.Item.modelPerPlacementId.set(placementId, model);

    const info = getAllInstanceInfo(model);
    info.maintained = true;

    item.load(model);

    const furnaceProcessed = getAllInstanceInfo(model).furnaceProcessed;
    expect(furnaceProcessed).toBeDefined();

    return {
        item,
        placementId,
        model,
        droplet,
        furnaceProcessed: furnaceProcessed!,
        cleanup: () => {
            model.Destroy();
            Server.Item.modelPerPlacementId.delete(placementId);
            Server.Data.empireData.items.worldPlaced.delete(placementId);
        },
    };
}

beforeEach(() => {
    Server.Data.softWipe();
});

describe("Upgrader", () => {
    it("applies additive boosts to droplets when lasers are touched", () => {
        const spawned = spawnItemModel(TheFirstUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) return;

        withWeatherDisabled(() => {
            const beforeValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
            expect(beforeValue.get("Funds")?.equals(firstDropletFunds)).toBe(true);
            handle.touch(dropletData.droplet, dropletData.dropletInfo);
        });

        const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);

        const upgraderFundsAdd = TheFirstUpgrader.findTrait("Upgrader")?.add?.get("Funds");
        if (upgraderFundsAdd === undefined) throw "Upgrader add Funds is undefined";

        expect(afterValue.get("Funds")?.equals(firstDropletFunds.add(upgraderFundsAdd))).toBe(true);
        expect(dropletData.dropletInfo.upgrades?.size()).toBe(1);

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("applies multiplicative boosts to droplets", () => {
        const spawned = spawnItemModel(SmallReactor.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) return;

        withWeatherDisabled(() => {
            const beforeValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
            expect(beforeValue.get("Funds")?.equals(firstDropletFunds)).toBe(true);
            handle.touch(dropletData.droplet, dropletData.dropletInfo);
        });

        const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);

        const upgraderFundsMul = SmallReactor.findTrait("Upgrader")?.mul?.get("Funds");
        if (upgraderFundsMul === undefined) throw "Upgrader mul Funds is undefined";

        expect(afterValue.get("Funds")?.equals(firstDropletFunds.mul(upgraderFundsMul))).toBe(true);
        expect(dropletData.dropletInfo.upgrades?.size()).toBe(1);

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("combines additive and multiplicative boosts from different upgraders", () => {
        const additive = spawnItemModel(TheFirstUpgrader.id);
        const multiplicative = spawnItemModel(SmallReactor.id);
        const additiveHandle = getTouchByTag(additive.model, "Laser");
        const multiplicativeHandle = getTouchByTag(multiplicative.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) return;

        withWeatherDisabled(() => {
            const beforeValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
            expect(beforeValue.get("Funds")?.equals(firstDropletFunds)).toBe(true);
            additiveHandle.touch(dropletData.droplet, dropletData.dropletInfo);
            multiplicativeHandle.touch(dropletData.droplet, dropletData.dropletInfo);
        });

        const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);

        const upgraderAdd = TheFirstUpgrader.findTrait("Upgrader")?.add?.get("Funds");
        if (upgraderAdd === undefined) throw "Additive Upgrader add Funds is undefined";
        const upgraderMul = SmallReactor.findTrait("Upgrader")?.mul?.get("Funds");
        if (upgraderMul === undefined) throw "Multiplicative Upgrader mul Funds is undefined";

        expect(afterValue.get("Funds")?.equals(firstDropletFunds.add(upgraderAdd).mul(upgraderMul))).toBe(true);
        expect(dropletData.dropletInfo.upgrades?.size()).toBe(2);

        dropletData.cleanup();
        additive.cleanup();
        multiplicative.cleanup();
    });

    it("applies power boosts alongside other multipliers across currencies", () => {
        const spawned = spawnItemModel(JoyfulPark.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.HappyDroplet);

        const initialValue = withWeatherDisabled(() => {
            const beforeValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
            return beforeValue;
        });

        const fundsBefore = initialValue.get("Funds")!;
        const powerBefore = initialValue.get("Power")!;
        const skillBefore = initialValue.get("Skill")!;

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);

        let expected = Droplet.HappyDroplet.value;

        const upgrader = JoyfulPark.findTrait("Upgrader")!;

        expected = expected.mul(upgrader.mul!).pow(upgrader.pow!);

        expect(afterValue.get("Funds")?.equals(expected.get("Funds")!)).toBe(true);
        expect(afterValue.get("Power")?.equals(expected.get("Power")!)).toBe(true);
        expect(afterValue.get("Skill")?.equals(expected.get("Skill")!)).toBe(true);
        expect(afterValue.get("Funds")?.moreThan(fundsBefore)).toBe(true);
        expect(afterValue.get("Power")?.moreThan(powerBefore)).toBe(true);
        expect(afterValue.get("Skill")?.moreThan(skillBefore)).toBe(true);

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("drops upgrades if the source model is destroyed before incineration", () => {
        const upgrader = spawnItemModel(TheFirstUpgrader.id);
        const furnace = spawnItemModel(ImprovedFurnace.id);
        const upgraderHandle = getTouchByTag(upgrader.model, "Laser");
        const furnaceHandle = getTouchByTag(furnace.model, "Lava");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) return;

        const furnaceMul = ImprovedFurnace.findTrait("Furnace")?.mul?.get("Funds");
        if (furnaceMul === undefined) throw "Furnace mul Funds is undefined";

        withWeatherDisabled(() => upgraderHandle.touch(dropletData.droplet, dropletData.dropletInfo));
        expect(dropletData.dropletInfo.upgrades?.size()).toBe(1);

        upgrader.cleanup();
        Server.Currency.set("Funds", new OnoeNum(0));

        withWeatherDisabled(() => furnaceHandle.touch(dropletData.droplet, dropletData.dropletInfo));

        expect(Server.Currency.get("Funds").equals(furnaceMul.mul(firstDropletFunds))).toBe(true);

        dropletData.cleanup();
        furnace.cleanup();
    });

    it("ignores duplicate touches from the same laser", () => {
        const spawned = spawnItemModel(TheFirstUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) return;

        const upgraderAdd = TheFirstUpgrader.findTrait("Upgrader")?.add?.get("Funds");
        if (upgraderAdd === undefined) throw "Upgrader add Funds is undefined";

        withWeatherDisabled(() => {
            handle.touch(dropletData.droplet, dropletData.dropletInfo);
            handle.touch(dropletData.droplet, dropletData.dropletInfo);
        });

        const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
        expect(afterValue.get("Funds")?.equals(firstDropletFunds.add(upgraderAdd))).toBe(true);
        expect(dropletData.dropletInfo.upgrades?.size()).toBe(1);

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("does not upgrade droplets when the item is not maintained", () => {
        const spawned = spawnItemModel(TheFirstUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) return;

        spawned.modelInfo.maintained = false;
        const laserInfo = getAllInstanceInfo(handle.part);
        laserInfo.maintained = false;

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        expect(dropletData.dropletInfo.upgrades?.size()).toBe(0);
        const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
        expect(afterValue.get("Funds")?.equals(firstDropletFunds)).toBe(true);

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("does not upgrade droplets when the source model is broken", () => {
        const spawned = spawnItemModel(TheFirstUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) return;

        spawned.modelInfo.broken = true;

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        expect(dropletData.dropletInfo.upgrades?.size()).toBe(0);
        const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
        expect(afterValue.get("Funds")?.equals(firstDropletFunds)).toBe(true);

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("ignores upgrades when the source upgrader is destroyed", () => {
        const spawned = spawnItemModel(TheFirstUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) {
            dropletData.cleanup();
            spawned.cleanup();
            throw "First droplet Funds is undefined";
        }

        const upgraderAdd = TheFirstUpgrader.findTrait("Upgrader")?.add?.get("Funds");
        if (upgraderAdd === undefined) {
            dropletData.cleanup();
            spawned.cleanup();
            throw "Upgrader add Funds is undefined";
        }

        withWeatherDisabled(() => {
            const beforeValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
            expect(beforeValue.get("Funds")?.equals(firstDropletFunds)).toBe(true);
            handle.touch(dropletData.droplet, dropletData.dropletInfo);
        });

        const boostedValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
        expect(boostedValue.get("Funds")?.equals(firstDropletFunds.add(upgraderAdd))).toBe(true);
        spawned.cleanup();

        const afterCleanup = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
        expect(afterCleanup.get("Funds")?.equals(firstDropletFunds)).toBe(true);
        dropletData.cleanup();
    });
});

describe("Furnace", () => {
    it("burns droplets and credits furnace rewards", () => {
        const spawned = spawnItemModel(ImprovedFurnace.id);
        const handle = getTouchByTag(spawned.model, "Lava");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) return;

        Server.Currency.set("Funds", new OnoeNum(0));

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        const furnaceMul = ImprovedFurnace.findTrait("Furnace")?.mul?.get("Funds");
        if (furnaceMul === undefined) throw "Furnace mul Funds is undefined";

        expect(Server.Currency.get("Funds").equals(furnaceMul.mul(firstDropletFunds))).toBe(true);
        expect(dropletData.dropletInfo.incinerated).toBe(true);

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("skips processing when the furnace is broken", () => {
        const spawned = spawnItemModel(ImprovedFurnace.id);
        const handle = getTouchByTag(spawned.model, "Lava");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        spawned.modelInfo.broken = true;
        const zero = new OnoeNum(0);
        Server.Currency.set("Funds", zero);

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        expect(Server.Currency.get("Funds").equals(zero)).toBe(true);
        expect(dropletData.dropletInfo.incinerated).toBe(undefined);

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("applies div and root softcaps when droplet value exceeds thresholds", () => {
        const furnace = spawnItemModel(ImprovedFurnace.id);
        const handle = getTouchByTag(furnace.model, "Lava");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        dropletData.dropletInfo.upgrades ??= new Map();
        dropletData.dropletInfo.upgrades.set("TestBoost", {
            model: furnace.model,
            boost: {
                mul: new CurrencyBundle().set("Funds", 1e308),
            },
        });

        Server.Currency.set("Funds", new OnoeNum(0));

        const furnaceTrait = ImprovedFurnace.findTrait("Furnace");
        expect(furnaceTrait).toBeDefined();
        if (furnaceTrait === undefined) {
            dropletData.cleanup();
            furnace.cleanup();
            throw "Furnace trait is undefined";
        }

        const naiveResult = withWeatherDisabled(() => {
            const result = Server.Revenue.calculateDropletValue(dropletData.droplet);
            result.applySource();
            result.applyOperative(furnaceTrait);
            return result.coalesce();
        });
        const naiveFunds = naiveResult.get("Funds");
        expect(naiveFunds).toBeDefined();
        if (naiveFunds === undefined) {
            dropletData.cleanup();
            furnace.cleanup();
            throw "Naive furnace funds is undefined";
        }

        const expectedResult = withWeatherDisabled(() => {
            const result = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            result.applySource();
            result.applyOperative(furnaceTrait);
            result.applyFinal();
            return result;
        });
        const expectedFunds = expectedResult.coalesce().get("Funds");
        expect(expectedFunds).toBeDefined();
        if (expectedFunds === undefined) {
            dropletData.cleanup();
            furnace.cleanup();
            throw "Expected furnace funds is undefined";
        }

        expect(expectedResult.factors.some(([label]) => label === "SOFTCAPDIV")).toBe(true);
        expect(expectedResult.factors.some(([label]) => label === "SOFTCAPROOT")).toBe(true);
        expect(expectedFunds.lessThan(naiveFunds)).toBe(true);

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        const afterFunds = Server.Currency.get("Funds");

        expect(afterFunds.equals(expectedFunds)).toBe(true);
        expect(afterFunds.equals(naiveFunds)).toBe(false);

        Server.Currency.set("Funds", new OnoeNum(0));
        dropletData.cleanup();
        furnace.cleanup();
    });

    it("applies div and root softcaps when balance exceeds thresholds", () => {
        const furnace = spawnItemModel(ImprovedFurnace.id);
        const handle = getTouchByTag(furnace.model, "Lava");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        dropletData.dropletInfo.upgrades ??= new Map();
        dropletData.dropletInfo.upgrades.set("TestBoost", {
            model: furnace.model,
            boost: {
                mul: new CurrencyBundle().set("Funds", 1e307),
            },
        });

        const furnaceTrait = ImprovedFurnace.findTrait("Furnace");
        expect(furnaceTrait).toBeDefined();
        if (furnaceTrait === undefined) {
            dropletData.cleanup();
            furnace.cleanup();
            throw "Furnace trait is undefined";
        }

        const highBalance = new OnoeNum(1e308);
        Server.Currency.set("Funds", highBalance);

        const naiveResult = withWeatherDisabled(() => {
            const result = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            result.applySource();
            result.applyOperative(furnaceTrait);
            return result.coalesce();
        });
        const naiveFunds = naiveResult.get("Funds");
        expect(naiveFunds).toBeDefined();
        if (naiveFunds === undefined) {
            dropletData.cleanup();
            furnace.cleanup();
            Server.Currency.set("Funds", new OnoeNum(0));
            throw "Naive furnace funds is undefined";
        }

        const expectedResult = withWeatherDisabled(() => {
            const result = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            result.applySource();
            result.applyOperative(furnaceTrait);
            result.applyFinal();
            return result;
        });
        const expectedBundle = expectedResult.coalesce();
        const expectedFunds = expectedBundle.get("Funds");
        expect(expectedFunds).toBeDefined();
        if (expectedFunds === undefined) {
            dropletData.cleanup();
            furnace.cleanup();
            Server.Currency.set("Funds", new OnoeNum(0));
            throw "Expected furnace funds is undefined";
        }

        expect(expectedFunds.lessThan(naiveFunds)).toBe(true);
        expect(expectedResult.factors.some(([label]) => label === "SOFTCAPDIV")).toBe(true);
        expect(expectedResult.factors.some(([label]) => label === "SOFTCAPROOT")).toBe(true);

        const beforeFunds = Server.Currency.get("Funds");
        expect(beforeFunds.equals(highBalance)).toBe(true);

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        const afterFunds = Server.Currency.get("Funds");
        const expectedFinalFunds = new CurrencyBundle().set("Funds", highBalance).add(expectedBundle).get("Funds");
        expect(expectedFinalFunds).toBeDefined();
        if (expectedFinalFunds === undefined) {
            dropletData.cleanup();
            furnace.cleanup();
            Server.Currency.set("Funds", new OnoeNum(0));
            throw "Expected final funds is undefined";
        }

        const naiveFinalFunds = new CurrencyBundle().set("Funds", highBalance).add(naiveResult).get("Funds");
        expect(naiveFinalFunds).toBeDefined();
        if (naiveFinalFunds === undefined) {
            dropletData.cleanup();
            furnace.cleanup();
            Server.Currency.set("Funds", new OnoeNum(0));
            throw "Naive final funds is undefined";
        }

        expect(afterFunds.equals(expectedFinalFunds)).toBe(true);
        expect(afterFunds.equals(naiveFinalFunds)).toBe(false);
        expect(dropletData.dropletInfo.incinerated).toBe(true);

        Server.Currency.set("Funds", new OnoeNum(0));
        dropletData.cleanup();
        furnace.cleanup();
    });

    it("ignores upgrader boosts for non-sky droplets in cauldrons", () => {
        const upgrader = spawnItemModel(TheFirstUpgrader.id);
        const furnace = spawnItemModel(BasicCauldron.id);
        const laserHandle = getTouchByTag(upgrader.model, "Laser");
        const lavaHandle = getTouchByTag(furnace.model, "Lava");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) return;

        const upgraderFundsAdd = TheFirstUpgrader.findTrait("Upgrader")?.add?.get("Funds");
        if (upgraderFundsAdd === undefined) throw "Upgrader add Funds is undefined";

        const furnaceMul = BasicCauldron.findTrait("Furnace")?.mul?.get("Funds");
        if (furnaceMul === undefined) throw "Furnace mul Funds is undefined";

        Server.Currency.set("Funds", new OnoeNum(0));

        withWeatherDisabled(() => laserHandle.touch(dropletData.droplet, dropletData.dropletInfo));
        expect(dropletData.dropletInfo.upgrades?.size()).toBe(1);
        expect(dropletData.dropletInfo.sky).toBe(undefined);

        withWeatherDisabled(() => lavaHandle.touch(dropletData.droplet, dropletData.dropletInfo));

        const credited = Server.Currency.get("Funds");
        const expectedBase = furnaceMul.mul(firstDropletFunds);
        expect(credited.equals(expectedBase)).toBe(true);

        const upgradedValue = firstDropletFunds.add(upgraderFundsAdd);
        const expectedWithUpgrade = furnaceMul.mul(upgradedValue);
        expect(credited.equals(expectedWithUpgrade)).toBe(false);
        expect(dropletData.dropletInfo.incinerated).toBe(true);

        dropletData.cleanup();
        upgrader.cleanup();
        furnace.cleanup();
    });

    it("applies upgrader boosts for sky droplets in cauldrons", () => {
        const upgrader = spawnItemModel(VoidSkyUpgrader.id);
        const furnace = spawnItemModel(ImprovedFurnace.id);
        const laserHandle = getTouchByTag(upgrader.model, "Laser");
        const lavaHandle = getTouchByTag(furnace.model, "Lava");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) return;

        const skyMul = VoidSkyUpgrader.findTrait("Upgrader")?.mul?.get("Funds");
        if (skyMul === undefined) throw "Sky upgrader mul Funds is undefined";

        const furnaceMul = ImprovedFurnace.findTrait("Furnace")?.mul?.get("Funds");
        if (furnaceMul === undefined) throw "Furnace mul Funds is undefined";

        Server.Currency.set("Funds", new OnoeNum(0));

        withWeatherDisabled(() => laserHandle.touch(dropletData.droplet, dropletData.dropletInfo));
        expect(dropletData.dropletInfo.upgrades?.size()).toBe(1);
        expect(dropletData.dropletInfo.sky).toBe(true);

        withWeatherDisabled(() => lavaHandle.touch(dropletData.droplet, dropletData.dropletInfo));

        const credited = Server.Currency.get("Funds");
        const expected = furnaceMul.mul(firstDropletFunds.mul(skyMul)).div(250);

        expect(credited.equals(expected)).toBe(true);
        expect(dropletData.dropletInfo.incinerated).toBe(true);

        dropletData.cleanup();
        upgrader.cleanup();
        furnace.cleanup();
    });
});

describe("Portal", () => {
    it("teleports droplets between linked exits", () => {
        const first = spawnItemModel(IllusionaryPortal.id);
        const second = spawnItemModel(IllusionaryPortal.id);
        const handle = getTouchByName(first.model, "In");
        const outPart = second.model.FindFirstChild("Out") as BasePart | undefined;
        expect(outPart).toBeDefined();
        if (outPart === undefined) {
            first.cleanup();
            second.cleanup();
            throw "Portal out part is undefined";
        }

        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);
        const beforePosition = dropletData.droplet.Position;

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        expect(dropletData.droplet.Position).never.toBe(beforePosition);
        expect(dropletData.droplet.Position).toBe(outPart.Position);
        expect(dropletData.dropletInfo.lastTeleport).toBeDefined();

        dropletData.cleanup();
        first.cleanup();
        second.cleanup();
    });

    it("does not teleport droplets when the portal is broken", () => {
        const first = spawnItemModel(IllusionaryPortal.id);
        const second = spawnItemModel(IllusionaryPortal.id);
        const handle = getTouchByName(first.model, "In");

        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);
        const beforePosition = dropletData.droplet.Position;

        first.modelInfo.broken = true;

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        expect(dropletData.droplet.Position).toBe(beforePosition);
        expect(dropletData.dropletInfo.lastTeleport).toBe(undefined);

        dropletData.cleanup();
        first.cleanup();
        second.cleanup();
    });
});

describe("Generator", () => {
    it("applies generator boosts when computing passive gain", () => {
        const generatorTrait = TheFirstGenerator.findTrait("Generator");
        expect(generatorTrait === undefined).toBe(false);
        const passiveGain = generatorTrait!.passiveGain!;

        const spawned = spawnItemModel(TheFirstGenerator.id);
        expect(spawned.modelInfo.boosts === undefined).toBe(false);

        const originalGain = generatorTrait!.passiveGain;
        generatorTrait!.passiveGain = undefined;

        const boost = {
            ignoresLimitations: false,
            generatorCompound: {
                mul: new CurrencyBundle().set("Power", 2),
            },
        } as ItemBoost;
        spawned.modelInfo.boosts!.set("test", boost);

        const amountPerCurrency = withWeatherDisabled(() =>
            Generator.getValue(1, passiveGain, spawned.modelInfo.boosts!),
        );
        const power = amountPerCurrency.get("Power");
        expect(power === undefined).toBe(false);
        expect(power!.equals(new OnoeNum(2))).toBe(true);

        spawned.modelInfo.boosts!.clear();
        generatorTrait!.passiveGain = originalGain;
        spawned.cleanup();
    });
});

describe("Dropper", () => {
    it("produces droplets through the instantiator", () => {
        const spawned = spawnItemModel(TheFirstDropper.id);
        const entries = new Array<[BasePart, InstanceInfo]>();
        for (const [drop, info] of Dropper.SPAWNED_DROPS) {
            if (drop.IsDescendantOf(spawned.model)) entries.push([drop, info]);
        }
        expect(entries.size() === 0).toBe(false);

        const [dropPart, info] = entries[0];
        info.dropRate = 0;
        const instantiator = info.instantiator;
        expect(instantiator === undefined).toBe(false);

        Dropper.hasLuckyWindow = false;

        const droplet = instantiator!();
        expect(droplet === undefined).toBe(false);
        const dropletPart = droplet as unknown as BasePart;
        expect(dropletPart.Parent === Workspace).toBe(true);

        const dropletInfo = Droplet.SPAWNED_DROPLETS.get(dropletPart);
        expect(dropletInfo === undefined).toBe(false);
        expect(dropletInfo!.dropletId).toBe(Droplet.TheFirstDroplet.id);
        expect(dropPart.HasTag("Drop")).toBe(true);

        dropletPart.Destroy();
        spawned.cleanup();
    });
});

describe("Conveyor", () => {
    it("applies forward velocity based on configured speed", () => {
        const item = TheFirstConveyor;

        const model = TheFirstConveyor.createModel({
            item: TheFirstConveyor.id,
            posX: 0,
            posY: 0,
            posZ: 0,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            area: "BarrenIslands",
        });
        if (model === undefined) throw "Conveyor model is undefined";

        item.load(model);
        const conveyorPart = model.FindFirstChild("Conveyor") as BasePart | undefined;
        expect(conveyorPart).toBeDefined();
        if (conveyorPart === undefined) {
            model.Destroy();
            throw "Conveyor part is undefined";
        }

        const expectedVelocity = conveyorPart.CFrame.LookVector.mul(item.findTrait("Conveyor")!.speed);
        expect(conveyorPart.AssemblyLinearVelocity).toBe(expectedVelocity);

        model.Destroy();
    });
});

describe("Health", () => {
    it("reduces droplet value based on remaining health", () => {
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) {
            dropletData.cleanup();
            throw "First droplet Funds is undefined";
        }

        withWeatherDisabled(() => {
            const beforeValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);

            const t = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            t.applySource();
            t.applyFinal();
            expect(beforeValue.get("Funds")?.equals(firstDropletFunds)).toBe(true);
        });

        dropletData.dropletInfo.health = 40;
        const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);

        const funds = afterValue.get("Funds");
        expect(funds).toBeDefined();
        if (funds === undefined) throw "Funds after health reduction is undefined";

        expect(funds.equals(firstDropletFunds.mul(0.4))).toBe(true);

        dropletData.cleanup();
    });
});

describe("OmniUpgrader", () => {
    it("assigns per-laser upgrades tagged with omni identifiers", () => {
        const spawned = spawnItemModel(Sideswiper.id);
        const bitcoinHandle = getTouchByName(spawned.model, "BitcoinLaser");
        const powerHandle = getTouchByName(spawned.model, "PowerLaser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        withWeatherDisabled(() => {
            bitcoinHandle.touch(dropletData.droplet, dropletData.dropletInfo);
            powerHandle.touch(dropletData.droplet, dropletData.dropletInfo);
        });

        const upgrades = dropletData.dropletInfo.upgrades;
        expect(upgrades).toBeDefined();
        if (upgrades === undefined) return;

        expect(upgrades.size()).toBe(2);
        for (const [name, upgrade] of upgrades) {
            const [operative] = Upgrader.getUpgrade(upgrade);
            expect(operative).toBeDefined();
            if (operative === undefined) continue;

            const add = operative.add;
            expect(add).toBeDefined();

            let laserId: string;
            if (name.find("BitcoinLaser")[0] !== undefined) {
                laserId = "BitcoinLaser";
            } else if (name.find("PowerLaser")[0] !== undefined) {
                laserId = "PowerLaser";
            } else {
                throw `Unexpected upgrade name ${name}`;
            }

            const actual = Sideswiper.findTrait("OmniUpgrader")?.addsPerLaser.get(laserId);
            expect(actual).toBeDefined();
            if (actual === undefined) return;

            expect(add?.equals(actual)).toBe(true);
        }

        dropletData.cleanup();
        spawned.cleanup();
    });
});

describe("Condenser", () => {
    it("produces condensed droplets from fresh contributions", () => {
        const { furnaceProcessed, droplet, cleanup } = setupTestCondenser();
        const beforeDroplets = new Set<BasePart>();
        for (const [droplet] of Droplet.SPAWNED_DROPLETS) beforeDroplets.add(droplet);

        const raw = droplet.value;
        const inputDroplet = new Instance("Part") as BasePart;
        inputDroplet.Name = "InputDroplet";
        inputDroplet.Parent = Workspace;
        const inputInfo = getAllInstanceInfo(inputDroplet);
        inputInfo.dropletId = Droplet.TheFirstDroplet.id;
        inputInfo.upgrades = new Map();

        furnaceProcessed(raw, inputDroplet, inputInfo);

        let produced: BasePart | undefined;
        for (const [droplet] of Droplet.SPAWNED_DROPLETS) {
            if (!beforeDroplets.has(droplet)) {
                produced = droplet;
                break;
            }
        }

        expect(produced).toBeDefined();
        if (produced === undefined) {
            inputDroplet.Destroy();
            cleanup();
            return;
        }

        const producedInfo = Droplet.SPAWNED_DROPLETS.get(produced);
        expect(producedInfo).toBeDefined();
        expect(producedInfo?.condensed).toBe(true);

        produced.Destroy();
        inputDroplet.Destroy();
        cleanup();
    });

    it("ignores condensed droplets fed back into the same condenser", () => {
        const { furnaceProcessed, droplet, cleanup } = setupTestCondenser();
        const raw = droplet.value;
        const inputDroplet = new Instance("Part") as BasePart;
        inputDroplet.Name = "InputDroplet";
        inputDroplet.Parent = Workspace;
        const inputInfo = getAllInstanceInfo(inputDroplet);
        inputInfo.dropletId = Droplet.TheFirstDroplet.id;
        inputInfo.upgrades = new Map();

        const beforeDroplets = new Set<BasePart>();
        for (const [droplet] of Droplet.SPAWNED_DROPLETS) beforeDroplets.add(droplet);

        furnaceProcessed(raw, inputDroplet, inputInfo);

        let produced: BasePart | undefined;
        for (const [droplet] of Droplet.SPAWNED_DROPLETS) {
            if (!beforeDroplets.has(droplet)) {
                produced = droplet;
                break;
            }
        }

        expect(produced).toBeDefined();
        if (produced === undefined) {
            inputDroplet.Destroy();
            cleanup();
            return;
        }

        const producedInfo = Droplet.SPAWNED_DROPLETS.get(produced);
        expect(producedInfo).toBeDefined();

        const dropletCountBefore = Droplet.SPAWNED_DROPLETS.size();
        furnaceProcessed(raw, produced, producedInfo!);
        expect(Droplet.SPAWNED_DROPLETS.size()).toBe(dropletCountBefore);

        produced.Destroy();
        inputDroplet.Destroy();
        cleanup();
    });

    it("does not apply softcaps when collecting contributions", () => {
        const { furnaceProcessed, droplet, cleanup } = setupTestCondenser();
        const dropletData = spawnDroplet(droplet);

        const highBalance = new OnoeNum(1e308);
        Server.Currency.set("Funds", highBalance);

        dropletData.dropletInfo.upgrades = dropletData.dropletInfo.upgrades ?? new Map();

        const rawValue = withWeatherDisabled(() => {
            const result = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            result.applySource();
            return result.coalesce();
        });
        const softcappedValue = withWeatherDisabled(() => {
            const result = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            result.applySource();
            result.applyFinal();
            return result.coalesce();
        });

        const rawFunds = rawValue.get("Funds");
        const softFunds = softcappedValue.get("Funds");
        expect(rawFunds).toBeDefined();
        expect(softFunds).toBeDefined();
        if (rawFunds === undefined || softFunds === undefined) {
            dropletData.cleanup();
            cleanup();
            throw "Condenser comparison funds are undefined";
        }
        expect(softFunds.lessThan(rawFunds)).toBe(true);

        const beforeDroplets = new Set<BasePart>();
        for (const [existing] of Droplet.SPAWNED_DROPLETS) beforeDroplets.add(existing);

        withWeatherDisabled(() => furnaceProcessed(rawValue, dropletData.droplet, dropletData.dropletInfo));

        let produced: BasePart | undefined;
        for (const [current] of Droplet.SPAWNED_DROPLETS) {
            if (!beforeDroplets.has(current)) {
                produced = current;
                break;
            }
        }

        expect(produced).toBeDefined();
        if (produced === undefined) {
            dropletData.cleanup();
            cleanup();
            throw "Condenser failed to produce a droplet";
        }

        expect(Server.Currency.get("Funds").equals(highBalance)).toBe(true);

        produced.Destroy();
        dropletData.cleanup();
        cleanup();
        Server.Currency.set("Funds", new OnoeNum(0));
    });

    it("does not double-apply upgrader boosts after condenser reprocessing", () => {
        const { furnaceProcessed, droplet: condensedDroplet, cleanup } = setupTestCondenser();
        const firstUpgrader = spawnItemModel(CoalescentRefiner.id);
        const laserHandle = getTouchByTag(firstUpgrader.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const baseFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(baseFunds).toBeDefined();
        if (baseFunds === undefined) {
            dropletData.cleanup();
            firstUpgrader.cleanup();
            cleanup();
            throw "Base funds is undefined";
        }

        const beforeDroplets = new Set<BasePart>();
        for (const [droplet] of Droplet.SPAWNED_DROPLETS) beforeDroplets.add(droplet);

        withWeatherDisabled(() => laserHandle.touch(dropletData.droplet, dropletData.dropletInfo));

        const contributionValue = withWeatherDisabled(() => {
            return Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
        });

        withWeatherDisabled(() => furnaceProcessed(contributionValue, dropletData.droplet, dropletData.dropletInfo));

        dropletData.cleanup();

        let condensedDropletModel: BasePart | undefined;
        let condensedInfo: InstanceInfo | undefined;
        for (const [droplet, info] of Droplet.SPAWNED_DROPLETS) {
            if (!beforeDroplets.has(droplet)) {
                condensedDropletModel = droplet;
                condensedInfo = info;
                break;
            }
        }

        expect(condensedDropletModel).toBeDefined();
        if (condensedDropletModel === undefined || condensedInfo === undefined) {
            firstUpgrader.cleanup();
            cleanup();
            return;
        }

        expect(condensedInfo.condensed).toBe(true);
        const placeholderUpgrades = condensedInfo.upgrades;
        expect(placeholderUpgrades).toBeDefined();
        if (placeholderUpgrades === undefined) {
            condensedDropletModel.Destroy();
            firstUpgrader.cleanup();
            cleanup();
            return;
        }
        expect(placeholderUpgrades.size()).toBe(1);

        firstUpgrader.cleanup();

        const repositionedUpgrader = spawnItemModel(CoalescentRefiner.id);
        const repositionedHandle = getTouchByTag(repositionedUpgrader.model, "Laser");

        withWeatherDisabled(() => repositionedHandle.touch(condensedDropletModel!, condensedInfo!));

        expect(condensedInfo?.upgrades?.size()).toBe(2);

        Server.Currency.set("Funds", new OnoeNum(0));
        Server.Currency.set("Power", new OnoeNum(0));

        const furnace = spawnItemModel(ImprovedFurnace.id);
        const lavaHandle = getTouchByTag(furnace.model, "Lava");

        withWeatherDisabled(() => lavaHandle.touch(condensedDropletModel!, condensedInfo!));

        const furnaceMul = ImprovedFurnace.findTrait("Furnace")?.mul?.get("Funds");
        expect(furnaceMul).toBeDefined();
        if (furnaceMul === undefined) {
            if (condensedDropletModel.Parent !== undefined) condensedDropletModel.Destroy();
            repositionedUpgrader.cleanup();
            furnace.cleanup();
            cleanup();
            return;
        }

        const expectedFunds = condensedDroplet.value.get("Funds")!.mul(furnaceMul);
        const credited = Server.Currency.get("Funds");
        expect(credited.equals(expectedFunds)).toBe(true);

        if (condensedDropletModel.Parent !== undefined) condensedDropletModel.Destroy();
        repositionedUpgrader.cleanup();
        furnace.cleanup();
        cleanup();
    });
});
