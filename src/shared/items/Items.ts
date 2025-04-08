import Difficulty from "@antivivi/jjt-difficulties";
import Harvestable from "shared/Harvestable";
import Charm from "shared/item/traits/Charm";
import Item from "shared/item/Item";
import ItemUtils from "shared/item/ItemUtils";

/**
 * Utility class to manage all items.
 */
abstract class Items {
    static readonly itemsPerId = new Map<string, Item>();
    static readonly charms = new Set<Charm>();

    static readonly sortedItems = (function () {
        const folder = script.Parent;
        if (folder === undefined)
            throw "No folder specified";

        const itemsPerId = Items.itemsPerId;
        const regItem = (item: Item) => {
            const shop = item.findTrait("Shop");
            if (shop !== undefined) {
                for (const i of shop.items) {
                    sortMap.get(i.difficulty!)?.push(i);
                }
            }

            const charm = item.findTrait("Charm");
            if (charm !== undefined) {
                Items.charms.add(charm);
            }
            itemsPerId.set(item.id, item);
        };
        for (const [i, harvestable] of pairs(Harvestable)) {
            if (harvestable.description === undefined)
                continue;
            const id = i as string;
            const item = new Item(id).setName(harvestable.name ?? id).setDescription(harvestable.description).setDifficulty(Difficulty.Excavation);
            regItem(item);
        }
        ItemUtils.itemsPerId = itemsPerId;

        const toSort = new Array<{ diff: Difficulty, items: Array<Item>; }>();
        const sortMap = new Map<Difficulty, Array<Item>>();
        for (const [_, diff] of Difficulty.DIFFICULTIES) {
            const array = new Array<Item>();
            toSort.push({ diff: diff, items: array });
            sortMap.set(diff, array);
        }
        for (const moduleScript of folder.GetDescendants()) {
            if (moduleScript.IsA("ModuleScript") && moduleScript !== script) {
                const i = require(moduleScript);
                if (i !== undefined) {
                    const item = i as Item;
                    regItem(item);
                }
            }
        }
        for (const [_, item] of itemsPerId) {
            const array = sortMap.get(item.difficulty);
            if (array !== undefined && !array.includes(item)) {
                array.push(item);
            }
        }

        const sorted = toSort.sort((a, b) => a.diff.rating! < b.diff.rating!);
        let i = 0;
        for (const obj of sorted) {
            for (const item of obj.items) {
                if (item.layoutOrder === -100000)
                    item.layoutOrder = ++i;
            }
        }
        const sortedItems = new Array<Item>();
        for (const [_, item] of itemsPerId) {
            sortedItems.push(item);
        }
        sortedItems.sort((a, b) => a.layoutOrder < b.layoutOrder);
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