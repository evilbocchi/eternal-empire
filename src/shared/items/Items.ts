//!native
//!optimize 2
import Difficulty from "@rbxts/ejt";
import { Server } from "shared/api/APIExpose";
import { getAsset } from "shared/asset/AssetMap";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import type Charm from "shared/item/traits/Charm";

/**
 * Utility class to manage all items.
 */
abstract class Items {
    /**
     * Map of item ID to Item object.
     * If encountering circular dependency issues, use {@link ITEM_PER_ID} instead.
     */
    static readonly itemsPerId = (function () {
        const folder = script.Parent;
        if (folder === undefined) throw "No folder specified";

        const itemsPerId = new Map<string, Item>();
        for (const moduleScript of folder.GetDescendants()) {
            if (moduleScript.IsA("ModuleScript") && moduleScript !== script) {
                const i = require(moduleScript);
                if (i !== undefined) {
                    const item = i as Item;
                    itemsPerId.set(item.id, item);
                }
            }
        }
        return itemsPerId;
    })();

    /** Map of item name to Item object. */
    static readonly itemsPerName = (function () {
        const itemsPerName = new Map<string, Item>();
        for (const [_, item] of Items.itemsPerId) {
            itemsPerName.set(item.name, item);
        }
        return itemsPerName;
    })();

    /** Set of all charm traits */
    static readonly charms = (function () {
        const charms = new Set<Charm>();
        for (const [_, item] of Items.itemsPerId) {
            const charm = item.findTrait("Charm");
            if (charm !== undefined) {
                charms.add(charm);
            }
        }
        return charms;
    })();

    /** Set of all unique items */
    static readonly uniqueItems = (function () {
        const uniqueItems = new Set<Item>();
        for (const [_, item] of Items.itemsPerId) {
            if (item.isA("Unique")) {
                uniqueItems.add(item);
            }
        }
        return uniqueItems;
    })();

