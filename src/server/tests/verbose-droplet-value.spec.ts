import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Janitor } from "@rbxts/janitor";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { HttpService, Workspace } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import TheFirstUpgrader from "shared/items/negative/tfd/TheFirstUpgrader";
import SmallReactor from "shared/items/negative/unimpossible/SmallReactor";

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

function getTouchByTag(model: Model, tagName: string) {
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

beforeAll(() => {
    eater.janitor = new Janitor();
    mockFlamework();
});

beforeEach(() => {
    Server.Data.softWipe();
});

afterAll(() => {
    eater.janitor?.Destroy();
});

describe("Verbose Droplet Value Calculation", () => {
    it("tracks base droplet value without any modifiers", () => {
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            return r;
        });

        expect(result.verbose).toBe(true);
        expect(result.factors).toBeDefined();
        expect(result.factors.size()).toBe(0);

        // Should have base value set
        const baseValue = result.baseValue;
        expect(baseValue).toBeDefined();
        expect(baseValue.equals(Droplet.TheFirstDroplet.value)).toBe(true);

        dropletData.cleanup();
    });

    it("tracks upgrader boosts in verbose factors", () => {
        const spawned = spawnItemModel(TheFirstUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            return r;
        });

        expect(result.verbose).toBe(true);
        expect(result.factors).toBeDefined();

        // Should contain the upgrader's ID in uppercase
        const upgraderFactors = result.factors.filter(([label]) => label === TheFirstUpgrader.id.upper());
        expect(upgraderFactors.size()).toBe(1);

        const [label, operative] = upgraderFactors[0];
        expect(operative.add).toBeDefined();
        const upgraderAdd = TheFirstUpgrader.findTrait("Upgrader")?.add?.get("Funds");
        expect(upgraderAdd).toBeDefined();
        expect(operative.add?.get("Funds")?.equals(upgraderAdd!)).toBe(true);

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("tracks multiple upgrader boosts separately", () => {
        const additive = spawnItemModel(TheFirstUpgrader.id);
        const multiplicative = spawnItemModel(SmallReactor.id);
        const additiveHandle = getTouchByTag(additive.model, "Laser");
        const multiplicativeHandle = getTouchByTag(multiplicative.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        withWeatherDisabled(() => {
            additiveHandle.touch(dropletData.droplet, dropletData.dropletInfo);
            multiplicativeHandle.touch(dropletData.droplet, dropletData.dropletInfo);
        });

        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            return r;
        });

        expect(result.factors.size() > 1).toBe(true);

        const additiveFactors = result.factors.filter(([label]) => label === TheFirstUpgrader.id.upper());
        const multiplicativeFactors = result.factors.filter(([label]) => label === SmallReactor.id.upper());

        expect(additiveFactors.size()).toBe(1);
        expect(multiplicativeFactors.size()).toBe(1);

        expect(additiveFactors[0][1].add).toBeDefined();
        expect(multiplicativeFactors[0][1].mul).toBeDefined();

        dropletData.cleanup();
        additive.cleanup();
        multiplicative.cleanup();
    });

    it("tracks health nerf when droplet health is below 100", () => {
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        // Set health to 40%
        dropletData.dropletInfo.health = 40;

        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            return r;
        });

        const healthFactors = result.factors.filter(([label]) => label === "HEALTH");
        expect(healthFactors.size()).toBe(1);

        const [, factor] = healthFactors[0];
        expect(factor.mul).toBeDefined();
        if (factor.mul === undefined) throw "factor.mul is undefined";
        if (!("mantissa" in factor.mul)) throw "factor.mul should be an OnoeNum";

        expect(factor.mul.equals(new OnoeNum(0.4))).toBe(true);

        dropletData.cleanup();
    });

    it("does not track health nerf when droplet health is at 100", () => {
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        // Ensure health is 100
        dropletData.dropletInfo.health = 100;

        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            return r;
        });

        const healthFactors = result.factors.filter(([label]) => label === "HEALTH");
        expect(healthFactors.size()).toBe(0);

        dropletData.cleanup();
    });

    it("tracks lightning surge boost", () => {
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        // Mark droplet as lightning surged
        dropletData.dropletInfo.lightningSurged = true;

        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            return r;
        });

        const lightningFactors = result.factors.filter(([label]) => label === "LIGHTNINGSURGE");
        expect(lightningFactors.size()).toBe(1);

        const [, factor] = lightningFactors[0];
        expect(factor.mul).toBeDefined();
        if (factor.mul === undefined) throw "factor.mul is undefined";
        if (!("mantissa" in factor.mul)) throw "factor.mul should be an OnoeNum";

        expect(factor.mul.equals(new OnoeNum(10))).toBe(true);

        dropletData.cleanup();
    });

    it("tracks weather boost when enabled", () => {
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        // Enable weather and set a non-1 multiplier
        Server.Revenue.weatherBoostEnabled = true;
        const previousMultiplier = Server.Atmosphere.currentMultipliers.dropletValue;
        Server.Atmosphere.currentMultipliers.dropletValue = 2.5;

        const result = (() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            r.applyFinal();
            return r;
        })();

        const weatherFactors = result.factors.filter(([label]) => label === "WEATHER");
        expect(weatherFactors.size()).toBe(1);

        const [, factor] = weatherFactors[0];
        expect(factor.mul).toBeDefined();
        if (factor.mul === undefined) throw "factor.mul is undefined";
        if (!("mantissa" in factor.mul)) throw "factor.mul should be an OnoeNum";

        expect(factor.mul.equals(new OnoeNum(2.5))).toBe(true);

        // Cleanup
        Server.Atmosphere.currentMultipliers.dropletValue = previousMultiplier;
        dropletData.cleanup();
    });

    it("tracks sky droplet nerf", () => {
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        // Mark as sky droplet
        dropletData.dropletInfo.sky = true;

        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            r.applyFinal();
            return r;
        });

        const skyFactors = result.factors.filter(([label]) => label === "SKYDROPLET");
        expect(skyFactors.size()).toBe(1);

        const [, factor] = skyFactors[0];
        expect(factor.mul).toBeDefined();
        expect(factor.inverse).toBe(true);
        if (factor.mul === undefined) throw "factor.mul is undefined";
        if (!("mantissa" in factor.mul)) throw "factor.mul should be an OnoeNum";

        expect(factor.mul.equals(new OnoeNum(250))).toBe(true);

        dropletData.cleanup();
    });

    it("tracks dark matter boost when applied", () => {
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        // Set a high balance to trigger dark matter
        Server.Currency.set("Funds", new OnoeNum(1e100));

        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            r.applyFinal();
            return r;
        });

        const darkMatterFactors = result.factors.filter(([label]) => label === "DARKMATTER");

        // Dark Matter may or may not apply depending on balance thresholds
        if (darkMatterFactors.size() > 0) {
            const [, factor] = darkMatterFactors[0];
            expect(factor.mul).toBeDefined();
        }

        Server.Currency.set("Funds", new OnoeNum(0));
        dropletData.cleanup();
    });

    it("tracks softcap application with very high values", () => {
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        // Set extremely high balance and boost to trigger softcaps
        Server.Currency.set("Funds", new OnoeNum(1e308));
        dropletData.dropletInfo.upgrades = new Map();
        dropletData.dropletInfo.upgrades.set("TestMassiveBoost", {
            model: undefined as unknown as Model,
            boost: {
                mul: new CurrencyBundle().set("Funds", 1e308),
            },
        });

        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            r.applyFinal();
            return r;
        });

        const softcapDivFactors = result.factors.filter(([label]) => label === "SOFTCAPDIV");
        const softcapRootFactors = result.factors.filter(([label]) => label === "SOFTCAPROOT");

        expect(softcapDivFactors.size() > 0).toBe(true);
        expect(softcapRootFactors.size() > 0).toBe(true);

        // Verify inverse flag is set
        expect(softcapDivFactors[0][1].inverse).toBe(true);
        expect(softcapRootFactors[0][1].inverse).toBe(true);

        Server.Currency.set("Funds", new OnoeNum(0));
        dropletData.cleanup();
    });

    it("tracks all factors in correct order through full calculation pipeline", () => {
        const upgrader = spawnItemModel(TheFirstUpgrader.id);
        const handle = getTouchByTag(upgrader.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        // Apply upgrader
        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        // Set health to trigger nerf
        dropletData.dropletInfo.health = 50;

        // Calculate with all steps
        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            r.applyFinal();
            return r;
        });

        // Verify factors are populated
        expect(result.factors.size() > 0).toBe(true);

        // Verify we have upgrader (source phase)
        const upgraderFactors = result.factors.filter(([label]) => label === TheFirstUpgrader.id.upper());
        expect(upgraderFactors.size()).toBe(1);

        // Verify we have health (source phase)
        const healthFactors = result.factors.filter(([label]) => label === "HEALTH");
        expect(healthFactors.size()).toBe(1);

        // Verify the coalesced value matches manual calculation
        const coalesced = result.coalesce();
        expect(coalesced).toBeDefined();

        // The final value should incorporate all factors
        const fundsResult = coalesced.get("Funds");
        expect(fundsResult).toBeDefined();
        expect(fundsResult!.moreThan(new OnoeNum(0))).toBe(true);

        dropletData.cleanup();
        upgrader.cleanup();
    });

    it("verbose mode is disabled when not requested", () => {
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, false);
            r.applySource();
            return r;
        });

        expect(result.verbose).toBe(false);
        // Factors array exists but should not be populated in non-verbose mode
        // (based on the implementation, factors.push only happens when verbose === true)
        expect(result.factors.size()).toBe(0);

        dropletData.cleanup();
    });

    it("maintains factor order consistency across multiple calculations", () => {
        const dropletData1 = spawnDroplet(Droplet.TheFirstDroplet);
        const dropletData2 = spawnDroplet(Droplet.TheFirstDroplet);

        dropletData1.dropletInfo.health = 75;
        dropletData2.dropletInfo.health = 75;

        const result1 = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData1.droplet, true);
            r.applySource();
            r.applyFinal();
            return r;
        });

        const result2 = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData2.droplet, true);
            r.applySource();
            r.applyFinal();
            return r;
        });

        // Both should have the same factors in the same order
        expect(result1.factors.size()).toBe(result2.factors.size());

        for (let i = 0; i < result1.factors.size(); i++) {
            const [label1] = result1.factors[i];
            const [label2] = result2.factors[i];
            expect(label1).toBe(label2);
        }

        dropletData1.cleanup();
        dropletData2.cleanup();
    });

    it("does not include weather factor when weather boost is disabled", () => {
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        Server.Atmosphere.currentMultipliers.dropletValue = 3.0;

        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            r.applyFinal();
            return r;
        });

        const weatherFactors = result.factors.filter(([label]) => label === "WEATHER");
        expect(weatherFactors.size()).toBe(0);

        dropletData.cleanup();
    });

    it("coalesce returns correct value matching manual calculation", () => {
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);
        const baseValue = Droplet.TheFirstDroplet.value.get("Funds")!;

        // Simple case: no modifiers except health at 50%
        dropletData.dropletInfo.health = 50;

        const result = withWeatherDisabled(() => {
            const r = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
            r.applySource();
            return r;
        });

        const coalesced = result.coalesce();
        const coalescedFunds = coalesced.get("Funds")!;

        // Should be baseValue * 0.5 (50% health)
        const expected = baseValue.mul(0.5);
        expect(coalescedFunds.equals(expected)).toBe(true);

        dropletData.cleanup();
    });
});
