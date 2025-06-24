import { OnoeNum } from "@antivivi/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import Operative from "shared/item/traits/Operative";

declare global {
    interface ItemTraits {
        FormulaBundled: FormulaBundled;
    }
}

/**
 * Allows the item to apply a formula that varies in multiplier based on currency.
 */
export default class FormulaBundled extends ItemTrait {
    flat = new CurrencyBundle();
    ratio = new Map<Currency, number>();
    x?: () => OnoeNum;

    constructor(item: Item) {
        super(item);
    }

    /**
     * Set the x function that returns the value to be used in the formula.
     * 
     * @param x The function that returns the OnoeNum value for x.
     * @returns The FormulaBundled instance for chaining.
     */
    setX(x: () => OnoeNum) {
        this.x = x;
        return this;
    }

    /**
     * Set how much the value of a profit will be multiplied by for a specific currency in the formula.
     * 
     * @param currency The currency to set the ratio for.
     * @param ratio The ratio value to set.
     * @returns The FormulaBundled instance for chaining.
     */
    setRatio(currency: Currency, ratio: number) {
        this.ratio.set(currency, ratio);
        return this;
    }

    /**
     * Set a flat value for a specific currency in the formula.
     * 
     * @param currency The currency to set the flat value for.
     * @param flat The flat value to set, can be an OnoeNum or a number.
     * @returns The FormulaBundled instance for chaining.
     */
    setFlat(currency: Currency, flat: OnoeNum | number) {
        this.flat.set(currency, flat);
        return this;
    }

    /**
     * Applies the bundled formula to the trait.
     * 
     * @param Trait The trait constructor to apply the formula to.
     * @returns The trait instance with the formula applied.
     */
    apply<T extends Operative>(Trait: Constructor<T>) {
        if (this.x === undefined) {
            throw "FormulaBundled: x function is not set. Use setX() to set it.";
        }
        const trait = this.trait(Trait);
        trait.applyFormula((v, trait) => {
            const ratio = new CurrencyBundle();
            for (const [currency, ratioValue] of this.ratio) {
                ratio.set(currency, v.mul(ratioValue));
            }
            for (const [currency, flatValue] of this.flat.amountPerCurrency) {
                ratio.set(currency, flatValue);
            }
            trait.setMul(ratio);

        }, this.x);
        return trait;
    }

    format(str: string): string {
        return str.gsub("%%flat%%", this.flat.toString())[0];
    }
}