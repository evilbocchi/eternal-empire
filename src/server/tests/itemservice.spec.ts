import { getAllInstanceInfo } from "@antivivi/vrldk";
import { beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { Server } from "shared/api/APIExpose";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import type { RepairProtectionState } from "shared/item/repair";
import { REPAIR_BOOST_KEY, REPAIR_BOOST_MULTIPLIERS, REPAIR_PROTECTION_DURATIONS } from "shared/item/repair";

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
        expect(Server.Item.getItemAmount("TheFirstDropper")).toBe(2);
    });

    it("creates unique item instances when giving unique items", () => {
        const uniqueInstances = Server.Data.empireData.items.uniqueInstances;
        expect(uniqueInstances.size()).toBe(0);

        Server.Item.giveItem("TheFirstDropperBooster", 1);

        expect(uniqueInstances.size()).toBe(1);
        for (const [, instance] of uniqueInstances) {
            expect(instance.baseItemId).toBe("TheFirstDropperBooster");
            expect(instance.pots.size() > 0).toBe(true);
        }
    });

    it("fires itemsBought when purchases succeed", () => {
        let fired = false;
        const connection = Server.Item.itemsBought.connect((player, items) => {
            expect(player).toBe(undefined);
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

        expect(success).toBe(true);
        expect(fired).toBe(true);
        expect(Server.Item.getItemAmount("BulkyDropper") > 0).toBe(true);
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

        expect(unplaced).toBeDefined();
        expect(unplaced?.size()).toBe(1);
        expect(Server.Item.getItemAmount("TheFirstDropper")).toBe(1);
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

        expect(Server.Item.getBrokenPlacedItems().has(placementId)).toBe(true);
        expect(modelInfo.broken).toBe(true);
        expect(modelInfo.boosts?.has(REPAIR_BOOST_KEY)).toBe(false);
        expect(items.repairProtection.has(placementId)).toBe(false);

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

        expect(success).toBe(true);
        expect(Server.Item.getBrokenPlacedItems().has(placementId)).toBe(false);
        expect(modelInfo.broken).toBe(false);

        const protection = items.repairProtection.get(placementId);
        expect(protection).toBeDefined();
        if (protection !== undefined) {
            expect(protection.tier).toBe("Great");
            expect(protection.expiresAt >= before + REPAIR_PROTECTION_DURATIONS.Great).toBe(true);
            expect(protection.expiresAt <= after + REPAIR_PROTECTION_DURATIONS.Great).toBe(true);
        }

        const boost = modelInfo.boosts?.get(REPAIR_BOOST_KEY);
        expect(boost).toBeDefined();
        if (boost !== undefined) {
            expect(boost.dropRateMul).toBe(REPAIR_BOOST_MULTIPLIERS.Great);
        }

        model.Destroy();
    });

    it("ensures all placed item models and their descendants are anchored", () => {
        const items = Server.Data.empireData.items;

        const placedItems: Array<[string, PlacedItem]> = [
            [
                "TestAnchored1",
                {
                    item: "TheFirstDropper",
                    posX: 0,
                    posY: 5,
                    posZ: 0,
                    rotX: 0,
                    rotY: 0,
                    rotZ: 0,
                    area: "BarrenIslands",
                },
            ],
            [
                "TestAnchored2",
                {
                    item: "BulkyDropper",
                    posX: 10,
                    posY: 5,
                    posZ: 10,
                    rotX: 0,
                    rotY: 90,
                    rotZ: 0,
                    area: "BarrenIslands",
                },
            ],
        ];

        for (const [placementId, placedItem] of placedItems) {
            items.worldPlaced.set(placementId, placedItem);
        }

        Server.Item.fullUpdatePlacedItemsModels();

        for (const [placementId] of placedItems) {
            const model = Server.Item.modelPerPlacementId.get(placementId);
            expect(model).toBeDefined();

            if (model !== undefined) {
                for (const descendant of model.GetDescendants()) {
                    if (descendant.IsA("BasePart")) {
                        expect(descendant.Anchored).toBe(true);
                    }
                }
            }
        }

        for (const [placementId] of placedItems) {
            items.worldPlaced.delete(placementId);
            const model = Server.Item.modelPerPlacementId.get(placementId);
            if (model !== undefined) {
                model.Destroy();
                Server.Item.modelPerPlacementId.delete(placementId);
            }
        }
    });
});