    /**
     * Ordered list of all items by:
     * 1. Difficulty rating
     * 2. Requirements (items that require others come after)
     * 3. Price (total value across all currencies)
     * 4. Layout order
     * 5. Name
     */
    static readonly sortedItems = (function () {
        const describePrice = (item: Item) => {
            const price = item.getPrice(1);
            if (price === undefined) {
                return "<none>";
            }

            const parts = new Array<string>();
            for (const [currency, amount] of price.amountPerCurrency) {
                parts.push(`${currency}=${amount.toString()}`);
            }
            if (parts.size() === 0) {
                return "<empty bundle>";
            }
            return parts.join(", ");
        };

        const describeRequirements = (item: Item) => {
            if (item.requiredItems.size() === 0) {
                return "<none>";
            }
            const parts = new Array<string>();
            for (const [reqId, count] of item.requiredItems) {
                parts.push(`${reqId}x${count}`);
            }
            return parts.join(", ");
        };

        const priceCurrencyOrder = new Array<Currency>();
        for (const [currency] of CurrencyBundle.SORTED_DETAILS) {
            priceCurrencyOrder.push(currency);
        }

        const comparePrices = (aPrice?: CurrencyBundle, bPrice?: CurrencyBundle) => {
            if (aPrice === undefined && bPrice === undefined) {
                return undefined;
            }
            if (aPrice === undefined) {
                return true;
            }
            if (bPrice === undefined) {
                return false;
            }

            for (const currency of priceCurrencyOrder) {
                const aAmount = aPrice.amountPerCurrency.get(currency);
                const bAmount = bPrice.amountPerCurrency.get(currency);

                if (aAmount !== undefined && bAmount !== undefined) {
                    if (aAmount.moreThan(bAmount)) {
                        return false;
                    }
                    if (bAmount.moreThan(aAmount)) {
                        return true;
                    }
                } else if (aAmount !== undefined) {
                    return false;
                } else if (bAmount !== undefined) {
                    return true;
                }
            }

            const aCount = aPrice.amountPerCurrency.size();
            const bCount = bPrice.amountPerCurrency.size();
            if (aCount !== bCount) {
                return aCount < bCount;
            }

            return undefined;
        };

        const itemsArray = new Array<Item>();
        for (const [, item] of Items.itemsPerId) {
            itemsArray.push(item);
        }

        // Comparison function for secondary sorting criteria
        const compareItems = (a: Item, b: Item): boolean => {
            if (a.difficulty.layoutRating !== undefined && b.difficulty.layoutRating !== undefined) {
                if (a.difficulty.layoutRating !== b.difficulty.layoutRating) {
                    return a.difficulty.layoutRating < b.difficulty.layoutRating;
                }
            }

            const aPrice = a.getPrice(1);
            const bPrice = b.getPrice(1);
            const priceResult = comparePrices(aPrice, bPrice);
            if (priceResult !== undefined) {
                return priceResult;
            }

            if (a.layoutOrder !== b.layoutOrder) {
                return a.layoutOrder < b.layoutOrder;
            }

            if (a.name !== b.name) {
                return a.name < b.name;
            }
            return a.id < b.id;
        };

        const stableSort = (array: Array<Item>, cmp: (a: Item, b: Item) => boolean) => {
            for (let i = 1; i < array.size(); i++) {
                const current = array[i];
                let j = i - 1;

                while (j >= 0 && cmp(current, array[j])) {
                    array[j + 1] = array[j];
                    j--;
                }

                array[j + 1] = current;
            }
        };

        // Initial sort by difficulty, price, layoutOrder, name, id
        stableSort(itemsArray, compareItems);

        // Build position map for current order
        const positionMap = new Map<string, number>();
        for (let i = 0; i < itemsArray.size(); i++) {
            positionMap.set(itemsArray[i].id, i);
        }

        // Check if item A depends on item B (directly or transitively)
        const dependsOn = (itemA: Item, itemB: Item, visited = new Set<string>()): boolean => {
            if (visited.has(itemA.id)) return false; // Prevent infinite loops
            visited.add(itemA.id);

            for (const [requiredId] of itemA.requiredItems) {
                if (requiredId === itemB.id) return true;
                const requiredItem = Items.itemsPerId.get(requiredId);
                if (requiredItem !== undefined && dependsOn(requiredItem, itemB, visited)) {
                    return true;
                }
            }
            return false;
        };

        // Iteratively fix dependency violations and sort violations
        let changed = true;
        let iterations = 0;
        const maxIterations = itemsArray.size() * itemsArray.size(); // Prevent infinite loops

        while (changed && iterations < maxIterations) {
            changed = false;
            iterations++;

            // Fix dependency violations
            for (let i = 0; i < itemsArray.size(); i++) {
                const item = itemsArray[i];

                // Find the latest position among all requirements
                let maxRequiredPos = -1;
                for (const [requiredId] of item.requiredItems) {
                    const requiredPos = positionMap.get(requiredId);
                    if (requiredPos !== undefined && requiredPos > maxRequiredPos) {
                        maxRequiredPos = requiredPos;
                    }
                }

                // If this item is before any of its requirements, move it after
                if (maxRequiredPos >= i) {
                    const movedItem = itemsArray.remove(i)!;
                    const insertPos = math.min(maxRequiredPos + 1, itemsArray.size());
                    itemsArray.insert(insertPos, movedItem);

                    // Rebuild position map
                    for (let j = 0; j < itemsArray.size(); j++) {
                        positionMap.set(itemsArray[j].id, j);
                    }

                    changed = true;
                    break;
                }
            }

            if (changed) continue;

            // Fix sort violations (bubble better items forward if dependencies allow)
            for (let i = 1; i < itemsArray.size(); i++) {
                const currentItem = itemsArray[i];
                const prevItem = itemsArray[i - 1];

                // If current item should come before previous item
                if (compareItems(currentItem, prevItem)) {
                    // Only block swaps when the current item depends on the previous item
                    if (!dependsOn(currentItem, prevItem)) {
                        // Safe to swap
                        itemsArray[i] = prevItem;
                        itemsArray[i - 1] = currentItem;

                        // Update position map
                        positionMap.set(prevItem.id, i);
                        positionMap.set(currentItem.id, i - 1);

                        changed = true;
                        break;
                    }
                }
            }
        }

        // Assign final layoutOrder
        for (let i = 0; i < itemsArray.size(); i++) {
            const item = itemsArray[i];
            item.layoutOrder = i;
        }

        return itemsArray;
    })();

    /** Total number of items. */
    static readonly length = Items.itemsPerId.size();

    /**
     * Retrieve the Item object at the specified ID.
     *
     * @param itemId The ID of the item.
     * @returns Item object or undefined if not found.
     */
    static getItem(itemId: string): Item | undefined {
        return this.itemsPerId.get(itemId);
    }

    /**
     * Set the Item object at the specified ID.
     *
     * @param itemId The ID of the item.
     * @param item The Item object.
     */
    static setItem(itemId: string, item: Item) {
        this.itemsPerId.set(itemId, item);
    }

    static {
        Difficulty.Excavation.setImage(Difficulty.Construct.image!);
        Difficulty.Miscellaneous.setImage(getAsset("assets/MiscellaneousDifficulty.png"));
        Difficulty.ReversedPeripherality.setVisualRating("-10^10");
        Server.Items = this;
    }
}

export = Items;
