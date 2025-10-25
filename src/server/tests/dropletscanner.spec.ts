import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Janitor } from "@rbxts/janitor";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import { HttpService, Workspace } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import DropletScanner from "shared/items/0/vintage/DropletScanner";
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

describe("DropletScanner", () => {
    it("displays raw droplet worth without upgrades", () => {
        const scanner = spawnItemModel(DropletScanner.id);
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);
        const handle = getTouchByTag(scanner.model, "Laser");

        const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
        expect(firstDropletFunds).toBeDefined();
        if (firstDropletFunds === undefined) {
            dropletData.cleanup();
            scanner.cleanup();
            return;
        }

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        const output = scanner.modelInfo.scannerOutput;
        expect(output).toBeDefined();
        if (output === undefined) {
            dropletData.cleanup();
            scanner.cleanup();
            throw "Scanner output is undefined";
        }

        expect(output.find("RAW WORTH:")[0]).toBeDefined();
        expect(output.find("TOTAL:")[0]).toBeDefined();
        expect(output.find(firstDropletFunds.toString())[0]).toBeDefined();

        dropletData.cleanup();
        scanner.cleanup();
    });

    it("shows additive boost from upgrader", () => {
        const upgrader = spawnItemModel(TheFirstUpgrader.id);
        const scanner = spawnItemModel(DropletScanner.id);
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const upgraderHandle = getTouchByTag(upgrader.model, "Laser");
        const scannerHandle = getTouchByTag(scanner.model, "Laser");

        const upgraderAdd = TheFirstUpgrader.findTrait("Upgrader")?.add?.get("Funds");
        expect(upgraderAdd).toBeDefined();
        if (upgraderAdd === undefined) {
            dropletData.cleanup();
            upgrader.cleanup();
            scanner.cleanup();
            return;
        }

        withWeatherDisabled(() => {
            upgraderHandle.touch(dropletData.droplet, dropletData.dropletInfo);
            scannerHandle.touch(dropletData.droplet, dropletData.dropletInfo);
        });

        const output = scanner.modelInfo.scannerOutput;
        expect(output).toBeDefined();
        if (output === undefined) {
            dropletData.cleanup();
            upgrader.cleanup();
            scanner.cleanup();
            throw "Scanner output is undefined";
        }

        expect(output.find("THEFIRSTUPGRADER:")[0]).toBeDefined();
        expect(output.find("+")[0]).toBeDefined();

        dropletData.cleanup();
        upgrader.cleanup();
        scanner.cleanup();
    });

    it("shows multiplicative boost from upgrader", () => {
        const upgrader = spawnItemModel(SmallReactor.id);
        const scanner = spawnItemModel(DropletScanner.id);
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const upgraderHandle = getTouchByTag(upgrader.model, "Laser");
        const scannerHandle = getTouchByTag(scanner.model, "Laser");

        const upgraderMul = SmallReactor.findTrait("Upgrader")?.mul?.get("Funds");
        expect(upgraderMul).toBeDefined();
        if (upgraderMul === undefined) {
            dropletData.cleanup();
            upgrader.cleanup();
            scanner.cleanup();
            return;
        }

        withWeatherDisabled(() => {
            upgraderHandle.touch(dropletData.droplet, dropletData.dropletInfo);
            scannerHandle.touch(dropletData.droplet, dropletData.dropletInfo);
        });

        const output = scanner.modelInfo.scannerOutput;
        expect(output).toBeDefined();
        if (output === undefined) {
            dropletData.cleanup();
            upgrader.cleanup();
            scanner.cleanup();
            throw "Scanner output is undefined";
        }

        expect(output.find("SMALLREACTOR:")[0]).toBeDefined();
        expect(output.find("x")[0]).toBeDefined();

        dropletData.cleanup();
        upgrader.cleanup();
        scanner.cleanup();
    });

    it("does not show neutral boosts with +0 or x1", () => {
        const scanner = spawnItemModel(DropletScanner.id);
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        // Create a mock upgrade with neutral values
        dropletData.dropletInfo.upgrades = dropletData.dropletInfo.upgrades ?? new Map();
        dropletData.dropletInfo.upgrades.set("NeutralBoost", {
            model: scanner.model,
            boost: {
                add: new CurrencyBundle().set("Funds", 0),
                mul: new CurrencyBundle().set("Funds", 1),
            },
        });

        const handle = getTouchByTag(scanner.model, "Laser");

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        const output = scanner.modelInfo.scannerOutput;
        expect(output).toBeDefined();
        if (output === undefined) {
            dropletData.cleanup();
            scanner.cleanup();
            throw "Scanner output is undefined";
        }

        // Should not show the UPGRADER line since all boosts are neutral
        const lines = output.split("\n");
        let hasUpgraderLine = false;
        for (const line of lines) {
            if (line.find("UPGRADER:")[0] !== undefined) {
                hasUpgraderLine = true;
                break;
            }
        }
        expect(hasUpgraderLine).toBe(false);

        dropletData.cleanup();
        scanner.cleanup();
    });

    it("shows health when droplet is damaged", () => {
        const scanner = spawnItemModel(DropletScanner.id);
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);
        const handle = getTouchByTag(scanner.model, "Laser");

        dropletData.dropletInfo.health = 50;

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        const output = scanner.modelInfo.scannerOutput;
        expect(output).toBeDefined();
        if (output === undefined) {
            dropletData.cleanup();
            scanner.cleanup();
            throw "Scanner output is undefined";
        }

        expect(output.find("HEALTH:")[0]).toBeDefined();
        expect(output.find("50")[0]).toBeDefined();

        dropletData.cleanup();
        scanner.cleanup();
    });

    it("does not show health when droplet is at full health", () => {
        const scanner = spawnItemModel(DropletScanner.id);
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);
        const handle = getTouchByTag(scanner.model, "Laser");

        dropletData.dropletInfo.health = 100;

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        const output = scanner.modelInfo.scannerOutput;
        expect(output).toBeDefined();
        if (output === undefined) {
            dropletData.cleanup();
            scanner.cleanup();
            throw "Scanner output is undefined";
        }

        expect(output.find("HEALTH:")[0]).toBe(undefined);

        dropletData.cleanup();
        scanner.cleanup();
    });

    it("combines multiple boosts with proper formatting", () => {
        const addUpgrader = spawnItemModel(TheFirstUpgrader.id);
        const mulUpgrader = spawnItemModel(SmallReactor.id);
        const scanner = spawnItemModel(DropletScanner.id);
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const addHandle = getTouchByTag(addUpgrader.model, "Laser");
        const mulHandle = getTouchByTag(mulUpgrader.model, "Laser");
        const scannerHandle = getTouchByTag(scanner.model, "Laser");

        withWeatherDisabled(() => {
            addHandle.touch(dropletData.droplet, dropletData.dropletInfo);
            mulHandle.touch(dropletData.droplet, dropletData.dropletInfo);
            scannerHandle.touch(dropletData.droplet, dropletData.dropletInfo);
        });

        const output = scanner.modelInfo.scannerOutput;
        expect(output).toBeDefined();
        if (output === undefined) {
            dropletData.cleanup();
            addUpgrader.cleanup();
            mulUpgrader.cleanup();
            scanner.cleanup();
            throw "Scanner output is undefined";
        }

        // Should have upgrader section with both add and mul
        expect(output.find("THEFIRSTUPGRADER:")[0]).toBeDefined();
        expect(output.find("SMALLREACTOR:")[0]).toBeDefined();
        expect(output.find("+")[0]).toBeDefined();
        expect(output.find("x")[0]).toBeDefined();

        dropletData.cleanup();
        addUpgrader.cleanup();
        mulUpgrader.cleanup();
        scanner.cleanup();
    });
});
