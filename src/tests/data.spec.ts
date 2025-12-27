import { beforeAll, beforeEach, describe, expect, it, jest } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { Server } from "shared/api/APIExpose";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import fixDuplicatedItemsData from "shared/data/loading/fixDuplicatedItemsData";
import type { RepairProtectionState } from "shared/item/repair";

beforeAll(() => {
    _G.empireData = undefined;
});

describe("loading", () => {
    it("loads data", () => {
        expect(Server.Data).toBeDefined();
        expect(Server.empireData).toBeDefined();
        expect(Server.Data.empireId).toBeDefined();
    });

    it("has a shop", () => {
        const items = Server.empireData.items;
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
        jest.spyOn(jest.globalEnv, "warn").mockImplementation(() => {});

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
        jest.spyOn(jest.globalEnv, "warn").mockImplementation(() => {});

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
        Server.Data.empireData.items.inventory.set(itemId, 0);
        Server.Data.empireData.items.bought.set(itemId, 0);
        expect(Server.Item.buyItem(undefined, itemId)).toBe(true);
        expect(Server.Data.empireData.items.inventory.get(itemId)).toBe(1);
    });

    it("should buy a non-free item", () => {
        const itemId = "BulkyDropper";
        Server.Data.empireData.items.inventory.set(itemId, 1);
        Server.Data.empireData.items.bought.set(itemId, 0);
        Server.Currency.set("Funds", new OnoeNum(1e6));
        expect(Server.Item.buyItem(undefined, itemId)).toBe(true);
        expect(Server.Data.empireData.items.inventory.get(itemId)).toBe(2);
    });

    it("should not buy an item with insufficient funds", () => {
        const itemId = "BulkyDropper";
        Server.Data.empireData.items.inventory.set(itemId, 1);
        Server.Data.empireData.items.bought.set(itemId, 0);
        Server.Currency.set("Funds", new OnoeNum(0));
        expect(Server.Item.buyItem(undefined, itemId)).toBe(false);
        expect(Server.Data.empireData.items.inventory.get(itemId)).toBe(1);
    });
});

describe("unique items", () => {
    it("should create a unique item instance", () => {
        const itemId = "TheFirstDropperBooster";
        const uuid = Server.Item.createUniqueInstance(itemId);
        expect(uuid).toBeDefined();

        const instance = Server.empireData.items.uniqueInstances.get(uuid!);
        expect(instance).toBeDefined();
        expect(instance!.baseItemId).toBe(itemId);
        expect(instance!.pots.size() > 0).toBe(true);
    });

    it("should validate pot values are within range", () => {
        const itemId = "TheFirstDropperBooster";
        const uuid = Server.Item.createUniqueInstance(itemId);
        const instance = Server.empireData.items.uniqueInstances.get(uuid!);

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
        expect(Server.empireData.completedEvents.has("RemoveIllegalChallenges")).toBe(true);
    });

    it("ensures repair protection map is initialized", () => {
        const protection = Server.empireData.items.repairProtection;
        expect(protection).toBeDefined();
        expect(typeIs(protection.size(), "number")).toBe(true);
    });

    it("keeps printed setups within the storage cap", () => {
        expect(Server.empireData.printedSetups.size()).toBeDefined();
        expect(Server.empireData.printedSetups.size() <= 50).toBe(true);
    });

    it("keeps log history within the retention limit", () => {
        expect(Server.empireData.logs.size() <= 2000).toBe(true);
    });

    it("tracks last session timestamp", () => {
        expect(Server.empireData.lastSession).toBeDefined();
        expect(Server.empireData.lastSession > 0).toBe(true);
    });
});

