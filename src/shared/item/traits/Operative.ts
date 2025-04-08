//!native
//!optimize 2

import { OnoeNum } from "@antivivi/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCIES } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Operative: Operative;
    }
}

const ONE = new OnoeNum(1);
const ZERO = new OnoeNum(0);
const ONES = CurrencyBundle.ones();

export interface IOperative {
    /**
     * Addition (x+y) term.
     */
    add?: CurrencyBundle;

    /**
     * Multiplication (x*y) term.
     */
    mul?: CurrencyBundle;

    /**
     * Power (x^y) term.
     */
    pow?: CurrencyBundle;

}

/**
 * Provides mathematical operations to an item.
 */
export default class Operative extends ItemTrait implements IOperative {

    add?: CurrencyBundle;
    mul?: CurrencyBundle;
    pow?: CurrencyBundle;

    /**
     * Constructs an Operative trait.
     * 
     * @param item The item to which this trait belongs.
     */
    constructor(item: Item) {
        super(item);
    }

    /**
     * Sets the addition term.
     * 
     * @param add Addition term.
     * @returns This operative.
     */
    setAdd(add: CurrencyBundle | undefined) {
        this.add = add;
        return this;
    }

    /**
     * Sets the multiplication term.
     * 
     * @param mul Multiplication term.
     * @returns This operative.
     */
    setMul(mul: CurrencyBundle | undefined) {
        this.mul = mul;
        return this;
    }

    /**
     * Sets the power term.
     * 
     * @param pow Power term.
     * @returns This operative.
     */
    setPow(pow: CurrencyBundle | undefined) {
        this.pow = pow;
        return this;
    }

    format(str: string): string {
        if (this.add !== undefined)
            str = str.gsub("%%add%%", this.add.toString(true, "+"))[0];
        if (this.mul !== undefined)
            str = str.gsub("%%mul%%", this.mul.toString(true, "x"))[0];
        if (this.pow !== undefined)
            str = str.gsub("%%pow%%", this.pow.toString(true, "^"))[0];
        return str;
    }

    /**
     * Determines if this operative is less than another in one {@link Currency}.
     * Priority is given to the power term, then multiplication, then addition.
     * 
     * @param other The other operative.
     * @param currency The currency to compare.
     * @returns True if this operative is less than the other in the specified currency.
     */
    lessThan(other: Operative, currency: Currency) {
        const otherPow = other.pow?.get(currency) ?? ONE;
        const otherMul = other.mul?.get(currency) ?? ONE;
        const otherAdd = other.add?.get(currency) ?? ZERO;
        const pow = this.pow?.get(currency) ?? ONE;
        const mul = this.mul?.get(currency) ?? ONE;
        const add = this.add?.get(currency) ?? ZERO;
        return pow.lessThan(otherPow) || mul.lessThan(otherMul) || add.lessThan(otherAdd);
    }

    /**
     * Gets all currencies involved in the operations.
     * 
     * @returns A set of currencies.
     */
    getCurrencies() {
        const currencies = new Set<Currency>();
        if (this.add !== undefined)
            this.add.amountPerCurrency.forEach((_, currency) => currencies.add(currency));
        if (this.mul !== undefined)
            this.mul.amountPerCurrency.forEach((_, currency) => currencies.add(currency));
        if (this.pow !== undefined)
            this.pow.amountPerCurrency.forEach((_, currency) => currencies.add(currency));
        return currencies;
    }

    /**
     * Apply operations to values.
     * 
     * @param totalAdd Addition term to apply to.
     * @param totalMul Multiplication term to apply to.
     * @param totalPow Power term to apply to.
     * @param add Addition term.
     * @param mul Multiplication term.
     * @param pow Power term.
     * @param inverse Whether to apply the inverse of the operations.
     * @returns The resulting addition, multiplication, and power terms.
     */
    static applyOperative(totalAdd: CurrencyBundle, totalMul: CurrencyBundle, totalPow: CurrencyBundle,
        add?: CurrencyBundle, mul?: CurrencyBundle, pow?: CurrencyBundle, inverse?: boolean) {
        if (inverse === true) {
            if (add !== undefined)
                totalAdd = totalAdd.sub(add);
            if (mul !== undefined)
                totalMul = totalMul.div(mul);
            if (pow !== undefined)
                totalPow = totalPow.pow(ONES.div(pow));
        }
        else {
            if (add !== undefined)
                totalAdd = totalAdd.add(add);
            if (mul !== undefined)
                totalMul = totalMul.mul(mul);
            if (pow !== undefined)
                totalPow = totalPow.pow(pow);
        }
        return $tuple(totalAdd, totalMul, totalPow);
    }

    /**
     * Applies operations to values.
     * 
     * @param add Addition term.
     * @param mul Multiplication term.
     * @param pow Power term.
     * @returns A tuple containing the addition, multiplication, and power terms after applying the operations.
     */
    apply(add: CurrencyBundle, mul: CurrencyBundle, pow: CurrencyBundle): LuaTuple<[CurrencyBundle, CurrencyBundle, CurrencyBundle]>;
    /**
     * Applies all operations in the operative to a value.
     * 
     * @param value The value to which to apply the operations.
     * @returns The value after all operations.
     */
    apply(value: CurrencyBundle): CurrencyBundle;
    apply(add: CurrencyBundle, mul?: CurrencyBundle, pow?: CurrencyBundle) {
        if (mul !== undefined && pow !== undefined) {
            return Operative.applyOperative(add, mul, pow, this.add, this.mul, this.pow, false);
        }

        if (this.add !== undefined)
            add = add.add(this.add);
        if (this.mul !== undefined)
            add = add.mul(this.mul);
        if (this.pow !== undefined)
            add = add.pow(this.pow);
        return add;
    }

    /**
     * Generate `totalAdd`, `totalMul`, and `totalPow` for calculation.
     * 
     * @returns A tuple containing `totalAdd`, `totalMul`, and `totalPow`.
     */
    static template() {
        return $tuple(new CurrencyBundle(), ONES, ONES);
    }

    /**
     * Coalesce all values together with built-in validation.
     * 
     * @param value The base value.
     * @param totalAdd Total addition term.
     * @param totalMul Total multiplication term.
     * @param totalPow Total power term.
     * @returns The value after all operations.
     */
    static coalesce(value: CurrencyBundle, totalAdd: CurrencyBundle, totalMul: CurrencyBundle, totalPow: CurrencyBundle) {
        const newCurrencies = new Map<Currency, OnoeNum>();
        const base = value.amountPerCurrency;
        const adds = totalAdd.amountPerCurrency;
        const muls = totalMul.amountPerCurrency;
        const pows = totalPow.amountPerCurrency;
        for (const currency of CURRENCIES) {
            let amount = base.get(currency);

            const add = adds.get(currency);
            if (add !== undefined)
                amount = amount === undefined ? add : amount.add(add);

            if (amount !== undefined) {
                const mul = muls.get(currency);
                if (mul !== undefined)
                    amount = amount.mul(mul);
                const pow = pows.get(currency);
                if (pow !== undefined)
                    amount = amount.pow(pow);

                if (amount.lessThan(ZERO)) {
                    amount = ZERO;
                }

                newCurrencies.set(currency, amount);
            }
        }

        return new CurrencyBundle(newCurrencies);
    }
}