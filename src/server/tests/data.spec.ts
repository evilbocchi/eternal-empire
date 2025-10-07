/// <reference types="@rbxts/testez/globals" />
import { OnoeNum } from "@antivivi/serikanum";
import { Janitor } from "@rbxts/janitor";
import { Server } from "shared/api/APIExpose";
import fixDuplicatedItemsData from "shared/data/loading/fixDuplicatedItemsData";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";
import type { RepairProtectionState } from "shared/item/repair";

export = function () {
    beforeAll(() => {
        eater.janitor = new Janitor();
        mockFlamework();
    });

    afterAll(() => {
        eater.janitor?.Destroy();
    });

    describe("loading", () => {
        it("loads data", () => {
            expect(Server.Data).to.be.ok();
            expect(Server.Data.empireData).to.be.ok();
            expect(Server.Data.empireId).to.be.ok();
        });

        it("has a shop", () => {
            const items = Server.Data.empireData.items;
            const amount = items.inventory.get("ClassLowerNegativeShop");
            let hasShop = amount !== undefined && amount > 0;
            if (!hasShop) {
                const placedItems = items.worldPlaced;
                for (const [_, placedItem] of placedItems)
                    if (placedItem.item === "ClassLowerNegativeShop") {
                        hasShop = true;
                        break;
                    }
            }
            expect(hasShop).to.be.equal(true);
        });
    });

    describe("duplication", () => {
        it("removes excess in inventory", () => {
            const duped = {
                inventory: new Map<string, number>([
                    ["ClassLowerNegativeShop", 1],
                    ["TheFirstDropper", 4],
                ]),
                bought: new Map<string, number>([["TheFirstDropper", 3]]),
                worldPlaced: new Map<string, PlacedItem>(),
                brokenPlacedItems: new Set<string>(),
                repairProtection: new Map<string, RepairProtectionState>(),
                nextId: 0,
                uniqueInstances: new Map<string, UniqueItemInstance>(),
            } as ItemsData;

            const unduped = {
                inventory: new Map<string, number>([
                    ["ClassLowerNegativeShop", 1],
                    ["TheFirstDropper", 2],
                ]),
                bought: new Map<string, number>([["TheFirstDropper", 2]]),
                worldPlaced: new Map<string, PlacedItem>(),
                brokenPlacedItems: new Set<string>(),
                repairProtection: new Map<string, RepairProtectionState>(),
                nextId: 0,
                uniqueInstances: new Map<string, UniqueItemInstance>(),
            } as ItemsData;

            fixDuplicatedItemsData(duped);
            fixDuplicatedItemsData(unduped);

            expect(duped.inventory.get("ClassLowerNegativeShop")).to.be.equal(1);
            expect(duped.inventory.get("TheFirstDropper")).to.be.equal(3);
            expect(unduped.inventory.get("ClassLowerNegativeShop")).to.be.equal(1);
            expect(unduped.inventory.get("TheFirstDropper")).to.be.equal(2);
        });

        it("removes excess in bought", () => {
            const duped = {
                inventory: new Map<string, number>([
                    ["ClassLowerNegativeShop", 1],
                    ["TheFirstDropper", 3],
                ]),
                bought: new Map<string, number>([["TheFirstDropper", 1]]),
                worldPlaced: new Map<string, PlacedItem>(),
                brokenPlacedItems: new Set<string>(),
                repairProtection: new Map<string, RepairProtectionState>(),
                nextId: 0,
                uniqueInstances: new Map<string, UniqueItemInstance>(),
            } as ItemsData;

            fixDuplicatedItemsData(duped);

            expect(duped.inventory.get("ClassLowerNegativeShop")).to.be.equal(1);
            expect(duped.inventory.get("TheFirstDropper")).to.be.equal(3);
            expect(duped.bought.get("TheFirstDropper")).to.be.equal(3);
        });
    });

    describe("items", () => {
        it("should buy a free item", () => {
            const itemId = "TheFirstDropper";
            Server.Item.setItemAmount(itemId, 0);
            Server.Item.setBoughtAmount(itemId, 0);
            expect(Server.Item.buyItem(undefined, itemId)).to.equal(true);
            expect(Server.Item.getItemAmount(itemId)).to.be.equal(1);
        });

        it("should buy a non-free item", () => {
            const itemId = "BulkyDropper";
            Server.Item.setItemAmount(itemId, 1);
            Server.Item.setBoughtAmount(itemId, 0);
            Server.Currency.set("Funds", new OnoeNum(1e6));
            expect(Server.Item.buyItem(undefined, itemId)).to.equal(true);
            expect(Server.Item.getItemAmount(itemId)).to.be.equal(2);
        });

        it("should not buy an item with insufficient funds", () => {
            const itemId = "BulkyDropper";
            Server.Item.setItemAmount(itemId, 1);
            Server.Item.setBoughtAmount(itemId, 0);
            Server.Currency.set("Funds", new OnoeNum(0));
            expect(Server.Item.buyItem(undefined, itemId)).to.equal(false);
            expect(Server.Item.getItemAmount(itemId)).to.be.equal(1);
        });
    });

    describe("unique items", () => {
        it("should create a unique item instance", () => {
            const itemId = "TheFirstDropperBooster";
            const uuid = Server.Item.createUniqueInstance(itemId);
            expect(uuid).to.be.ok();

            const instance = Server.Data.empireData.items.uniqueInstances.get(uuid!);
            expect(instance).to.be.ok();
            expect(instance!.baseItemId).to.equal(itemId);
            expect(instance!.pots.size() > 0).to.equal(true);
        });

        it("should validate pot values are within range", () => {
            const itemId = "TheFirstDropperBooster";
            const uuid = Server.Item.createUniqueInstance(itemId);
            const instance = Server.Data.empireData.items.uniqueInstances.get(uuid!);

            expect(instance).to.be.ok();

            // Check raw pot values are stored as 0-100 percentages
            for (const [potName, rawValue] of instance!.pots) {
                expect(rawValue >= 0).to.equal(true);
                expect(rawValue <= 100).to.equal(true);
            }
        });
    });
};