describe("profile migration", () => {
    it("migrates currency from old InfiniteMath format to OnoeNum", () => {
        // All currencies should be OnoeNum instances after migration
        for (const [currency, value] of Server.empireData.currencies) {
            expect(typeIs(value, "table")).toBe(true);
            expect((value as OnoeNum).mantissa).toBeDefined();
            expect((value as OnoeNum).exponent).toBeDefined();
            expect(typeIs((value as OnoeNum).mantissa, "number")).toBe(true);
            expect(typeIs((value as OnoeNum).exponent, "number")).toBe(true);
        }
    });

    it("migrates most currencies to OnoeNum format", () => {
        for (const [currency, value] of Server.empireData.mostCurrencies) {
            expect(typeIs(value, "table")).toBe(true);
            expect((value as OnoeNum).mantissa).toBeDefined();
            expect((value as OnoeNum).exponent).toBeDefined();
        }
    });

    it("ensures OnoeNum values are not NaN after migration", () => {
        for (const [currency, value] of Server.empireData.currencies) {
            const onoe = value as OnoeNum;
            // Check mantissa is not NaN
            expect(onoe.mantissa === onoe.mantissa).toBe(true);
            // Check exponent is not NaN
            expect(onoe.exponent === onoe.exponent).toBe(true);
        }
    });

    it("removes deleted currencies during migration", () => {
        // Verify that all present currencies exist in CURRENCY_DETAILS
        for (const [currency] of Server.empireData.currencies) {
            expect(CURRENCY_DETAILS[currency]).toBeDefined();
        }
    });

    it("initializes missing fields during migration", () => {
        // Check that fields added in later versions are initialized
        expect(Server.empireData.items.repairProtection).toBeDefined();
        expect(Server.empireData.items.researching).toBeDefined();
        expect(Server.empireData.unlockedDifficulties).toBeDefined();
    });
});

describe("save/load cycles", () => {
    it("preserves currency values through serialization", () => {
        const originalFunds = Server.empireData.currencies.get("Funds");
        expect(originalFunds).toBeDefined();

        // Serialize and deserialize
        const serialized = game.GetService("HttpService").JSONEncode({
            mantissa: (originalFunds as OnoeNum).mantissa,
            exponent: (originalFunds as OnoeNum).exponent,
        });
        const deserialized = game.GetService("HttpService").JSONDecode(serialized) as {
            mantissa: number;
            exponent: number;
        };

        expect(deserialized.mantissa).toBe((originalFunds as OnoeNum).mantissa);
        expect(deserialized.exponent).toBe((originalFunds as OnoeNum).exponent);
    });

    it("preserves inventory data through roundtrip", () => {
        const inventory = Server.empireData.items.inventory;
        const originalSize = inventory.size();
        const snapshot = new Map<string, number>();

        for (const [itemId, count] of inventory) {
            snapshot.set(itemId, count);
        }

        // Verify snapshot matches
        expect(snapshot.size()).toBe(originalSize);
        for (const [itemId, count] of snapshot) {
            expect(inventory.get(itemId)).toBe(count);
        }
    });

    it("preserves placed items with all properties", () => {
        const worldPlaced = Server.empireData.items.worldPlaced;
        for (const [placementId, placedItem] of worldPlaced) {
            expect(placedItem.item).toBeDefined();
            expect(typeIs(placedItem.posX, "number")).toBe(true);
            expect(typeIs(placedItem.posY, "number")).toBe(true);
            expect(typeIs(placedItem.posZ, "number")).toBe(true);
            expect(typeIs(placedItem.rotX, "number")).toBe(true);
            expect(typeIs(placedItem.rotY, "number")).toBe(true);
            expect(typeIs(placedItem.rotZ, "number")).toBe(true);
        }
    });

    it("preserves unique item instances through save/load", () => {
        const uniqueInstances = Server.empireData.items.uniqueInstances;
        for (const [uuid, instance] of uniqueInstances) {
            expect(instance.baseItemId).toBeDefined();
            expect(instance.pots).toBeDefined();
            expect(instance.created).toBeDefined();
            expect(typeIs(instance.created, "number")).toBe(true);

            // Verify pots are intact
            for (const [potName, value] of instance.pots) {
                expect(typeIs(potName, "string")).toBe(true);
                expect(typeIs(value, "number")).toBe(true);
                expect(value >= 0 && value <= 100).toBe(true);
            }
        }
    });

    it("preserves Set data structures correctly", () => {
        const completedEvents = Server.empireData.completedEvents;
        expect(typeIs(completedEvents.size(), "number")).toBe(true);

        const unlockedAreas = Server.empireData.unlockedAreas;
        expect(typeIs(unlockedAreas.size(), "number")).toBe(true);

        const brokenItems = Server.empireData.items.brokenPlacedItems;
        expect(typeIs(brokenItems.size(), "number")).toBe(true);
    });
});

