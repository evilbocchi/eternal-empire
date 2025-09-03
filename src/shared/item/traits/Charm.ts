import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Charm: Charm;
    }
}

/**
 * A charm is an item that does not need to be placed to provide its effects.
 */
export default class Charm extends ItemTrait {
    /**
     * The amount of critical hit chance to add.
     */
    criticalAdd: number | undefined;

    /**
     * Creates a new charm.
     *
     * @param item The item to create the charm from.
     */
    constructor(item: Item) {
        super(item);
    }

    /**
     * Sets the critical hit chance to add.
     *
     * @param criticalAdd The critical hit chance to add.
     * @returns This charm.
     */
    setCriticalAdd(criticalAdd: number) {
        this.criticalAdd = criticalAdd;
        return this;
    }
}
