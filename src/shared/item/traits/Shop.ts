import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Shop: Shop;
    }
}

export default class Shop extends ItemTrait {
    items: Item[] = [];

    static sharedLoad(model: Model) {
        const touchPart = (model.FindFirstChild("TouchPart") as BasePart | undefined) ?? model.PrimaryPart;
        if (touchPart === undefined) {
            warn("Shop model does not have a TouchPart or PrimaryPart.");
            return;
        }

        touchPart.CanTouch = true;
        touchPart.Touched.Connect(() => {});
        if (touchPart.Name === "TouchPart") {
            touchPart.AddTag("Unhoverable");
        }
        touchPart.AddTag("Shop");
    }

    constructor(item: Item) {
        super(item);
        item.persists();
        item.onSharedLoad((model) => Shop.sharedLoad(model));
    }

    addItem(item: Item) {
        this.items.push(item);
        return this;
    }

    setItems(items: Item[]) {
        this.items = items;
        return this;
    }
}