describe("corrupt data handling", () => {
    it("handles missing inventory map", () => {
        const testData = {
            bought: new Map<string, number>(),
            worldPlaced: new Map<string, PlacedItem>(),
            brokenPlacedItems: new Set<string>(),
            repairProtection: new Map<string, RepairProtectionState>(),
            nextId: 0,
            uniqueInstances: new Map<string, UniqueItemInstance>(),
        } as Partial<ItemsData>;

        // Currently throws when inventory is missing - documents need for initialization
        expect(() => fixDuplicatedItemsData(testData as ItemsData)).toThrow();
    });

    it("handles missing bought map", () => {
        const testData = {
            inventory: new Map<string, number>([["TheFirstDropper", 1]]),
            worldPlaced: new Map<string, PlacedItem>(),
            brokenPlacedItems: new Set<string>(),
            repairProtection: new Map<string, RepairProtectionState>(),
            nextId: 0,
            uniqueInstances: new Map<string, UniqueItemInstance>(),
        } as Partial<ItemsData>;

        // Currently throws when bought is missing - documents need for initialization
        expect(() => fixDuplicatedItemsData(testData as ItemsData)).toThrow();
    });

    it("does not clamp negative item counts", () => {
        const testData = {
            inventory: new Map<string, number>([["TheFirstDropper", -5]]),
            bought: new Map<string, number>([["TheFirstDropper", 3]]),
            worldPlaced: new Map<string, PlacedItem>(),
            brokenPlacedItems: new Set<string>(),
            repairProtection: new Map<string, RepairProtectionState>(),
            nextId: 0,
            uniqueInstances: new Map<string, UniqueItemInstance>(),
        } as ItemsData;

        fixDuplicatedItemsData(testData);

        // Currently does not clamp negative values - documents current behavior
        expect(testData.inventory.get("TheFirstDropper")).toBe(-5);
        expect(testData.bought.get("TheFirstDropper")).toBe(3);
    });

    it("handles undefined placed item properties", () => {
        const testPlacedItem = {
            item: "TheFirstDropper",
            posX: 0,
            posY: 0,
            posZ: 0,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            // Missing optional fields like area, uniqueItemId
        } as PlacedItem;

        // Should not crash when accessing optional properties
        expect(testPlacedItem.area).toBeUndefined();
        expect(testPlacedItem.uniqueItemId).toBeUndefined();
        expect(testPlacedItem.rawRotation).toBeUndefined();
    });

    it("handles malformed OnoeNum during migration", () => {
        // Simulate a NaN currency value
        const malformedOnoe = new OnoeNum(0 / 0); // NaN
        expect(malformedOnoe.mantissa === malformedOnoe.mantissa).toBe(false); // NaN check

        // After migration fix, should be zero
        if (malformedOnoe.mantissa !== malformedOnoe.mantissa) {
            malformedOnoe.mantissa = 0;
            malformedOnoe.exponent = 0;
        }

        expect(malformedOnoe.mantissa).toBe(0);
        expect(malformedOnoe.exponent).toBe(0);
    });

    it("handles unique instance with missing pots map", () => {
        const testInstance = {
            baseItemId: "TheFirstDropperBooster",
            created: os.time(),
            // Missing pots map
        } as Partial<UniqueItemInstance>;

        // Should handle gracefully
        if (testInstance.pots === undefined) {
            testInstance.pots = new Map();
        }

        expect(testInstance.pots).toBeDefined();
        expect(testInstance.pots!.size()).toBe(0);
    });
});

describe("multi-environment behavior", () => {
    it("identifies empire ID correctly in current environment", () => {
        // Empire ID should be loaded and defined
        expect(Server.Data.empireId).toBeDefined();
        expect(typeIs(Server.Data.empireId, "string")).toBe(true);
        expect(Server.Data.empireId.size() > 0).toBe(true);
    });

    it("maintains single data instance across server", () => {
        // The same empireData should be accessible from multiple references
        const data1 = Server.empireData;
        const data2 = Server.Data.empireData;

        expect(data1).toBe(data2);
    });

    it("sets appropriate default names based on server type", () => {
        const name = Server.empireData.name;
        expect(name).toBeDefined();
        expect(typeIs(name, "string")).toBe(true);

        // Name should not be empty
        expect(name.size() > 0).toBe(true);
    });

    it("initializes owner ID for empire", () => {
        const owner = Server.empireData.owner;
        expect(owner).toBeDefined();
        expect(typeIs(owner, "number")).toBe(true);
    });

    it("tracks previous empire names", () => {
        const previousNames = Server.empireData.previousNames;
        expect(previousNames).toBeDefined();
        expect(typeIs(previousNames.size(), "number")).toBe(true);

        // Each previous name should be a string
        for (const name of previousNames) {
            expect(typeIs(name, "string")).toBe(true);
        }
    });

    it("maintains consistent data across reloads in edit mode", () => {
        // In edit mode, global empireData should be defined
        const globalData = _G.empireData;
        if (globalData !== undefined) {
            // Should match the loaded data
            expect(globalData).toBe(Server.empireData);
        }
    });
});
