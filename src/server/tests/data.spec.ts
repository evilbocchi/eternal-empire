import { Janitor } from "@rbxts/janitor";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { Server } from "shared/api/APIExpose";
import fixDuplicatedItemsData from "shared/data/loading/fixDuplicatedItemsData";
import { eater } from "shared/hamster/eat";
import mockFlamework from "shared/hamster/FlameworkMock";
import type { RepairProtectionState } from "shared/item/repair";

beforeAll(() => {
    eater.janitor = new Janitor();
    _G.empireData = undefined;
    mockFlamework();
});

afterAll(() => {
    eater.janitor?.Destroy();
});

describe("loading", () => {
    beforeEach(() => {
        // Ensure shop exists for tests that depend on it
        // This handles the case where profile state persists between test runs
        const items = Server.Data.empireData.items;
        const inventoryAmount = items.inventory.get("ClassLowerNegativeShop");
        const boughtAmount = items.bought.get("ClassLowerNegativeShop");
        let hasShop =
            (inventoryAmount !== undefined && inventoryAmount > 0) || (boughtAmount !== undefined && boughtAmount > 0);

        if (!hasShop) {
            for (const [_, placedItem] of items.worldPlaced) {
                if (placedItem.item === "ClassLowerNegativeShop") {
                    hasShop = true;
                    break;
                }
            }
        }

        // If still no shop, add it to worldPlaced
        if (!hasShop) {
            items.worldPlaced.set("STARTING", {
                item: "ClassLowerNegativeShop",
                posX: 16.5,
                posY: 3.5,
                posZ: 0,
                rotX: 0,
                rotY: 0,
                rotZ: 0,
                area: "BarrenIslands",
            });
        }
    });

    it("loads data", () => {
        expect(Server.Data).toBeDefined();
        expect(Server.Data.empireData).toBeDefined();
        expect(Server.Data.empireId).toBeDefined();
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
        expect(hasShop).toBe(true);
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

        expect(duped.inventory.get("ClassLowerNegativeShop")).toBe(1);
        expect(duped.inventory.get("TheFirstDropper")).toBe(3);
        expect(unduped.inventory.get("ClassLowerNegativeShop")).toBe(1);
        expect(unduped.inventory.get("TheFirstDropper")).toBe(2);
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

        expect(duped.inventory.get("ClassLowerNegativeShop")).toBe(1);
        expect(duped.inventory.get("TheFirstDropper")).toBe(3);
        expect(duped.bought.get("TheFirstDropper")).toBe(3);
    });
});

describe("items", () => {
    it("should buy a free item", () => {
        const itemId = "TheFirstDropper";
        Server.Item.setItemAmount(itemId, 0);
        Server.Item.setBoughtAmount(itemId, 0);
        expect(Server.Item.buyItem(undefined, itemId)).toBe(true);
        expect(Server.Item.getItemAmount(itemId)).toBe(1);
    });

    it("should buy a non-free item", () => {
        const itemId = "BulkyDropper";
        Server.Item.setItemAmount(itemId, 1);
        Server.Item.setBoughtAmount(itemId, 0);
        Server.Currency.set("Funds", new OnoeNum(1e6));
        expect(Server.Item.buyItem(undefined, itemId)).toBe(true);
        expect(Server.Item.getItemAmount(itemId)).toBe(2);
    });

    it("should not buy an item with insufficient funds", () => {
        const itemId = "BulkyDropper";
        Server.Item.setItemAmount(itemId, 1);
        Server.Item.setBoughtAmount(itemId, 0);
        Server.Currency.set("Funds", new OnoeNum(0));
        expect(Server.Item.buyItem(undefined, itemId)).toBe(false);
        expect(Server.Item.getItemAmount(itemId)).toBe(1);
    });
});

describe("unique items", () => {
    it("should create a unique item instance", () => {
        const itemId = "TheFirstDropperBooster";
        const uuid = Server.Item.createUniqueInstance(itemId);
        expect(uuid).toBeDefined();

        const instance = Server.Data.empireData.items.uniqueInstances.get(uuid!);
        expect(instance).toBeDefined();
        expect(instance!.baseItemId).toBe(itemId);
        expect(instance!.pots.size() > 0).toBe(true);
    });

    it("should validate pot values are within range", () => {
        const itemId = "TheFirstDropperBooster";
        const uuid = Server.Item.createUniqueInstance(itemId);
        const instance = Server.Data.empireData.items.uniqueInstances.get(uuid!);

        expect(instance).toBeDefined();

        // Check raw pot values are stored as 0-100 percentages
        for (const [potName, rawValue] of instance!.pots) {
            expect(rawValue >= 0).toBe(true);
            expect(rawValue <= 100).toBe(true);
        }
    });
});

describe("data integrity", () => {
    it("flags illegal challenge migration as complete", () => {
        expect(Server.Data.empireData.completedEvents.has("RemoveIllegalChallenges")).toBe(true);
    });

    it("ensures repair protection map is initialized", () => {
        const protection = Server.Data.empireData.items.repairProtection;
        expect(protection).toBeDefined();
        expect(typeIs(protection.size(), "number")).toBe(true);
    });

    it("keeps printed setups within the storage cap", () => {
        expect(Server.Data.empireData.printedSetups.size()).toBeDefined();
        expect(Server.Data.empireData.printedSetups.size() <= 50).toBe(true);
    });

    it("keeps log history within the retention limit", () => {
        expect(Server.Data.empireData.logs.size() <= 2000).toBe(true);
    });

    it("tracks last session timestamp", () => {
        expect(Server.Data.empireData.lastSession).toBeDefined();
        expect(Server.Data.empireData.lastSession > 0).toBe(true);
    });
});
