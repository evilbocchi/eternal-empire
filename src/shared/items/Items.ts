import Item from "shared/item/Item";

class Items {
    static itemsPerId: Map<string, Item> | undefined = undefined;

    static init() {
        if (this.itemsPerId === undefined) {
            const itemsFolder = script.Parent;
            if (itemsFolder === undefined) {
                error("How");
            }
            const itemsPerId = new Map<string, Item>();
            for (const moduleScript of itemsFolder.GetDescendants()) {
                if (moduleScript.IsA("ModuleScript") && moduleScript !== script) {
                    const i = require(moduleScript);
                    if (i !== undefined) {
                        const item = i as Item;
                        itemsPerId.set(item.id, item);
                    }
                }
            }
            this.itemsPerId = itemsPerId;
        }
        return this.itemsPerId;
    }

    static getItem(itemId: string): Item | undefined {
        return this.init().get(itemId);
    }
}

export = Items;