import { describe, expect, it, jest } from "@rbxts/jest-globals";
import { OnoeNum } from "@rbxts/serikanum";
import { Server } from "shared/api/APIExpose";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Items from "shared/items/Items";
import ItemPlacement from "shared/placement/ItemPlacement";

describe("items", () => {
    it("initializes all items", () => {
        for (const item of Items.sortedItems) {
            expect(item).toBeDefined();
            item.init();
        }
    });

    it("loads all items", () => {
        Server.empireData.level = math.huge;
        jest.spyOn(ItemPlacement, "isTouchingPlacedItem").mockReturnValue(false);

        const suppressedPatterns = ["InstantiationDelimiter"];
        const originalWarn = jest.globalEnv.warn as unknown as (...args: unknown[]) => void;
        jest.spyOn(jest.globalEnv, "warn").mockImplementation((...args: unknown[]) => {
            const message = tostring(args[0]);
            const shouldSuppress = suppressedPatterns.some((pattern) => message.find(pattern)[0] !== undefined);
            if (!shouldSuppress) {
                originalWarn(...args);
            }
        });

        for (const [itemId, item] of Items.itemsPerId) {
            if (item.MODEL === undefined) continue;

            const uuids = Server.Item.giveItem(item, 1);

            let placingId = uuids === undefined ? itemId : uuids[0];
            const response = Server.Item.serverPlace(placingId, new Vector3(), 0);

            if (response.placedItem === undefined) {
                warn(`Failed to place item with id ${itemId} for loading test.`);
                continue;
            }

            const model = Server.Item.modelPerPlacementId.get(response.placedItem.id);
            if (model === undefined) warn(`No model found for placed item with id ${itemId} in loading test.`);
            expect(model).toBeDefined();

            Server.Item.unplaceItemsInArea(undefined, undefined);
        }

        Server.empireData.level = 1;
    });

    describe("research restrictions", () => {
        it("getAvailableAmount subtracts researching count from inventory", () => {
            // Find a non-unique, non-gear item
            const testItem = Items.sortedItems.find((item) => !item.isA("Unique") && !item.isA("Gear"));
            if (testItem === undefined) {
                throw "No suitable test item found";
            }

            // Set up initial inventory
            Server.empireData.items.inventory.set(testItem.id, 10);
            Server.empireData.items.researching.clear();

            // Verify initial available amount
            expect(Server.Item.getAvailableAmount(testItem)).toBe(10);

            // Reserve 4 items for research
            Server.empireData.items.researching.set(testItem.id, 4);

            // Available amount should be reduced
            expect(Server.Item.getAvailableAmount(testItem)).toBe(6);

            // Clean up
            Server.empireData.items.inventory.delete(testItem.id);
            Server.empireData.items.researching.clear();
        });

        it("items being researched cannot be placed", () => {
            Server.empireData.level = math.huge;
            jest.spyOn(ItemPlacement, "isTouchingPlacedItem").mockReturnValue(false);

            // Find a placeable item with a model
            const testItem = Items.sortedItems.find(
                (item) => !item.isA("Unique") && !item.isA("Gear") && item.MODEL !== undefined,
            );
            if (testItem === undefined) {
                throw "No suitable placeable test item found";
            }

            // Give the player 5 items
            Server.empireData.items.inventory.set(testItem.id, 5);
            Server.empireData.items.researching.clear();

            // Place one item successfully
            const response1 = Server.Item.serverPlace(testItem.id, new Vector3(0, 0, 0), 0);
            expect(response1).toBeSuccessful();

            // Reserve 4 items for research (leaving 0 available since 1 is placed)
            Server.empireData.items.researching.set(testItem.id, 4);

            // Should not be able to place another item
            jest.spyOn(jest.globalEnv, "warn").mockImplementation(() => {}); // Suppress expected warning
            const response2 = Server.Item.serverPlace(testItem.id, new Vector3(5, 0, 0), 0);
            expect(response2).never.toBeSuccessful();

            // Clean up
            Server.Item.unplaceItemsInArea(undefined, undefined);
            Server.empireData.items.inventory.delete(testItem.id);
            Server.empireData.items.researching.clear();
            Server.empireData.level = 1;
        });

        it("items being researched cannot be used as purchase requirements", () => {
            // Find an item with required items for purchase
            const itemWithRequirements = Items.sortedItems.find(
                (item) => !item.isA("Unique") && item.requiredItems.size() > 0,
            );
            if (itemWithRequirements === undefined) {
                throw "No item with requirements found";
            }

            let requiredItemId: string = "";
            let requiredAmount = 0;
            for (const [id, amount] of itemWithRequirements.requiredItems) {
                requiredItemId = id;
                requiredAmount = amount;
                break;
            }
            const requiredItem = Items.getItem(requiredItemId);
            if (requiredItem === undefined || requiredItem.isA("Unique")) {
                throw "Required item not found or is unique";
            }

            // Set up: give enough currency and required items
            Server.empireData.level = math.huge;
            // Set all currencies to huge amounts
            for (const [currency] of pairs(CURRENCY_DETAILS)) {
                Server.empireData.currencies.set(currency, new OnoeNum(1e100));
            }

            Server.empireData.items.inventory.set(requiredItem.id, requiredAmount);
            Server.empireData.items.researching.clear();

            // Should be able to buy when items are available
            expect(Server.Item.serverBuy(itemWithRequirements)).toBeSuccessful();

            // Reserve all required items for research
            Server.empireData.items.inventory.set(requiredItem.id, requiredAmount);
            Server.empireData.items.researching.set(requiredItem.id, requiredAmount);

            // Should not be able to buy when required items are being researched
            expect(Server.Item.serverBuy(itemWithRequirements)).never.toBeSuccessful();

            // Clean up
            for (const [currency] of Server.Currency.balance.amountPerCurrency) {
                Server.empireData.currencies.set(currency, new OnoeNum(0));
            }
            Server.empireData.items.inventory.delete(requiredItem.id);
            Server.empireData.items.researching.clear();
            Server.empireData.level = 1;
        });

        it("releasing items from research makes them available again", () => {
            const testItem = Items.sortedItems.find((item) => !item.isA("Unique") && !item.isA("Gear"));
            if (testItem === undefined) {
                throw "No suitable test item found";
            }

            // Set up initial inventory
            Server.empireData.items.inventory.set(testItem.id, 10);
            Server.empireData.items.researching.set(testItem.id, 7);

            // Available should be 3
            expect(Server.Item.getAvailableAmount(testItem)).toBe(3);

            // Release 5 items from research
            const success = Server.Research.releaseItemsFromResearch([[testItem.id, 5]]);
            expect(success).toBe(true);

            // Available should now be 8 (10 - 2 researching)
            expect(Server.Item.getAvailableAmount(testItem)).toBe(8);
            expect(Server.empireData.items.researching.get(testItem.id)).toBe(2);

            // Clean up
            Server.empireData.items.inventory.delete(testItem.id);
            Server.empireData.items.researching.clear();
        });

        it("reserving items for research reduces available amount", () => {
            const testItem = Items.sortedItems.find(
                (item) =>
                    !item.isA("Unique") &&
                    !item.isA("Gear") &&
                    item.difficulty.id !== "Bonuses" &&
                    item.difficulty.id !== "Excavation",
            );
            if (testItem === undefined) {
                throw "No suitable test item found";
            }

            // Set up initial inventory with 10 items
            Server.empireData.items.inventory.set(testItem.id, 10);
            Server.empireData.items.researching.clear();

            expect(Server.Item.getAvailableAmount(testItem)).toBe(10);

            // Reserve 6 items for research
            const success = Server.Research.reserveItemsForResearch([[testItem.id, 6]]);
            expect(success).toBe(true);

            // Available should now be 4
            expect(Server.Item.getAvailableAmount(testItem)).toBe(4);
            expect(Server.empireData.items.researching.get(testItem.id)).toBe(6);

            // Clean up
            Server.empireData.items.inventory.delete(testItem.id);
            Server.empireData.items.researching.clear();
        });

        it("cannot reserve more items than available", () => {
            const testItem = Items.sortedItems.find(
                (item) =>
                    !item.isA("Unique") &&
                    !item.isA("Gear") &&
                    item.difficulty.id !== "Bonuses" &&
                    item.difficulty.id !== "Excavation",
            );
            if (testItem === undefined) {
                throw "No suitable test item found";
            }

            // Set up inventory with only 5 items
            Server.empireData.items.inventory.set(testItem.id, 5);
            Server.empireData.items.researching.clear();

            // Try to reserve 10 items (should only reserve the 5 available)
            const success = Server.Research.reserveItemsForResearch([[testItem.id, 10]]);
            expect(success).toBe(true);

            // Should have reserved only 5
            expect(Server.empireData.items.researching.get(testItem.id)).toBe(5);
            expect(Server.Item.getAvailableAmount(testItem)).toBe(0);

            // Clean up
            Server.empireData.items.inventory.delete(testItem.id);
            Server.empireData.items.researching.clear();
        });
    });
});
