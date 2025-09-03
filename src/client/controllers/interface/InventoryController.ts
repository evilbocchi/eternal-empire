//!native
//!optimize 2

/**
 * @fileoverview Client controller responsible for managing player inventory data.
 *
 * Handles:
 * - Tracking inventory items and unique instances
 * - Finding best unique item instances for items
 * - Coordinating with build controller for item placement
 * - Observing inventory state changes
 *
 * This controller focuses purely on data management and business logic.
 * UI rendering is handled by React components.
 *
 * @since 1.0.0
 */

import { Controller, OnStart } from "@flamework/core";
import BuildController from "client/controllers/gameplay/BuildController";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

const sortedItemsSize = Items.sortedItems.size();
const reverseSortedItems = new Array<Item>(sortedItemsSize);
for (let i = 0; i < sortedItemsSize; i++) {
    reverseSortedItems[i] = Items.sortedItems[sortedItemsSize - 1 - i];
}

/**
 * Controller responsible for managing player inventory data and business logic.
 *
 * Provides data access methods for React components and handles item placement logic.
 */
@Controller()
export default class InventoryController implements OnStart {
    /** List of items currently in the inventory. */
    readonly items = new Array<Item>();

    constructor(private buildController: BuildController) {}

    /**
     * Find the best unique item instance for a given base item ID based on its average pot.
     *
     * @param baseItemId The ID of the base item to find the best unique instance for.
     * @returns The best unique item instance UUID, or undefined if no instances found.
     */
    getBest(baseItemId: string) {
        // Find the best unique item instance for the given base item ID
        let bestUuid: string | undefined;
        let bestInstance: UniqueItemInstance | undefined;
        const uniqueInstances = Packets.uniqueInstances.get();
        if (uniqueInstances === undefined) {
            return undefined;
        }
        for (const [uuid, instance] of uniqueInstances) {
            if (instance.placed) continue; // Skip placed instances
            if (instance.baseItemId === baseItemId) {
                let thisPots = 0;
                for (const [_, potValue] of instance.pots) {
                    thisPots += potValue;
                }

                let otherPots = 0;
                if (bestInstance) {
                    for (const [_, potValue] of bestInstance.pots) {
                        otherPots += potValue;
                    }
                }

                if (thisPots > otherPots) {
                    bestInstance = instance;
                    bestUuid = uuid;
                }
            }
        }
        return bestUuid;
    }

    /**
     * Handle item activation for placement in the game world.
     * This method encapsulates the business logic for item placement.
     *
     * @param item The item to activate/place
     * @returns True if the item was successfully activated, false otherwise
     */
    activateItem(item: Item): boolean {
        const isPlaceable = item.placeableAreas.size() > 0 || item.bounds !== undefined;
        const level = Packets.level.get() ?? 0;

        // Check restrictions
        if (
            this.buildController.getRestricted() === true ||
            isPlaceable === false ||
            (item.levelReq !== undefined && item.levelReq > level)
        ) {
            playSound("Error.mp3");
            return false;
        }

        playSound("MenuClick.mp3");

        // Find best unique instance if applicable
        let bestUuid: string | undefined;
        if (Items.uniqueItems.has(item)) {
            bestUuid = this.getBest(item.id);
        }

        // Add placing model and select it
        this.buildController.mainSelect(this.buildController.addPlacingModel(item, bestUuid));

        return true;
    }

    /**
     * Refreshes the inventory items list based on current inventory state.
     * Updates the items array with current inventory data.
     * @param inventory The current inventory map (optional).
     * @param uniqueInstances The current unique item instances map (optional).
     */
    refreshInventoryItems(inventory = Packets.inventory.get(), uniqueInstances = Packets.uniqueInstances.get()) {
        const items = this.items;
        items.clear();
        const amounts = new Map<string, number>();

        // Count unique instances
        if (uniqueInstances !== undefined) {
            for (const [_, uniqueInstance] of uniqueInstances) {
                const itemId = uniqueInstance.baseItemId;
                if (itemId === undefined || uniqueInstance.placed) continue;

                const amount = amounts.get(itemId) ?? 0;
                amounts.set(itemId, amount + 1);
            }
        }

        // Build items list based on what's in inventory
        for (const item of reverseSortedItems) {
            if (item.isA("HarvestingTool")) continue;

            const itemId = item.id;
            let amount = inventory?.get(itemId) ?? 0;
            const uniques = amounts.get(itemId);
            if (uniques !== undefined) {
                amount += uniques;
            }

            const hasItem = amount > 0;
            if (hasItem) {
                items.push(item);
            }
        }
    }

    /**
     * Starts the InventoryController and observes inventory and unique item changes.
     */
    onStart() {
        Packets.inventory.observe((inventory) => {
            this.refreshInventoryItems(inventory);
        });
        Packets.uniqueInstances.observe((uniqueInstances) => {
            this.refreshInventoryItems(undefined, uniqueInstances);
        });
    }
}
