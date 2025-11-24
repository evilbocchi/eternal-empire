import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import { getTouchByTag, spawnDroplet, spawnItemModel, withWeatherDisabled } from "tests/utils";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import DropletScanner from "shared/items/0/vintage/DropletScanner";
import TheFirstUpgrader from "shared/items/negative/tfd/TheFirstUpgrader";
import SmallReactor from "shared/items/negative/unimpossible/SmallReactor";

beforeEach(() => {
    Server.Data.softWipe();
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
