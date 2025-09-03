import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Accelerator: Accelerator;
    }
}

export default class Accelerator extends ItemTrait {
    boost = 1;

    constructor(item: Item) {
        super(item);
    }

    setBoost(boost: number) {
        this.boost = boost;
        return this;
    }
}
