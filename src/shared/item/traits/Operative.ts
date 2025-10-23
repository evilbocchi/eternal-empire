//!native
//!optimize 2

import { OnoeNum } from "@rbxts/serikanum";
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
        if (this.add !== undefined) str = str.gsub("%%add%%", this.add.toString(true, "+"))[0];
        if (this.mul !== undefined) str = str.gsub("%%mul%%", this.mul.toString(true, "x"))[0];
        if (this.pow !== undefined) str = str.gsub("%%pow%%", this.pow.toString(true, "^"))[0];
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
    lessThan(other: IOperative, currency: Currency) {
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
        if (this.add !== undefined) this.add.amountPerCurrency.forEach((_, currency) => currencies.add(currency));
        if (this.mul !== undefined) this.mul.amountPerCurrency.forEach((_, currency) => currencies.add(currency));
        if (this.pow !== undefined) this.pow.amountPerCurrency.forEach((_, currency) => currencies.add(currency));
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
     * @param repeats Number of times to repeat the operations. Default is 1, which means no repetition.
     * @param inplace Whether to perform operations in-place.
     * @returns The resulting addition, multiplication, and power terms.
     */
    static applySpreadOperative(
        totalAdd?: CurrencyBundle,
        totalMul?: CurrencyBundle,
        totalPow?: CurrencyBundle,
        add?: CurrencyBundle,
        mul?: CurrencyBundle,
        pow?: CurrencyBundle,
        inverse?: boolean,
        repeats?: number,
        inplace?: boolean,
    ) {
        if (repeats !== undefined) {
            if (add !== undefined) add = add.mulConstant(repeats, inplace);
            if (mul !== undefined) mul = mul.powConstant(repeats, inplace);
            if (pow !== undefined) pow = pow.powConstant(repeats, inplace);
        }

        if (inverse === true) {
            if (add !== undefined) totalAdd = totalAdd?.sub(add, inplace);
            if (mul !== undefined) totalMul = totalMul?.div(mul, inplace);
            if (pow !== undefined) totalPow = totalPow?.mul(ONES.div(pow), inplace);
        } else {
            if (add !== undefined) totalAdd = totalAdd?.add(add, inplace);
            if (mul !== undefined) totalMul = totalMul?.mul(mul, inplace);
            if (pow !== undefined) totalPow = totalPow?.mul(pow, inplace);
        }
        return $tuple(totalAdd, totalMul, totalPow);
    }

    /**
     * Applies an operative to values.
     * @param totalAdd Addition term to apply to.
     * @param totalMul Multiplication term to apply to.
     * @param totalPow Power term to apply to.
     * @param operative The operative to apply.
     * @param inverse Whether to apply the inverse of the operations.
     * @param repeats Number of times to repeat the operations. Default is 1, which means no repetition.
     * @param inplace Whether to perform operations in-place.
     * @returns The resulting addition, multiplication, and power terms.
     */
    static applyOperative(
        totalAdd: CurrencyBundle,
        totalMul: CurrencyBundle,
        totalPow: CurrencyBundle,
        operative: IOperative,
        inverse?: boolean,
        repeats?: number,
        inplace?: boolean,
    ): LuaTuple<[CurrencyBundle, CurrencyBundle, CurrencyBundle]> {
        return Operative.applySpreadOperative(
            totalAdd,
            totalMul,
            totalPow,
            operative.add,
            operative.mul,
            operative.pow,
            inverse,
            repeats,
            inplace,
        ) as LuaTuple<[CurrencyBundle, CurrencyBundle, CurrencyBundle]>;
    }

    /**
     * Applies operations to values.
     *
     * @param add Addition term.
     * @param mul Multiplication term.
     * @param pow Power term.
     * @returns A tuple containing the addition, multiplication, and power terms after applying the operations.
     */
    apply(
        add: CurrencyBundle,
        mul: CurrencyBundle,
        pow: CurrencyBundle,
    ): LuaTuple<[CurrencyBundle, CurrencyBundle, CurrencyBundle]>;
    /**
     * Applies all operations in the operative to a value.
     *
     * @param value The value to which to apply the operations.
     * @returns The value after all operations.
     */
    apply(value: CurrencyBundle): CurrencyBundle;
    apply(add: CurrencyBundle, mul?: CurrencyBundle, pow?: CurrencyBundle, repeats?: number) {
        if (mul !== undefined && pow !== undefined) {
            return Operative.applySpreadOperative(add, mul, pow, this.add, this.mul, this.pow, false, repeats);
        }

        let totalAdd = this.add;
        let totalMul = this.mul;
        let totalPow = this.pow;
        if (repeats !== undefined) {
            if (totalAdd !== undefined) totalAdd = totalAdd.mulConstant(repeats);
            if (totalMul !== undefined) totalMul = totalMul.powConstant(repeats);
            if (totalPow !== undefined) totalPow = totalPow.powConstant(repeats);
        }
        return Operative.coalesce(add, totalAdd, totalMul, totalPow);
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
    static coalesce(
        value: CurrencyBundle,
        totalAdd?: CurrencyBundle,
        totalMul?: CurrencyBundle,
        totalPow?: CurrencyBundle,
    ) {
        const newCurrencies = new Map<Currency, OnoeNum>();
        const base = value.amountPerCurrency;
        const adds = totalAdd?.amountPerCurrency;
        const muls = totalMul?.amountPerCurrency;
        const pows = totalPow?.amountPerCurrency;
        for (const currency of CURRENCIES) {
            let amount = base.get(currency);

            if (adds !== undefined) {
                const add = adds.get(currency);
                if (add !== undefined) amount = amount === undefined ? add : amount.add(add);
            }

            if (amount === undefined) {
                continue;
            }

            if (muls !== undefined) {
                const mul = muls.get(currency);
                if (mul !== undefined) amount = amount.mul(mul);
            }

            if (pows !== undefined) {
                const pow = pows.get(currency);
                if (pow !== undefined) amount = amount.pow(pow);
            }

            if (amount.lessThan(ZERO)) {
                amount = ZERO;
            }

            newCurrencies.set(currency, amount);
        }

        return new CurrencyBundle(newCurrencies);
    }
}
