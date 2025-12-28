import { afterEach, describe, expect, it } from "@rbxts/jest-globals";
import React from "@rbxts/react";
import { Root, createRoot } from "@rbxts/react-roblox";
import { ReplicatedStorage, RunService, StarterGui } from "@rbxts/services";
import InventoryWindow from "client/components/item/inventory/InventoryWindow";
import DocumentManager from "client/components/window/DocumentManager";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

type MountContext = {
    root: Root;
    screenGui: ScreenGui;
};

function waitUntil(condition: () => boolean, timeout = 5) {
    const start = os.clock();
    while (os.clock() - start < timeout) {
        if (condition()) {
            return true;
        }
        RunService.Heartbeat.Wait();
    }
    return condition();
}

function mountInventoryWindow(): MountContext {
    const screenGui = new Instance("ScreenGui");
    screenGui.Name = "Inventory";
    screenGui.ResetOnSpawn = false;
    screenGui.IgnoreGuiInset = true;
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;
    screenGui.Parent = StarterGui;

    const root = createRoot(screenGui);

    // Mock the document registration with proper setVisible callback
    let documentVisible = true;
    DocumentManager.INFO_PER_DOCUMENT.set("Inventory", {
        id: "Inventory",
        visible: documentVisible,
        setVisible: (visible: boolean) => {
            documentVisible = visible;
        },
        priority: 0,
    });

    root.render(React.createElement(InventoryWindow, {}));

    // Wait for component to mount
    for (let i = 0; i < 30; i++) {
        RunService.Heartbeat.Wait();
    }

    return { root, screenGui };
}

function cleanupMount(mount?: MountContext) {
    if (!mount) return;
    mount?.root.unmount();
    mount?.screenGui.Destroy();
    DocumentManager.INFO_PER_DOCUMENT.delete("Inventory");
}

let mount: MountContext | undefined;

afterEach(() => {
    cleanupMount(mount);
    mount = undefined;
    // Reset inventory state
    Packets.inventory.set(new Map<string, number>());
});

