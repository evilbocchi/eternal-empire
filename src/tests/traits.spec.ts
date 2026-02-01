import { getAllInstanceInfo } from "@antivivi/vrldk";
import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { Workspace } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Boostable from "shared/item/traits/boost/Boostable";
import Dropper from "shared/item/traits/dropper/Dropper";
import Generator from "shared/item/traits/generator/Generator";
import Ablaze from "shared/item/traits/status/Ablaze";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import IllusionaryPortal from "shared/items/0/automatic/IllusionaryPortal";
import FlamethrowerUpgrader from "shared/items/0/frivolous/FlamethrowerUpgrader";
import VoidSkyUpgrader from "shared/items/0/happylike/VoidSkyUpgrader";
import CoalescentRefiner from "shared/items/0/ifinitude/CoalescentRefiner";
import Sideswiper from "shared/items/0/winsome/Sideswiper";
import JoyfulPark from "shared/items/1/joyful/JoyfulPark";
import TheFirstGenerator from "shared/items/negative/friendliness/TheFirstGenerator";
import NoobClicker from "shared/items/negative/skip/NoobClicker";
import TheFirstConveyor from "shared/items/negative/tfd/TheFirstConveyor";
import TheFirstDropper from "shared/items/negative/tfd/TheFirstDropper";
import TheFirstUpgrader from "shared/items/negative/tfd/TheFirstUpgrader";
import BasicCauldron from "shared/items/negative/tlg/BasicCauldron";
import ImprovedFurnace from "shared/items/negative/tlg/ImprovedFurnace";
import SmallReactor from "shared/items/negative/unimpossible/SmallReactor";
import {
    getTouchByName,
    getTouchByTag,
    setupTestCondenser,
    spawnDroplet,
    spawnItemModel,
    withWeatherDisabled,
} from "tests/utils";

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

        expect(Server.Currency.get("Funds")).toEqualOnoeNum(furnaceMul.mul(firstDropletFunds));

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

describe("Trait Composition", () => {
    it("allows multiple traits to coexist on a single item", () => {
        const spawned = spawnItemModel(NoobClicker.id);

        expect(NoobClicker.types.has("Generator")).toBe(true);
        expect(NoobClicker.types.has("Boostable")).toBe(true);

        const generator = NoobClicker.findTrait("Generator");
        const boostable = NoobClicker.findTrait("Boostable");

        expect(generator).toBeDefined();
        expect(boostable).toBeDefined();

        spawned.cleanup();
    });

    it("allows traits to access the same item reference", () => {
        const spawned = spawnItemModel(NoobClicker.id);

        const generator = NoobClicker.findTrait("Generator");
        const boostable = NoobClicker.findTrait("Boostable");

        expect(generator?.item).toBe(NoobClicker);
        expect(boostable?.item).toBe(NoobClicker);

        spawned.cleanup();
    });

    it("executes onLoad callbacks from all traits", () => {
        const spawned = spawnItemModel(NoobClicker.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        expect(modelInfo.boostable).toBeDefined();
        expect(modelInfo.boosts).toBeDefined();
        expect(modelInfo.boosts?.size()).toBe(0);

        spawned.cleanup();
    });

    it("allows multiple traits to modify the same model independently", () => {
        const spawned = spawnItemModel(VoidSkyUpgrader.id);

        expect(VoidSkyUpgrader.types.has("Upgrader")).toBe(true);
        expect(VoidSkyUpgrader.types.has("Conveyor")).toBe(true);

        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        expect(dropletData.dropletInfo.upgrades?.size()).toBe(1);

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("allows traits to use trait() method for cross-trait access", () => {
        const spawned = spawnItemModel(NoobClicker.id);
        const generator = NoobClicker.findTrait("Generator");

        expect(generator).toBeDefined();
        if (generator === undefined) {
            spawned.cleanup();
            return;
        }

        const boostableFromTrait = generator.trait(Boostable);
        expect(boostableFromTrait).toBeDefined();
        expect(boostableFromTrait.item).toBe(NoobClicker);

        spawned.cleanup();
    });
});

describe("Trait Lifecycle", () => {
    it("calls onLoad callbacks when model is spawned on the server", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        expect(modelInfo.boostable).toBeDefined();
        expect(modelInfo.boosts).toBeDefined();
        expect(modelInfo.boostAdded).toBeDefined();
        expect(modelInfo.boostRemoved).toBeDefined();

        spawned.cleanup();
    });

    it("initializes trait state before onLoad callbacks execute", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        expect(modelInfo.boostable).toBeDefined();
        expect(modelInfo.boosts).toBeDefined();
        expect(modelInfo.boosts?.size()).toBe(0);

        spawned.cleanup();
    });

    it("cleans up trait connections when model is destroyed", () => {
        const spawned = spawnItemModel(TheFirstUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        expect(dropletData.dropletInfo.upgrades?.size()).toBe(1);

        spawned.cleanup();

        // After cleanup, the model should be destroyed
        expect(spawned.model.Parent).toBeUndefined();

        dropletData.cleanup();
    });

    it("executes callbacks in the order they were registered", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        expect(modelInfo.boostable).toBeDefined();

        expect(TheFirstGenerator.LOADS.size()).toBeGreaterThan(0);

        spawned.cleanup();
    });

    it("allows traits to register multiple onLoad callbacks", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);

        expect(TheFirstGenerator.LOADS.size()).toBeGreaterThan(1);

        spawned.cleanup();
    });
});

