import { describe, expect, it, jest } from "@rbxts/jest-globals";
import { Server } from "shared/api/APIExpose";
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
            const [placedItem] = Server.Item.serverPlace(placingId, new Vector3(), 0);

            if (placedItem === undefined) {
                warn(`Failed to place item with id ${itemId} for loading test.`);
                continue;
            }

            const model = Server.Item.modelPerPlacementId.get(placedItem.id);
            if (model === undefined) warn(`No model found for placed item with id ${itemId} in loading test.`);
            expect(model).toBeDefined();

            Server.Item.unplaceItemsInArea(undefined, undefined);
        }

        Server.empireData.level = 1;
    });
});
