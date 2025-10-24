/// <reference types="@rbxts/testez/globals" />
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Janitor } from "@rbxts/janitor";
import { OnoeNum } from "@rbxts/serikanum";
import { HttpService, Workspace } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Condenser from "shared/item/traits/dropper/Condenser";
import Dropper from "shared/item/traits/dropper/Dropper";
import Generator from "shared/item/traits/generator/Generator";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
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

export = function () {
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
        expect(item === undefined).to.equal(false);

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
        expect(model === undefined).to.equal(false);

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
        expect(dropletInfo === undefined).to.equal(false);

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
            expect(dropletTouched).to.be.ok();
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
            expect(dropletTouched).to.be.ok();

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
        expect(furnaceProcessed).to.be.ok();

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

    describe("Upgrader", () => {
        it("applies additive boosts to droplets when lasers are touched", () => {
            const spawned = spawnItemModel(TheFirstUpgrader.id);
            const handle = getTouchByTag(spawned.model, "Laser");
            const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

            const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
            expect(firstDropletFunds).to.be.ok();
            if (firstDropletFunds === undefined) return;

            withWeatherDisabled(() => {
                const beforeValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
                expect(beforeValue.get("Funds")?.equals(firstDropletFunds)).to.equal(true);
                handle.touch(dropletData.droplet, dropletData.dropletInfo);
            });

            const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);

            const upgraderFundsAdd = TheFirstUpgrader.findTrait("Upgrader")?.add?.get("Funds");
            if (upgraderFundsAdd === undefined) throw "Upgrader add Funds is undefined";

            expect(afterValue.get("Funds")?.equals(firstDropletFunds.add(upgraderFundsAdd))).to.equal(true);
            expect(dropletData.dropletInfo.upgrades?.size()).to.equal(1);

            dropletData.cleanup();
            spawned.cleanup();
        });

        it("applies multiplicative boosts to droplets", () => {
            const spawned = spawnItemModel(SmallReactor.id);
            const handle = getTouchByTag(spawned.model, "Laser");
            const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

            const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
            expect(firstDropletFunds).to.be.ok();
            if (firstDropletFunds === undefined) return;

            withWeatherDisabled(() => {
                const beforeValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
                expect(beforeValue.get("Funds")?.equals(firstDropletFunds)).to.equal(true);
                handle.touch(dropletData.droplet, dropletData.dropletInfo);
            });

            const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);

            const upgraderFundsMul = SmallReactor.findTrait("Upgrader")?.mul?.get("Funds");
            if (upgraderFundsMul === undefined) throw "Upgrader mul Funds is undefined";

            expect(afterValue.get("Funds")?.equals(firstDropletFunds.mul(upgraderFundsMul))).to.equal(true);
            expect(dropletData.dropletInfo.upgrades?.size()).to.equal(1);

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
            expect(firstDropletFunds).to.be.ok();
            if (firstDropletFunds === undefined) return;

            withWeatherDisabled(() => {
                const beforeValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
                expect(beforeValue.get("Funds")?.equals(firstDropletFunds)).to.equal(true);
                additiveHandle.touch(dropletData.droplet, dropletData.dropletInfo);
                multiplicativeHandle.touch(dropletData.droplet, dropletData.dropletInfo);
            });

            const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);

            const upgraderAdd = TheFirstUpgrader.findTrait("Upgrader")?.add?.get("Funds");
            if (upgraderAdd === undefined) throw "Additive Upgrader add Funds is undefined";
            const upgraderMul = SmallReactor.findTrait("Upgrader")?.mul?.get("Funds");
            if (upgraderMul === undefined) throw "Multiplicative Upgrader mul Funds is undefined";

            expect(afterValue.get("Funds")?.equals(firstDropletFunds.add(upgraderAdd).mul(upgraderMul))).to.equal(true);
            expect(dropletData.dropletInfo.upgrades?.size()).to.equal(2);

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

            expect(afterValue.get("Funds")?.equals(expected.get("Funds")!)).to.equal(true);
            expect(afterValue.get("Power")?.equals(expected.get("Power")!)).to.equal(true);
            expect(afterValue.get("Skill")?.equals(expected.get("Skill")!)).to.equal(true);
            expect(afterValue.get("Funds")?.moreThan(fundsBefore)).to.equal(true);
            expect(afterValue.get("Power")?.moreThan(powerBefore)).to.equal(true);
            expect(afterValue.get("Skill")?.moreThan(skillBefore)).to.equal(true);

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
            expect(firstDropletFunds).to.be.ok();
            if (firstDropletFunds === undefined) return;

            const furnaceMul = ImprovedFurnace.findTrait("Furnace")?.mul?.get("Funds");
            if (furnaceMul === undefined) throw "Furnace mul Funds is undefined";

            withWeatherDisabled(() => upgraderHandle.touch(dropletData.droplet, dropletData.dropletInfo));
            expect(dropletData.dropletInfo.upgrades?.size()).to.equal(1);

            upgrader.cleanup();
            Server.Currency.set("Funds", new OnoeNum(0));

            withWeatherDisabled(() => furnaceHandle.touch(dropletData.droplet, dropletData.dropletInfo));

            expect(Server.Currency.get("Funds").equals(furnaceMul.mul(firstDropletFunds))).to.equal(true);

            dropletData.cleanup();
            furnace.cleanup();
        });

        it("ignores duplicate touches from the same laser", () => {
            const spawned = spawnItemModel(TheFirstUpgrader.id);
            const handle = getTouchByTag(spawned.model, "Laser");
            const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

            const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
            expect(firstDropletFunds).to.be.ok();
            if (firstDropletFunds === undefined) return;

            const upgraderAdd = TheFirstUpgrader.findTrait("Upgrader")?.add?.get("Funds");
            if (upgraderAdd === undefined) throw "Upgrader add Funds is undefined";

            withWeatherDisabled(() => {
                handle.touch(dropletData.droplet, dropletData.dropletInfo);
                handle.touch(dropletData.droplet, dropletData.dropletInfo);
            });

            const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);
            expect(afterValue.get("Funds")?.equals(firstDropletFunds.add(upgraderAdd))).to.equal(true);
            expect(dropletData.dropletInfo.upgrades?.size()).to.equal(1);

            dropletData.cleanup();
            spawned.cleanup();
        });
    });

    describe("Furnace", () => {
        it("burns droplets and credits furnace rewards", () => {
            const spawned = spawnItemModel(ImprovedFurnace.id);
            const handle = getTouchByTag(spawned.model, "Lava");
            const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

            const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
            expect(firstDropletFunds).to.be.ok();
            if (firstDropletFunds === undefined) return;

            Server.Currency.set("Funds", new OnoeNum(0));

            withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

            const furnaceMul = ImprovedFurnace.findTrait("Furnace")?.mul?.get("Funds");
            if (furnaceMul === undefined) throw "Furnace mul Funds is undefined";

            expect(Server.Currency.get("Funds").equals(furnaceMul.mul(firstDropletFunds))).to.equal(true);
            expect(dropletData.dropletInfo.incinerated).to.equal(true);

            dropletData.cleanup();
            spawned.cleanup();
        });

        it("applies div and root softcaps when droplet value exceeds thresholds", () => {
            const furnace = spawnItemModel(ImprovedFurnace.id);
            const handle = getTouchByTag(furnace.model, "Lava");
            const dropletData = spawnDroplet(Droplet.FatDroplet);

            dropletData.dropletInfo.upgrades ??= new Map();
            dropletData.dropletInfo.upgrades.set("TestBoost", {
                model: furnace.model,
                boost: {
                    mul: new CurrencyBundle().set("Funds", 1e308),
                },
            });

            Server.Currency.set("Funds", new OnoeNum(0));

            const furnaceTrait = ImprovedFurnace.findTrait("Furnace");
            expect(furnaceTrait).to.be.ok();
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
            expect(naiveFunds).to.be.ok();
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
            expect(expectedFunds).to.be.ok();
            if (expectedFunds === undefined) {
                dropletData.cleanup();
                furnace.cleanup();
                throw "Expected furnace funds is undefined";
            }

            expect(expectedResult.factors.some(([label]) => label === "SOFTCAPDIV")).to.equal(true);
            expect(expectedResult.factors.some(([label]) => label === "SOFTCAPROOT")).to.equal(true);
            expect(expectedFunds.lessThan(naiveFunds)).to.equal(true);

            withWeatherDisabled(() => handle.touch(dropletData.droplet, dropletData.dropletInfo));

            const afterFunds = Server.Currency.get("Funds");

            expect(afterFunds.equals(expectedFunds)).to.equal(true);
            expect(afterFunds.equals(naiveFunds)).to.equal(false);

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
            expect(firstDropletFunds).to.be.ok();
            if (firstDropletFunds === undefined) return;

            const upgraderFundsAdd = TheFirstUpgrader.findTrait("Upgrader")?.add?.get("Funds");
            if (upgraderFundsAdd === undefined) throw "Upgrader add Funds is undefined";

            const furnaceMul = BasicCauldron.findTrait("Furnace")?.mul?.get("Funds");
            if (furnaceMul === undefined) throw "Furnace mul Funds is undefined";

            Server.Currency.set("Funds", new OnoeNum(0));

            withWeatherDisabled(() => laserHandle.touch(dropletData.droplet, dropletData.dropletInfo));
            expect(dropletData.dropletInfo.upgrades?.size()).to.equal(1);
            expect(dropletData.dropletInfo.sky).to.equal(undefined);

            withWeatherDisabled(() => lavaHandle.touch(dropletData.droplet, dropletData.dropletInfo));

            const credited = Server.Currency.get("Funds");
            const expectedBase = furnaceMul.mul(firstDropletFunds);
            expect(credited.equals(expectedBase)).to.equal(true);

            const upgradedValue = firstDropletFunds.add(upgraderFundsAdd);
            const expectedWithUpgrade = furnaceMul.mul(upgradedValue);
            expect(credited.equals(expectedWithUpgrade)).to.equal(false);
            expect(dropletData.dropletInfo.incinerated).to.equal(true);

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
            expect(firstDropletFunds).to.be.ok();
            if (firstDropletFunds === undefined) return;

            const skyMul = VoidSkyUpgrader.findTrait("Upgrader")?.mul?.get("Funds");
            if (skyMul === undefined) throw "Sky upgrader mul Funds is undefined";

            const furnaceMul = ImprovedFurnace.findTrait("Furnace")?.mul?.get("Funds");
            if (furnaceMul === undefined) throw "Furnace mul Funds is undefined";

            Server.Currency.set("Funds", new OnoeNum(0));

            withWeatherDisabled(() => laserHandle.touch(dropletData.droplet, dropletData.dropletInfo));
            expect(dropletData.dropletInfo.upgrades?.size()).to.equal(1);
            expect(dropletData.dropletInfo.sky).to.equal(true);

            withWeatherDisabled(() => lavaHandle.touch(dropletData.droplet, dropletData.dropletInfo));

            const credited = Server.Currency.get("Funds");
            const expected = furnaceMul.mul(firstDropletFunds.mul(skyMul)).div(250);

            expect(credited.equals(expected)).to.equal(true);
            expect(dropletData.dropletInfo.incinerated).to.equal(true);

            dropletData.cleanup();
            upgrader.cleanup();
            furnace.cleanup();
        });
    });

    describe("Generator", () => {
        it("applies generator boosts when computing passive gain", () => {
            const generatorTrait = TheFirstGenerator.findTrait("Generator");
            expect(generatorTrait === undefined).to.equal(false);
            const passiveGain = generatorTrait!.passiveGain!;

            const spawned = spawnItemModel(TheFirstGenerator.id);
            expect(spawned.modelInfo.boosts === undefined).to.equal(false);

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
            expect(power === undefined).to.equal(false);
            expect(power!.equals(new OnoeNum(2))).to.equal(true);

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
            expect(entries.size() === 0).to.equal(false);

            const [dropPart, info] = entries[0];
            info.dropRate = 0;
            const instantiator = info.instantiator;
            expect(instantiator === undefined).to.equal(false);

            Dropper.hasLuckyWindow = false;

            const droplet = instantiator!();
            expect(droplet === undefined).to.equal(false);
            const dropletPart = droplet as unknown as BasePart;
            expect(dropletPart.Parent === Workspace).to.equal(true);

            const dropletInfo = Droplet.SPAWNED_DROPLETS.get(dropletPart);
            expect(dropletInfo === undefined).to.equal(false);
            expect(dropletInfo!.dropletId).to.equal(Droplet.TheFirstDroplet.id);
            expect(dropPart.HasTag("Drop")).to.equal(true);

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
            expect(conveyorPart).to.be.ok();
            if (conveyorPart === undefined) {
                model.Destroy();
                throw "Conveyor part is undefined";
            }

            const expectedVelocity = conveyorPart.CFrame.LookVector.mul(item.findTrait("Conveyor")!.speed);
            expect(conveyorPart.AssemblyLinearVelocity).to.equal(expectedVelocity);

            model.Destroy();
        });
    });

    describe("Health", () => {
        it("reduces droplet value based on remaining health", () => {
            const dropletData = spawnDroplet(Droplet.TheFirstDroplet);

            const firstDropletFunds = Droplet.TheFirstDroplet.value.get("Funds");
            expect(firstDropletFunds).to.be.ok();
            if (firstDropletFunds === undefined) {
                dropletData.cleanup();
                throw "First droplet Funds is undefined";
            }

            withWeatherDisabled(() => {
                const beforeValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);

                const t = Server.Revenue.calculateDropletValue(dropletData.droplet, true);
                t.applySource();
                t.applyFinal();
                expect(beforeValue.get("Funds")?.equals(firstDropletFunds)).to.equal(true);
            });

            dropletData.dropletInfo.health = 40;
            const afterValue = Server.Revenue.calculateSingleDropletValue(dropletData.droplet);

            const funds = afterValue.get("Funds");
            expect(funds).to.be.ok();
            if (funds === undefined) throw "Funds after health reduction is undefined";

            expect(funds.equals(firstDropletFunds.mul(0.4))).to.equal(true);

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
            expect(upgrades).to.be.ok();
            if (upgrades === undefined) return;

            expect(upgrades.size()).to.equal(2);
            for (const [name, upgrade] of upgrades) {
                const [operative] = Upgrader.getUpgrade(upgrade);
                expect(operative).to.be.ok();
                if (operative === undefined) continue;

                const add = operative.add;
                expect(add).to.be.ok();

                let laserId: string;
                if (name.find("BitcoinLaser")[0] !== undefined) {
                    laserId = "BitcoinLaser";
                } else if (name.find("PowerLaser")[0] !== undefined) {
                    laserId = "PowerLaser";
                } else {
                    throw `Unexpected upgrade name ${name}`;
                }

                const actual = Sideswiper.findTrait("OmniUpgrader")?.addsPerLaser.get(laserId);
                expect(actual).to.be.ok();
                if (actual === undefined) return;

                expect(add?.equals(actual)).to.equal(true);
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

            expect(produced).to.be.ok();
            if (produced === undefined) {
                inputDroplet.Destroy();
                cleanup();
                return;
            }

            const producedInfo = Droplet.SPAWNED_DROPLETS.get(produced);
            expect(producedInfo).to.be.ok();
            expect(producedInfo?.condensed).to.equal(true);

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

            expect(produced).to.be.ok();
            if (produced === undefined) {
                inputDroplet.Destroy();
                cleanup();
                return;
            }

            const producedInfo = Droplet.SPAWNED_DROPLETS.get(produced);
            expect(producedInfo).to.be.ok();

            const dropletCountBefore = Droplet.SPAWNED_DROPLETS.size();
            furnaceProcessed(raw, produced, producedInfo!);
            expect(Droplet.SPAWNED_DROPLETS.size()).to.equal(dropletCountBefore);

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
            expect(rawFunds).to.be.ok();
            expect(softFunds).to.be.ok();
            if (rawFunds === undefined || softFunds === undefined) {
                dropletData.cleanup();
                cleanup();
                throw "Condenser comparison funds are undefined";
            }
            expect(softFunds.lessThan(rawFunds)).to.equal(true);

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

            expect(produced).to.be.ok();
            if (produced === undefined) {
                dropletData.cleanup();
                cleanup();
                throw "Condenser failed to produce a droplet";
            }

            expect(Server.Currency.get("Funds").equals(highBalance)).to.equal(true);

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
            expect(baseFunds).to.be.ok();
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

            withWeatherDisabled(() =>
                furnaceProcessed(contributionValue, dropletData.droplet, dropletData.dropletInfo),
            );

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

            expect(condensedDropletModel).to.be.ok();
            if (condensedDropletModel === undefined || condensedInfo === undefined) {
                firstUpgrader.cleanup();
                cleanup();
                return;
            }

            expect(condensedInfo.condensed).to.equal(true);
            const placeholderUpgrades = condensedInfo.upgrades;
            expect(placeholderUpgrades).to.be.ok();
            if (placeholderUpgrades === undefined) {
                condensedDropletModel.Destroy();
                firstUpgrader.cleanup();
                cleanup();
                return;
            }
            expect(placeholderUpgrades.size()).to.equal(1);

            firstUpgrader.cleanup();

            const repositionedUpgrader = spawnItemModel(CoalescentRefiner.id);
            const repositionedHandle = getTouchByTag(repositionedUpgrader.model, "Laser");

            withWeatherDisabled(() => repositionedHandle.touch(condensedDropletModel!, condensedInfo!));

            expect(condensedInfo?.upgrades?.size()).to.equal(2);

            Server.Currency.set("Funds", new OnoeNum(0));
            Server.Currency.set("Power", new OnoeNum(0));

            const furnace = spawnItemModel(ImprovedFurnace.id);
            const lavaHandle = getTouchByTag(furnace.model, "Lava");

            withWeatherDisabled(() => lavaHandle.touch(condensedDropletModel!, condensedInfo!));

            const furnaceMul = ImprovedFurnace.findTrait("Furnace")?.mul?.get("Funds");
            expect(furnaceMul).to.be.ok();
            if (furnaceMul === undefined) {
                if (condensedDropletModel.Parent !== undefined) condensedDropletModel.Destroy();
                repositionedUpgrader.cleanup();
                furnace.cleanup();
                cleanup();
                return;
            }

            const expectedFunds = condensedDroplet.value.get("Funds")!.mul(furnaceMul);
            const credited = Server.Currency.get("Funds");
            expect(credited.equals(expectedFunds)).to.equal(true);

            if (condensedDropletModel.Parent !== undefined) condensedDropletModel.Destroy();
            repositionedUpgrader.cleanup();
            furnace.cleanup();
            cleanup();
        });
    });
};
