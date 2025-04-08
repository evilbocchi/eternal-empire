import { OnoeNum } from "@antivivi/serikanum";
import Item from "shared/item/Item";

declare global {

    /**
     * Contains all item traits.
     * 
     * @see {@link ItemTrait} for the base class of all item traits.
     */
    interface ItemTraits {
        
    }
}

/**
 * Represents a trait for building a specific type of item.
 */
export default abstract class ItemTrait {

    /**
     * Represents a trait for building a specific type of item.
     * 
     * @param item The item instance to be built.
     */
    constructor(public readonly item: Item) {

    }

    /**
     * Returns the item instance of the trait.
     * 
     * @returns The item instance.
     */
    exit() {
        return this.item;
    }

    /**
     * Redirects to another trait to build a specific type of item.
     * 
     * @param Trait The constructor of the type of item.
     * @returns The redirected item trait.
     */
    trait<T extends ItemTraits[keyof ItemTraits]>(Trait: Constructor<T>): T {
        return this.item.trait(Trait);
    }

    /**
     * Calls the callback function every second by passing the return of the x function in the formula function, and passing the return of that to the callback.
     * 
     * @param callback Called every second with the `value` parameter passed as the return of `this.formula`.
     * @param x The value to be used in the formula.
     * 
     * @see {@link Item.applyFormula} for the unwrapped version of this function.
     */
    applyFormula(callback: (value: OnoeNum, upgrader: this) => unknown, x: () => OnoeNum) {
        const item = this.item;
        item.formulaCallback = (value) => callback(value, this);
        item.formulaXGet = x;
        return this;
    }

    /**
     * Formats a string with the item trait's properties.
     * 
     * @param str The string to format.
     */
    format(str: string) {
        return str;
    }
}