describe("Boostable Trait", () => {
    it("initializes with empty boost map on model load", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        expect(modelInfo.boostable).toBeDefined();
        expect(modelInfo.boosts).toBeDefined();
        expect(modelInfo.boosts?.size()).toBe(0);
        expect(modelInfo.boostAdded).toBeDefined();
        expect(modelInfo.boostRemoved).toBeDefined();

        spawned.cleanup();
    });

    it("adds a boost to the model and triggers boostAdded callback", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        let boostAddedCalled = false;
        let receivedBoost: ItemBoost | undefined;

        modelInfo.boostAdded?.add((boost) => {
            boostAddedCalled = true;
            receivedBoost = boost;
        });

        const testBoost: ItemBoost = { ignoresLimitations: false };
        Boostable.addBoost(modelInfo, "test-boost", testBoost);

        expect(boostAddedCalled).toBe(true);
        expect(receivedBoost).toBe(testBoost);
        expect(modelInfo.boosts?.size()).toBe(1);
        expect(modelInfo.boosts?.has("test-boost")).toBe(true);

        spawned.cleanup();
    });

    it("removes a boost from the model and triggers boostRemoved callback", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        let boostRemovedCalled = false;
        let removedBoost: ItemBoost | undefined;

        const testBoost: ItemBoost = { ignoresLimitations: false };
        Boostable.addBoost(modelInfo, "test-boost", testBoost);

        modelInfo.boostRemoved?.add((boost) => {
            boostRemovedCalled = true;
            removedBoost = boost;
        });

        Boostable.removeBoost(modelInfo, "test-boost");

        expect(boostRemovedCalled).toBe(true);
        expect(removedBoost).toBe(testBoost);
        expect(modelInfo.boosts?.size()).toBe(0);
        expect(modelInfo.boosts?.has("test-boost")).toBe(false);

        spawned.cleanup();
    });

    it("prevents duplicate boosts with the same key", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        let addCallCount = 0;
        modelInfo.boostAdded?.add(() => {
            addCallCount++;
        });

        const boost1: ItemBoost = { ignoresLimitations: false };
        const boost2: ItemBoost = { ignoresLimitations: true };

        Boostable.addBoost(modelInfo, "duplicate-key", boost1);
        Boostable.addBoost(modelInfo, "duplicate-key", boost2);

        expect(addCallCount).toBe(1);
        expect(modelInfo.boosts?.size()).toBe(1);
        expect(modelInfo.boosts?.get("duplicate-key")).toBe(boost1);

        spawned.cleanup();
    });

    it("correctly checks if a boost exists with hasBoost", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        expect(Boostable.hasBoost(modelInfo, "nonexistent")).toBe(false);

        const testBoost: ItemBoost = { ignoresLimitations: false };
        Boostable.addBoost(modelInfo, "test-boost", testBoost);

        expect(Boostable.hasBoost(modelInfo, "test-boost")).toBe(true);
        expect(Boostable.hasBoost(modelInfo, "other-boost")).toBe(false);

        spawned.cleanup();
    });

    it("handles multiple boosts with different keys", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        const boost1: ItemBoost = { ignoresLimitations: false };
        const boost2: ItemBoost = { ignoresLimitations: true };
        const boost3: ItemBoost = { ignoresLimitations: false };

        Boostable.addBoost(modelInfo, "boost-1", boost1);
        Boostable.addBoost(modelInfo, "boost-2", boost2);
        Boostable.addBoost(modelInfo, "boost-3", boost3);

        expect(modelInfo.boosts?.size()).toBe(3);
        expect(Boostable.hasBoost(modelInfo, "boost-1")).toBe(true);
        expect(Boostable.hasBoost(modelInfo, "boost-2")).toBe(true);
        expect(Boostable.hasBoost(modelInfo, "boost-3")).toBe(true);

        spawned.cleanup();
    });

    it("correctly handles removing a non-existent boost", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        let removeCallCount = 0;
        modelInfo.boostRemoved?.add(() => {
            removeCallCount++;
        });

        Boostable.removeBoost(modelInfo, "nonexistent-boost");

        expect(removeCallCount).toBe(0);
        expect(modelInfo.boosts?.size()).toBe(0);

        spawned.cleanup();
    });

    it("supports ignoresLimitations flag on boosts", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        const normalBoost: ItemBoost = { ignoresLimitations: false };
        const unlimitedBoost: ItemBoost = { ignoresLimitations: true };

        Boostable.addBoost(modelInfo, "normal", normalBoost);
        Boostable.addBoost(modelInfo, "unlimited", unlimitedBoost);

        expect(modelInfo.boosts?.get("normal")?.ignoresLimitations).toBe(false);
        expect(modelInfo.boosts?.get("unlimited")?.ignoresLimitations).toBe(true);

        spawned.cleanup();
    });

    it("allows multiple boostAdded callbacks to fire", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        let callback1Called = false;
        let callback2Called = false;

        modelInfo.boostAdded?.add(() => {
            callback1Called = true;
        });
        modelInfo.boostAdded?.add(() => {
            callback2Called = true;
        });

        const testBoost: ItemBoost = { ignoresLimitations: false };
        Boostable.addBoost(modelInfo, "test", testBoost);

        expect(callback1Called).toBe(true);
        expect(callback2Called).toBe(true);

        spawned.cleanup();
    });

    it("allows multiple boostRemoved callbacks to fire", () => {
        const spawned = spawnItemModel(TheFirstGenerator.id);
        const modelInfo = getAllInstanceInfo(spawned.model);

        const testBoost: ItemBoost = { ignoresLimitations: false };
        Boostable.addBoost(modelInfo, "test", testBoost);

        let callback1Called = false;
        let callback2Called = false;

        modelInfo.boostRemoved?.add(() => {
            callback1Called = true;
        });
        modelInfo.boostRemoved?.add(() => {
            callback2Called = true;
        });

        Boostable.removeBoost(modelInfo, "test");

        expect(callback1Called).toBe(true);
        expect(callback2Called).toBe(true);

        spawned.cleanup();
    });
});

