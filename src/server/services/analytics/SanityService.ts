/**
 * @fileoverview Validates game content for logical consistency.
 *
 * This service provides:
 * - Checks for item and harvestable configuration issues
 * - Warns about missing models, PrimaryParts, and inconsistent reset layers
 * - Ensures harvestables have enough craftable uses
 *
 * @since 1.0.0
 */

import Difficulty from "@antivivi/jjt-difficulties";
import { OnStart, Service } from "@flamework/core";
import Harvestable from "shared/world/Harvestable";
import Item from "shared/item/Item";
import Items from "shared/items/Items";

/**
 * Ensures that game content is logical and consistent.
 */
@Service()
export default class SanityService implements OnStart {
    /**
     * Checks an item for common configuration mistakes.
     * Warns if the item is a crafting item with a low reset layer,
     * if required items have mismatched reset layers, or if the model is missing.
     *
     * @param item The item to check.
     */
    checkItem(item: Item) {
        // Check if the item is a shop with crafting items
        const shop = item.findTrait("Shop");
        if (shop !== undefined) {
            let isCrafting = false;
            for (const item of shop.items) {
                if (item.difficulty === Difficulty.Miscellaneous) {
                    isCrafting = true;
                    break;
                }
            }

            // Warn if crafting items have a reset layer < 100
            if (isCrafting) {
                for (const item of shop.items) {
                    const resetLayer = item.getResetLayer();
                    if (resetLayer < 100) {
                        warn(
                            `Item ${item.name} (${item.id}) has a reset layer of ${resetLayer}. This is likely a mistake as this is a crafting item and should persist.`,
                        );
                    }
                }
            }
        }

        // Check for mismatched reset layers between item and its requirements
        const a = item.getResetLayer();
        for (const [requiredItem, _] of item.requiredItems) {
            const b = requiredItem.getResetLayer();
            if (a !== b && a < 100 && b < 100) {
                warn(
                    `Item ${item.name} (${item.id}) has a required item ${requiredItem.name} (${requiredItem.id}) with a different reset layer (${a} vs ${b}). This is likely a mistake.`,
                );
            }
        }

        // Check for missing model or PrimaryPart
        const model = item.MODEL;
        if (model === undefined) {
            warn(`Item ${item.name} (${item.id}) has no model. This is likely a mistake.`);
            return;
        }

        if (model.PrimaryPart === undefined) {
            warn(`Item ${item.name} (${item.id}) has no PrimaryPart set. This is likely a mistake.`);
            return;
        }
    }

    /**
     * Checks a harvestable for craftable uses and warns if too few.
     *
     * @param harvestableId The harvestable's ID.
     */
    checkHarvestable(harvestableId: string) {
        const harvestable = Harvestable[harvestableId];
        if (harvestable === undefined) {
            return;
        }

        const item = Items.getItem(harvestableId);

        if (item === undefined) {
            return;
        }

        // Count how many items can be crafted using this harvestable
        let craftables = 0;
        for (const [_, craftable] of Items.itemsPerId) {
            if (craftable.requiredItems.has(item)) {
                craftables += 1;
            }
        }
        if (craftables < 5) {
            warn(
                `Harvestable ${harvestable.name} (${harvestableId}) only has ${craftables} craftables (<5), consider adding more.`,
            );
        }
    }

    /**
     * Runs all sanity checks on items and harvestables at startup.
     */
    onStart() {
        // Check all items for configuration issues
        for (const [_, item] of Items.itemsPerId) {
            this.checkItem(item);
        }

        // Check all harvestables for craftable uses
        for (const [id] of pairs(Harvestable)) {
            this.checkHarvestable(id as string);
        }
    }
}
