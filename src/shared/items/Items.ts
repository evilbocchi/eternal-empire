import Difficulty from "@antivivi/jjt-difficulties";
import Item from "shared/item/Item";
import type Charm from "shared/item/traits/Charm";
import HARVESTABLES from "shared/world/harvestable/Harvestable";

/**
 * Utility class to manage all items.
 */
abstract class Items {
    /** Map of item ID to Item object */
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
        for (const [i, harvestable] of pairs(HARVESTABLES)) {
            if (harvestable.description === undefined) continue;
            const id = i as string;
            const item = new Item(id)
                .setName(harvestable.name ?? id)
                .setDescription(harvestable.description)
                .setDifficulty(Difficulty.Excavation);
            itemsPerId.set(id, item);
        }
        return itemsPerId;
    })();

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
     * 2. Index in the shop they appear in
     * 3. Layout order
     * 4. Name
     */
    static readonly sortedItems = (function () {
        const indexesInShop = new Map<Item, number>();
        for (const [_, item] of Items.itemsPerId) {
            const shop = item.findTrait("Shop");
            if (shop !== undefined) {
                for (let i = 0; i < shop.items.size(); i++) {
                    indexesInShop.set(shop.items[i], i);
                }
            }
        }

        let sortedItems = new Array<Item>(Items.itemsPerId.size());
        for (const [_, item] of Items.itemsPerId) {
            sortedItems.push(item);
        }
        sortedItems = sortedItems.sort((a, b) => {
            if (a.difficulty.rating !== undefined && b.difficulty.rating !== undefined) {
                if (a.difficulty.rating !== b.difficulty.rating) {
                    return a.difficulty.rating < b.difficulty.rating!;
                }
            }
            const aIndex = indexesInShop.get(a);
            const bIndex = indexesInShop.get(b);
            if (aIndex !== undefined && bIndex !== undefined) {
                if (aIndex !== bIndex) {
                    return aIndex < bIndex;
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
        return sortedItems;
    })();

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
}

export = Items;