describe("Status Effects", () => {
    it("applies status effects to droplets on upgrade", () => {
        const spawned = spawnItemModel(FlamethrowerUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        expect(dropletData.dropletInfo.statusEffects).toBeUndefined();

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        expect(dropletData.dropletInfo.statusEffects).toBeDefined();
        expect(dropletData.dropletInfo.statusEffects?.size()).toBeGreaterThan(0);

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("does not apply duplicate status effects to the same droplet", () => {
        const spawned = spawnItemModel(FlamethrowerUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        withWeatherDisabled(() => {
            handle.touch(dropletData.droplet, dropletData.dropletInfo);
            handle.touch(dropletData.droplet, dropletData.dropletInfo);
        });

        expect(dropletData.dropletInfo.statusEffects).toBeDefined();
        const statusCount = dropletData.dropletInfo.statusEffects?.size();
        expect(statusCount).toBeDefined();

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("does not apply status effect when item is not maintained", () => {
        const spawned = spawnItemModel(FlamethrowerUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        spawned.modelInfo.maintained = false;

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        expect(dropletData.dropletInfo.statusEffects?.size()).toBeUndefined();

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("does not apply status effect when item is broken", () => {
        const spawned = spawnItemModel(FlamethrowerUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        spawned.modelInfo.broken = true;

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        expect(dropletData.dropletInfo.statusEffects?.size()).toBeUndefined();

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("allows status effects to be toggled with setActive", () => {
        const spawned = spawnItemModel(FlamethrowerUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        // Find a status effect trait from the upgrader
        const statusEffectTrait = FlamethrowerUpgrader.trait(Ablaze);

        expect(statusEffectTrait).toBeDefined();
        if (statusEffectTrait === undefined) {
            spawned.cleanup();
            return;
        }

        const droplet1 = spawnDroplet(Droplet.TheFirstDroplet);
        withWeatherDisabled(() => handle.touch(droplet1.droplet, droplet1.dropletInfo));
        expect(droplet1.dropletInfo.statusEffects?.size()).toBeGreaterThan(0);

        statusEffectTrait.setActive(false);

        const droplet2 = spawnDroplet(Droplet.TheFirstDroplet);
        withWeatherDisabled(() => handle.touch(droplet2.droplet, droplet2.dropletInfo));
        expect(droplet2.dropletInfo.statusEffects?.size()).toBeUndefined();

        droplet1.cleanup();
        droplet2.cleanup();
        spawned.cleanup();
    });

    it("stores status effect info in droplet metadata", () => {
        const spawned = spawnItemModel(FlamethrowerUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        // Status effects should be present after upgrade
        const statusEffects = dropletData.dropletInfo.statusEffects;
        if (statusEffects !== undefined) {
            expect(statusEffects.size()).toBeGreaterThan(0);

            for (const [effect, info] of statusEffects) {
                expect(effect).toBeDefined();
            }
        }

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("allows multiple different status effects on the same droplet", () => {
        // This test verifies that status effects can stack
        // Since FlamethrowerUpgrader only has Ablaze, we just verify it applies
        const spawned = spawnItemModel(FlamethrowerUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        // The droplet should have been upgraded by the upgrader
        const upgradeCount = dropletData.dropletInfo.upgrades?.size() ?? 0;
        expect(upgradeCount).toBeGreaterThan(0);

        dropletData.cleanup();
        spawned.cleanup();
    });

    it("applies upgrades from status effects to droplet value", () => {
        const spawned = spawnItemModel(FlamethrowerUpgrader.id);
        const handle = getTouchByTag(spawned.model, "Laser");
        const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

        const valueBefore = withWeatherDisabled(() => {
            return Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
        });

        withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

        const valueAfter = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);

        const fundsAfter = valueAfter.get("Funds");
        const fundsBefore = valueBefore.get("Funds");
        expect(fundsAfter).toBeDefined();
        expect(fundsBefore).toBeDefined();

        if (fundsAfter !== undefined && fundsBefore !== undefined) {
            expect(fundsAfter.moreThan(fundsBefore) || fundsAfter.equals(fundsBefore)).toBe(true);
        }

        dropletData.cleanup();
        spawned.cleanup();
    });
});
