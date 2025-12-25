import { afterEach, describe, expect, it, jest } from "@rbxts/jest-globals";
import { Workspace } from "@rbxts/services";
import ShopManager from "client/components/item/shop/ShopManager";
import Shop from "shared/item/traits/Shop";
import Items from "shared/items/Items";

describe("ShopManager", () => {
    let testParts: Instance[] = [];

    afterEach(() => {
        // Cleanup test parts
        for (const part of testParts) {
            part.Destroy();
        }
        testParts = [];
        ShopManager.refreshShop();
    });

    it("should set CanQuery to true when shop is opened", () => {
        // Find a shop item
        const shopItem = Items.sortedItems.find((item) => item.findTrait("Shop") !== undefined);
        if (shopItem === undefined) {
            // Skip test if no shop items exist
            return;
        }

        const shop = shopItem.findTrait("Shop") as Shop;
        if (shop === undefined) {
            return;
        }

        // Create test guiPart
        const shopGuiPart = new Instance("Part");
        shopGuiPart.Name = "ShopGuiPart";
        shopGuiPart.Size = new Vector3(8, 6, 0.5);
        shopGuiPart.CFrame = new CFrame(0, 5, 5);
        shopGuiPart.Anchored = true;
        shopGuiPart.CanQuery = false;
        shopGuiPart.Parent = Workspace;
        testParts.push(shopGuiPart);

        // Verify initial state
        expect(shopGuiPart.CanQuery).toBe(false);

        jest.useFakeTimers();
        // Refresh shop to open it - this should call playOpenEffects
        ShopManager.refreshShop(shopGuiPart, shop);

        jest.advanceTimersByTime(400);

        // Verify CanQuery is now true
        expect(shopGuiPart.CanQuery).toBe(true);
        jest.useRealTimers();
    });

    it("should set CanQuery to false when shop is closed", () => {
        // Find a shop item
        const shopItem = Items.sortedItems.find((item) => item.findTrait("Shop") !== undefined);
        if (shopItem === undefined) {
            return;
        }

        const shop = shopItem.findTrait("Shop") as Shop;
        if (shop === undefined) {
            return;
        }

        // Create test guiPart
        const shopGuiPart = new Instance("Part");
        shopGuiPart.Name = "ShopGuiPart";
        shopGuiPart.Size = new Vector3(8, 6, 0.5);
        shopGuiPart.CFrame = new CFrame(0, 5, 5);
        shopGuiPart.Anchored = true;
        shopGuiPart.CanQuery = false;
        shopGuiPart.Parent = Workspace;
        testParts.push(shopGuiPart);

        // Open shop first
        jest.useFakeTimers();

        ShopManager.refreshShop(shopGuiPart, shop);
        jest.advanceTimersByTime(400);
        expect(shopGuiPart.CanQuery).toBe(true);

        // Now close shop by refreshing with undefined
        ShopManager.refreshShop();
        jest.advanceTimersByTime(400);

        // Verify CanQuery is now false
        expect(shopGuiPart.CanQuery).toBe(false);
        jest.useRealTimers();
    });

    it("should hide previous shop when opening a new one", () => {
        // Find a shop item
        const shopItem = Items.sortedItems.find((item) => item.findTrait("Shop") !== undefined);
        if (shopItem === undefined) {
            return;
        }

        const shop = shopItem.findTrait("Shop") as Shop;
        if (shop === undefined) {
            return;
        }

        // Create first shop guiPart
        const firstShopGuiPart = new Instance("Part");
        firstShopGuiPart.Name = "FirstShopGuiPart";
        firstShopGuiPart.Size = new Vector3(8, 6, 0.5);
        firstShopGuiPart.CFrame = new CFrame(0, 5, 5);
        firstShopGuiPart.Anchored = true;
        firstShopGuiPart.CanQuery = false;
        firstShopGuiPart.Parent = Workspace;
        testParts.push(firstShopGuiPart);

        // Create second shop guiPart
        const secondShopGuiPart = new Instance("Part");
        secondShopGuiPart.Name = "SecondShopGuiPart";
        secondShopGuiPart.Size = new Vector3(8, 6, 0.5);
        secondShopGuiPart.CFrame = new CFrame(10, 5, 5);
        secondShopGuiPart.Anchored = true;
        secondShopGuiPart.CanQuery = false;
        secondShopGuiPart.Parent = Workspace;
        testParts.push(secondShopGuiPart);

        // Open first shop
        jest.useFakeTimers();

        ShopManager.refreshShop(firstShopGuiPart, shop);
        jest.advanceTimersByTime(400);
        expect(firstShopGuiPart.CanQuery).toBe(true);

        // Open second shop
        ShopManager.refreshShop(secondShopGuiPart, shop);
        jest.advanceTimersByTime(400);

        // Verify first shop is closed and second is open
        expect(firstShopGuiPart.CanQuery).toBe(false);
        expect(secondShopGuiPart.CanQuery).toBe(true);
        jest.useRealTimers();
    });

    it("should use hideShopGuiPart to set CanQuery to false", () => {
        // Create test guiPart
        const shopGuiPart = new Instance("Part");
        shopGuiPart.Name = "ShopGuiPart";
        shopGuiPart.Size = new Vector3(8, 6, 0.5);
        shopGuiPart.CFrame = new CFrame(0, 5, 5);
        shopGuiPart.Anchored = true;
        shopGuiPart.CanQuery = true; // Start with true
        shopGuiPart.Parent = Workspace;
        testParts.push(shopGuiPart);

        // Verify initial state
        jest.useFakeTimers();
        expect(shopGuiPart.CanQuery).toBe(true);

        // Call hideShopGuiPart directly
        ShopManager.hideShopGuiPart(shopGuiPart);
        jest.advanceTimersByTime(400);

        // Verify CanQuery is now false
        expect(shopGuiPart.CanQuery).toBe(false);
        jest.useRealTimers();
    });
});
