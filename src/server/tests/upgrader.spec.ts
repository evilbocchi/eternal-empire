/// <reference types="@rbxts/testez/globals" />
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Janitor } from "@rbxts/janitor";
import { HttpService } from "@rbxts/services";
import { OnoeNum } from "@rbxts/serikanum";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { Server } from "shared/api/APIExpose";
import Droplet from "shared/item/Droplet";
import Operative from "shared/item/traits/Operative";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";
import Items from "shared/items/Items";

export = function () {
    beforeAll(() => {
        eater.janitor = new Janitor();
        mockFlamework();
    });

    afterAll(() => {
        eater.janitor?.Destroy();
    });

    describe("Upgrader", () => {
        function createUpgraderModel(itemId: string) {
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
            modelInfo.Maintained = true;
            Server.Item.modelPerPlacementId.set(placementId, model!);

            for (const callback of item!.LOADS) {
                callback(model!, item!);
            }

            let laser: BasePart | undefined;
            for (const descendant of model!.GetDescendants()) {
                if (descendant.IsA("BasePart") && descendant.HasTag("Laser")) {
                    laser = descendant;
                    break;
                }
            }
            expect(laser === undefined).to.equal(false);

            const dropletTouched = getAllInstanceInfo(laser!).DropletTouched;
            expect(dropletTouched === undefined).to.equal(false);

            return {
                touch(droplet: BasePart, dropletInfo: InstanceInfo) {
                    dropletTouched!(droplet, dropletInfo);
                },
                cleanup() {
                    model!.Destroy();
                    Server.Item.modelPerPlacementId.delete(placementId);
                },
            };
        }

        function spawnDroplet(template: Droplet) {
            const dropperModel = new Instance("Model") as Model;
            dropperModel.Name = `TestDropper_${HttpService.GenerateGUID(false)}`;
            dropperModel.Parent = PLACED_ITEMS_FOLDER;
            const dropperInfo = getAllInstanceInfo(dropperModel);
            dropperInfo.ItemId = "TestDropper";

            const instantiator = template.getInstantiator(dropperModel);
            const droplet = instantiator() as BasePart;
            droplet.Parent = PLACED_ITEMS_FOLDER;

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

        it("applies additive boosts to droplets when lasers are touched", () => {
            const revenueService = Server.Revenue;
            const weatherBefore = revenueService.weatherBoostEnabled;
            revenueService.weatherBoostEnabled = false;

            const upgrader = createUpgraderModel("TheFirstUpgrader");
            const { droplet, dropletInfo, cleanup } = spawnDroplet(Droplet.TheFirstDroplet);

            const [beforeValue] = revenueService.calculateDropletValue(droplet, false, true);
            expect(beforeValue.get("Funds")?.equals(new OnoeNum(1))).to.equal(true);

            upgrader.touch(droplet, dropletInfo);

            const [afterValue] = revenueService.calculateDropletValue(droplet, false, true);
            expect(afterValue.get("Funds")?.equals(new OnoeNum(5))).to.equal(true);
            expect(dropletInfo.Upgrades?.size()).to.equal(1);

            cleanup();
            upgrader.cleanup();
            revenueService.weatherBoostEnabled = weatherBefore;
        });

        it("applies multiplicative boosts to droplets", () => {
            const revenueService = Server.Revenue;
            const weatherBefore = revenueService.weatherBoostEnabled;
            revenueService.weatherBoostEnabled = false;

            const upgrader = createUpgraderModel("SmallReactor");
            const { droplet, dropletInfo, cleanup } = spawnDroplet(Droplet.TheFirstDroplet);

            const [beforeValue] = revenueService.calculateDropletValue(droplet, false, true);
            expect(beforeValue.get("Funds")?.equals(new OnoeNum(1))).to.equal(true);

            upgrader.touch(droplet, dropletInfo);

            const [afterValue] = revenueService.calculateDropletValue(droplet, false, true);
            expect(afterValue.get("Funds")?.equals(new OnoeNum(3.5))).to.equal(true);
            expect(dropletInfo.Upgrades?.size()).to.equal(1);

            cleanup();
            upgrader.cleanup();
            revenueService.weatherBoostEnabled = weatherBefore;
        });

        it("combines additive and multiplicative boosts from different upgraders", () => {
            const revenueService = Server.Revenue;
            const weatherBefore = revenueService.weatherBoostEnabled;
            revenueService.weatherBoostEnabled = false;

            const additive = createUpgraderModel("TheFirstUpgrader");
            const multiplicative = createUpgraderModel("SmallReactor");
            const { droplet, dropletInfo, cleanup } = spawnDroplet(Droplet.TheFirstDroplet);

            const [beforeValue] = revenueService.calculateDropletValue(droplet, false, true);
            expect(beforeValue.get("Funds")?.equals(new OnoeNum(1))).to.equal(true);

            additive.touch(droplet, dropletInfo);
            multiplicative.touch(droplet, dropletInfo);

            const [afterValue] = revenueService.calculateDropletValue(droplet, false, true);
            expect(afterValue.get("Funds")?.equals(new OnoeNum(17.5))).to.equal(true);
            expect(dropletInfo.Upgrades?.size()).to.equal(2);

            cleanup();
            additive.cleanup();
            multiplicative.cleanup();
            revenueService.weatherBoostEnabled = weatherBefore;
        });

        it("applies power boosts alongside other multipliers across currencies", () => {
            const revenueService = Server.Revenue;
            const weatherBefore = revenueService.weatherBoostEnabled;
            revenueService.weatherBoostEnabled = false;

            const upgrader = createUpgraderModel("JoyfulPark");
            const { droplet, dropletInfo, cleanup } = spawnDroplet(Droplet.HappyDroplet);

            const [beforeValue] = revenueService.calculateDropletValue(droplet, false, true);
            const fundsBefore = beforeValue.get("Funds")!;
            const powerBefore = beforeValue.get("Power")!;
            const skillBefore = beforeValue.get("Skill")!;

            upgrader.touch(droplet, dropletInfo);

            const [afterValue] = revenueService.calculateDropletValue(droplet, false, true);

            const [templateAdd, templateMul, templatePow] = Operative.template();
            const [effectiveAdd, effectiveMul, effectivePow] = Upgrader.applyUpgrades(
                templateAdd,
                templateMul,
                templatePow,
                dropletInfo,
            );
            const expected = Droplet.HappyDroplet.coalesce(effectiveAdd, effectiveMul, effectivePow);

            const expectedFunds = expected.get("Funds")!;
            const expectedPower = expected.get("Power")!;
            const expectedSkill = expected.get("Skill")!;

            expect(afterValue.get("Funds")?.equals(expectedFunds)).to.equal(true);
            expect(afterValue.get("Power")?.equals(expectedPower)).to.equal(true);
            expect(afterValue.get("Skill")?.equals(expectedSkill)).to.equal(true);
            expect(afterValue.get("Funds")?.moreThan(fundsBefore)).to.equal(true);
            expect(afterValue.get("Power")?.moreThan(powerBefore)).to.equal(true);
            expect(afterValue.get("Skill")?.moreThan(skillBefore)).to.equal(true);

            cleanup();
            upgrader.cleanup();
            revenueService.weatherBoostEnabled = weatherBefore;
        });
    });
};