describe("InventoryWindow", () => {
    it("loads successfully", () => {
        mount = mountInventoryWindow();
        expect(mount?.screenGui).toBeDefined();
    });

    it("shows item in inventory UI when added to inventory packet", () => {
        mount = mountInventoryWindow();

        // Find a non-gear item to test with
        const testItem = Items.sortedItems.find((item) => !item.findTrait("Gear"));
        expect(testItem).toBeDefined();
        if (!testItem) return;

        // Initially inventory should be empty
        const initialInventory = Packets.inventory.get();
        expect(initialInventory.get(testItem.id)).toBeUndefined();

        // Add item to inventory
        const newInventory = new Map<string, number>();
        for (const [key, value] of initialInventory) {
            newInventory.set(key, value);
        }
        newInventory.set(testItem.id, 5);
        Packets.inventory.set(newInventory);

        // Wait for UI to update
        const uiUpdated = waitUntil(() => {
            const inventoryGui = mount!.screenGui;
            if (!inventoryGui) return false;

            // Look for the scrolling frame that contains inventory slots
            const scrollingFrame = inventoryGui.FindFirstChildWhichIsA("ScrollingFrame", true);
            if (!scrollingFrame) return false;

            // Check if there's a button for our item (inventory slots are TextButtons)
            const buttons = scrollingFrame.GetDescendants().filter((d) => d.IsA("TextButton"));
            for (const button of buttons) {
                // Check if the button has an amount label showing "5"
                const amountLabel = button.FindFirstChild("AmountLabel") as TextLabel | undefined;
                if (amountLabel && amountLabel.Text === "5") {
                    return true;
                }
            }
            return false;
        }, 3);

        expect(uiUpdated).toBe(true);
    });

    it("updates item quantity when inventory count changes", () => {
        mount = mountInventoryWindow();

        const testItem = Items.sortedItems.find((item) => !item.findTrait("Gear"));
        expect(testItem).toBeDefined();
        if (!testItem) return;

        // Add initial item
        const inventory1 = new Map<string, number>();
        inventory1.set(testItem.id, 3);
        Packets.inventory.set(inventory1);

        // Wait for initial UI update
        RunService.Heartbeat.Wait();
        RunService.Heartbeat.Wait();

        // Update quantity
        const inventory2 = new Map<string, number>();
        inventory2.set(testItem.id, 10);
        Packets.inventory.set(inventory2);

        // Wait for UI to update with new quantity
        const quantityUpdated = waitUntil(() => {
            const inventoryGui = mount!.screenGui;
            if (!inventoryGui) return false;

            const scrollingFrame = inventoryGui.FindFirstChildWhichIsA("ScrollingFrame", true);
            if (!scrollingFrame) return false;

            const buttons = scrollingFrame.GetDescendants().filter((d) => d.IsA("TextButton"));
            for (const button of buttons) {
                const amountLabel = button.FindFirstChild("AmountLabel") as TextLabel | undefined;
                if (amountLabel && amountLabel.Text === "10") {
                    return true;
                }
            }
            return false;
        }, 3);

        expect(quantityUpdated).toBe(true);
    });

    it("removes item from UI when quantity becomes zero", () => {
        mount = mountInventoryWindow();

        const testItem = Items.sortedItems.find((item) => !item.findTrait("Gear"));
        expect(testItem).toBeDefined();
        if (!testItem) return;

        // Add item first
        const inventory1 = new Map<string, number>();
        inventory1.set(testItem.id, 5);
        Packets.inventory.set(inventory1);

        // Wait for UI to show item
        RunService.Heartbeat.Wait();
        RunService.Heartbeat.Wait();

        // Remove item by setting quantity to 0
        const inventory2 = new Map<string, number>();
        inventory2.set(testItem.id, 0);
        Packets.inventory.set(inventory2);

        // Wait for UI to update
        const itemRemoved = waitUntil(() => {
            const inventoryGui = mount!.screenGui;
            if (!inventoryGui) return false;

            const scrollingFrame = inventoryGui.FindFirstChildWhichIsA("ScrollingFrame", true);
            if (!scrollingFrame) return false;

            // Item slot should not be visible when amount is 0
            const buttons = scrollingFrame.GetDescendants().filter((d) => d.IsA("TextButton"));
            for (const button of buttons) {
                const amountLabel = button.FindFirstChild("AmountLabel") as TextLabel | undefined;
                if (amountLabel && amountLabel.Text === "5") {
                    // Old value still present - item not removed yet
                    return false;
                }
            }
            return true;
        }, 3);

        expect(itemRemoved).toBe(true);
    });

    it("displays multiple items in inventory", () => {
        mount = mountInventoryWindow();

        // Get two different non-gear items
        const filteredItems = Items.sortedItems.filter((item) => !item.findTrait("Gear"));
        expect(filteredItems.size()).toBeGreaterThanOrEqual(2);

        const item1 = filteredItems[0];
        const item2 = filteredItems[1];

        // Add multiple items
        const inventory = new Map<string, number>();
        inventory.set(item1.id, 3);
        inventory.set(item2.id, 7);
        Packets.inventory.set(inventory);

        // Wait for UI to show both items
        const bothItemsVisible = waitUntil(() => {
            const inventoryGui = mount!.screenGui;
            if (!inventoryGui) return false;

            const scrollingFrame = inventoryGui.FindFirstChildWhichIsA("ScrollingFrame", true);
            if (!scrollingFrame) return false;

            const buttons = scrollingFrame.GetDescendants().filter((d) => d.IsA("TextButton"));
            let foundItem1 = false;
            let foundItem2 = false;

            for (const button of buttons) {
                const amountLabel = button.FindFirstChild("AmountLabel") as TextLabel | undefined;
                if (amountLabel) {
                    if (amountLabel.Text === "3") foundItem1 = true;
                    if (amountLabel.Text === "7") foundItem2 = true;
                }
            }

            return foundItem1 && foundItem2;
        }, 3);

        expect(bothItemsVisible).toBe(true);
    });
});
