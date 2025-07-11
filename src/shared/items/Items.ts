import Difficulty from "@antivivi/jjt-difficulties";
import Harvestable from "shared/Harvestable";
import Charm from "shared/item/Charm";
import Item from "shared/item/Item";
import ItemUtils from "shared/utils/ItemUtils";

class Items {
    static readonly itemsPerId = new Map<string, Item>;
    static readonly charms = new Set<Charm>;

    static {
        const folder = script.Parent;
        if (folder === undefined)
            throw "No folder specified";

        const itemsPerId = this.itemsPerId;
        const regItem = (item: Item) => {
            if (item.isA("Shop")) {
                for (const i of item.items) {
                    sortMap.get(i.difficulty!)?.push(i);
                }
            }
            if (item.isA("Charm")) {
                this.charms.add(item);
            }
            itemsPerId.set(item.id, item);
        }
        for (const [i, harvestable] of pairs(Harvestable)) {
            if (harvestable.description === undefined)
                continue;
            const id = i as string;
            const item = new Item(id).setName(harvestable.name ?? id).setDescription(harvestable.description).setDifficulty(Difficulty.Excavation);
            regItem(item);
        }
        ItemUtils.itemsPerId = itemsPerId;

        const toSort = new Array<{diff: Difficulty, items: Array<Item>}>();
        const sortMap = new Map<Difficulty, Array<Item>>();
        for (const [_, diff] of Difficulty.DIFFICULTIES) {
            const array = new Array<Item>();
            toSort.push({diff: diff, items: array});
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
        for (const [i, item] of itemsPerId) {
            if (item.difficulty === undefined) {
                item.layoutOrder = -100000;
                continue;
            }
            const array = sortMap.get(item.difficulty);
            if (array !== undefined && !array.includes(item)) {
                array.push(item);
            }
        }

        const sorted = toSort.sort((a, b) => a.diff.rating! < b.diff.rating!);
        let i = 0;
        for (const obj of sorted) {
            for (const item of obj.items) {
                item.layoutOrder = ++i;
            }
        }
    }

    /**
     * Get the Item object from its Id.
     * 
     * @param itemId Item Id
     * @returns Item
     */
    static getItem(itemId: string): Item | undefined {
        return this.itemsPerId.get(itemId);
    }

    static setItem(itemId: string, item: Item) {
        this.itemsPerId.set(itemId, item);
    }
}

export = Items;