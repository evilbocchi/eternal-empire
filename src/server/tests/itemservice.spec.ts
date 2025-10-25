/// <reference types="@rbxts/testez/globals" />
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Janitor } from "@rbxts/janitor";
import { OnoeNum } from "@rbxts/serikanum";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { Server } from "shared/api/APIExpose";
import { REPAIR_BOOST_KEY, REPAIR_BOOST_MULTIPLIERS, REPAIR_PROTECTION_DURATIONS } from "shared/item/repair";
import type { RepairProtectionState } from "shared/item/repair";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";

export = function () {
    beforeAll(() => {
        eater.janitor = new Janitor();
        mockFlamework();
    });

    afterAll(() => {
        eater.janitor?.Destroy();
    });

    describe("ItemService", () => {
        beforeEach(() => {
            const items = Server.Data.empireData.items;
            items.inventory.set("TheFirstDropper", 0);
            items.inventory.set("BulkyDropper", 0);
            items.uniqueInstances.clear();
            items.worldPlaced.clear();
            items.brokenPlacedItems.clear();
            items.repairProtection.clear();
            Server.Item.modelPerPlacementId.clear();
            for (const child of PLACED_ITEMS_FOLDER.GetChildren()) child.Destroy();
            Server.Item.breakdownsEnabled = true;
            Server.Item.setItemAmount("TheFirstDropper", 0);
            Server.Item.setItemAmount("BulkyDropper", 0);
            Server.Item.setBoughtAmount("TheFirstDropper", 0);
            Server.Item.setBoughtAmount("BulkyDropper", 0);
            Server.Currency.set("Funds", new OnoeNum(1e6));
        });

        it("gives non-unique items directly into the inventory", () => {
            Server.Item.giveItem("TheFirstDropper", 2);
            expect(Server.Item.getItemAmount("TheFirstDropper")).to.equal(2);
        });

        it("creates unique item instances when giving unique items", () => {
            const uniqueInstances = Server.Data.empireData.items.uniqueInstances;
            expect(uniqueInstances.size()).to.equal(0);

            Server.Item.giveItem("TheFirstDropperBooster", 1);

            expect(uniqueInstances.size()).to.equal(1);
            for (const [, instance] of uniqueInstances) {
                expect(instance.baseItemId).to.equal("TheFirstDropperBooster");
                expect(instance.pots.size() > 0).to.equal(true);
            }
        });

        it("fires itemsBought when purchases succeed", () => {
            let fired = false;
            const connection = Server.Item.itemsBought.connect((player, items) => {
                expect(player).to.equal(undefined);
                let hasBulkyDropper = false;
                for (const item of items) {
                    hasBulkyDropper = item.id === "BulkyDropper";
                }
                fired = hasBulkyDropper && items.size() === 1;
            });

            Server.Item.setItemAmount("BulkyDropper", 0);
            Server.Item.setBoughtAmount("BulkyDropper", 0);
            Server.Currency.set("Funds", new OnoeNum(1e6));

            const success = Server.Item.buyItem(undefined, "BulkyDropper");
            connection.Disconnect();

            expect(success).to.equal(true);
            expect(fired).to.equal(true);
            expect(Server.Item.getItemAmount("BulkyDropper") > 0).to.equal(true);
        });

        it("returns items to inventory when unplaced", () => {
            const placementId = "TEST_PLACEMENT";
            const placedItem: PlacedItem = {
                item: "TheFirstDropper",
                posX: 0,
                posY: 0,
                posZ: 0,
                rotX: 0,
                rotY: 0,
                rotZ: 0,
                area: "BarrenIslands",
            };

            Server.Data.empireData.items.worldPlaced.set(placementId, placedItem);
            Server.Item.setItemAmount("TheFirstDropper", 0);

            const unplaced = Server.Item.unplaceItems(undefined, new Set([placementId]));

            expect(unplaced).to.be.ok();
            expect(unplaced?.size()).to.equal(1);
            expect(Server.Item.getItemAmount("TheFirstDropper")).to.equal(1);
        });

        it("marks items as broken and clears boosts when a breakdown begins", () => {
            const items = Server.Data.empireData.items;
            const placementId = "TestBreakdown";

            const placedItem: PlacedItem = {
                item: "TheFirstDropper",
                posX: 0,
                posY: 0,
                posZ: 0,
                rotX: 0,
                rotY: 0,
                rotZ: 0,
                area: "BarrenIslands",
            };
            items.worldPlaced.set(placementId, placedItem);

            const model = new Instance("Model") as Model;
            model.Name = placementId;
            model.Parent = PLACED_ITEMS_FOLDER;

            const modelInfo = getAllInstanceInfo(model);
            modelInfo.boosts = new Map([[REPAIR_BOOST_KEY, { ignoresLimitations: true } as ItemBoost]]);

            const protection: RepairProtectionState = {
                tier: "Great",
                expiresAt: os.time() + 10,
            };
            items.repairProtection.set(placementId, protection);

            Server.Item.modelPerPlacementId.set(placementId, model);

            Server.Item.beginBreakdown([placementId]);

            expect(Server.Item.getBrokenPlacedItems().has(placementId)).to.equal(true);
            expect(modelInfo.broken).to.equal(true);
            expect(modelInfo.boosts?.has(REPAIR_BOOST_KEY)).to.equal(false);
            expect(items.repairProtection.has(placementId)).to.equal(false);

            model.Destroy();
        });

        it("repairs broken items and applies protection tiers", () => {
            const items = Server.Data.empireData.items;
            const placementId = "TestRepair";

            const placedItem: PlacedItem = {
                item: "TheFirstDropper",
                posX: 0,
                posY: 0,
                posZ: 0,
                rotX: 0,
                rotY: 0,
                rotZ: 0,
                area: "BarrenIslands",
            };
            items.worldPlaced.set(placementId, placedItem);

            const model = new Instance("Model") as Model;
            model.Name = placementId;
            model.Parent = PLACED_ITEMS_FOLDER;

            const modelInfo = getAllInstanceInfo(model);

            Server.Item.modelPerPlacementId.set(placementId, model);
            Server.Item.beginBreakdown([placementId]);

            const before = os.time();
            const success = Server.Item.completeRepair(placementId, "Great");
            const after = os.time();

            expect(success).to.equal(true);
            expect(Server.Item.getBrokenPlacedItems().has(placementId)).to.equal(false);
            expect(modelInfo.broken).to.equal(false);

            const protection = items.repairProtection.get(placementId);
            expect(protection).to.be.ok();
            if (protection !== undefined) {
                expect(protection.tier).to.equal("Great");
                expect(protection.expiresAt >= before + REPAIR_PROTECTION_DURATIONS.Great).to.equal(true);
                expect(protection.expiresAt <= after + REPAIR_PROTECTION_DURATIONS.Great).to.equal(true);
            }

            const boost = modelInfo.boosts?.get(REPAIR_BOOST_KEY);
            expect(boost).to.be.ok();
            if (boost !== undefined) {
                expect(boost.dropRateMul).to.equal(REPAIR_BOOST_MULTIPLIERS.Great);
            }

            model.Destroy();
        });
    });
};
