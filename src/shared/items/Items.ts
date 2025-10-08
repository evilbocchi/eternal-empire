import Difficulty from "@rbxts/ejt";
import { ITEM_PER_ID } from "shared/api/APIExpose";
import { getAsset } from "shared/asset/AssetMap";
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
        for (const [id, item] of itemsPerId) {
            ITEM_PER_ID.set(id, item); // Also set in the global map
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
        const sortedItems = new Array<Item>(Items.itemsPerId.size());
        for (const [, item] of Items.itemsPerId) {
            sortedItems.push(item);
        }
        table.sort(sortedItems, (a, b) => {
            if (a.difficulty.layoutRating !== undefined && b.difficulty.layoutRating !== undefined) {
                if (a.difficulty.layoutRating !== b.difficulty.layoutRating) {
                    return a.difficulty.layoutRating < b.difficulty.layoutRating!;
                }
            }

            const aRequiresB = a.requiredItems.has(b.id);
            const bRequiresA = b.requiredItems.has(a.id);
            if (bRequiresA && !aRequiresB) {
                return true; // a is required for b, so a comes first
            }
            if (aRequiresB && !bRequiresA) {
                return false; // b is required for a, so b comes first
            }

            const aPrice = a.getPrice(1);
            const bPrice = b.getPrice(1);
            if (aPrice !== undefined && bPrice !== undefined) {
                let aWins = 0;
                let bWins = 0;
                for (const [currency, amount] of aPrice.amountPerCurrency) {
                    const bAmount = bPrice.amountPerCurrency.get(currency);
                    if (bAmount === undefined) continue;
                    if (amount.moreThan(bAmount)) {
                        aWins++;
                    } else if (bAmount.moreThan(amount)) {
                        bWins++;
                    }
                }
                if (aWins !== bWins) {
                    return aWins < bWins;
                }
            }

            if (a.layoutOrder !== b.layoutOrder) {
                return a.layoutOrder < b.layoutOrder;
            }

            if (a.name !== b.name) {
                return a.name < b.name;
            }
            return a.id < b.id; // Fallback to ID comparison
        });

        for (let i = 0; i < sortedItems.size(); i++) {
            const item = sortedItems[i];
            item.layoutOrder = i;
            print(item.name, item.layoutOrder);
        }

        return sortedItems;
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
    }
}

export = Items;
