import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Shop: Shop;
    }
}

export default class Shop extends ItemTrait {
    /**
     * The items sold in this shop. Do not modify this set directly; instead, use {@link Item.soldAt}.
     */
    readonly items = new Set<Item>();

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
        item.persists().unbreakable();
        item.onSharedLoad((model) => Shop.sharedLoad(model));
    }
}
