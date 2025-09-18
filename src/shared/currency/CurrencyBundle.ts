//!native
//!optimize 2

import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { buildRichText } from "@antivivi/vrldk";
import StringBuilder from "@rbxts/stringbuilder";
import { CURRENCIES, CURRENCY_CATEGORIES, CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import CurrencyMap from "shared/currency/CurrencyMap";

declare global {
    type PropertyKey = string | number | symbol;
    type _Combine<T, K extends PropertyKey = T extends unknown ? keyof T : never> = T extends unknown
        ? T & Partial<Record<Exclude<K, keyof T>, never>>
        : never;
    type Combine<T> = { [K in keyof _Combine<T>]: _Combine<T>[K] };

    type Balance = { [currency in Currency]: number };
}

const ONE = new OnoeNum(1);
const ZERO = new OnoeNum(0);

/**
 * Utility class for combining multiple currencies into a single instance.
 *
 * Usually helpful in keeping track and applying formulas on. An example would be a simple droplet upgrader below:
 *
 * @example
 * ```ts
 * let dropletValue = new CurrencyBundle().set("Funds", 50); // Initial droplet value
 * dropletValue = dropletValue.mul(2); // Multiply all currencies by 2
 * dropletValue = dropletValue.mul(new CurrencyBundle().set("Funds", 2)); // Only multiply Funds by 2
 * return dropletValue; // Pass the value to be used in other modules, e.g. adding to balance
 * ```
 */
class CurrencyBundle {
    /**
     * Sorted array of currency details based on their layout order.
     * Used for string formatting.
     */
    static readonly SORTED_DETAILS = (() => {
        const array = new Array<[Currency, CurrencyDetails]>();
        for (const [currency, details] of pairs(CURRENCY_DETAILS)) array.push([currency, details]);
        return array.sort((a, b) => a[1].layoutOrder < b[1].layoutOrder);
    })();

    /**
     * Returns the page name for the specified index.
     *
     * @param page Index number for page
     * @returns Page name in string
     */
    static getCategory(page: number) {
        for (const [c, p] of pairs(CURRENCY_CATEGORIES)) {
            if (page === p) {
                return c;
            }
        }
        return undefined;
    }

    /**
     * Formats the specified amount using the specified currency's format string.
     * If no format is available for the currency, it will instead default to the format ```"<value> <currency>"```.
     * ```ts
     * print(CurrencyBundle.getFormatted("Funds", new OnoeNum(5120))); // Output: $5.12K
     * ```
     *
     * @param currency Currency to use to format
     * @param amount Amount to format
     * @param excludeName Whether to exclude ```<currency>``` in the default format. If left blank, does not exclude
     * @returns Formatted string version of the amount
     */
    static getFormatted(currency: Currency, amount?: BaseOnoeNum | number, excludeName?: boolean) {
        const format = CURRENCY_DETAILS[currency].format;
        const c = amount === undefined ? "" : OnoeNum.toString(amount);
        if (format !== undefined) return format.format(c);
        return excludeName === true ? c : `${c} ${currency}`;
    }

    /**
     * Concatenates all formatted amounts in the instance to a human-readable string that can be used in displaying the prices of items, droplet boosts, etc.
     *
     * @param amountPerCurrency A map of currency to amount
     * @param isColored Whether to color the output based on currency details
     * @param prefix A string to add before each amount
     * @param suffix A string to add after each amount
     * @returns A formatted string of all amounts
     */
    static currenciesToString(
        amountPerCurrency: Map<Currency, BaseOnoeNum>,
        isColored?: boolean,
        prefix?: string,
        suffix?: string,
    ) {
        const builder = new StringBuilder();
        let i = 1;
        const size = amountPerCurrency.size();
        const last = size - 1;
        for (const [name, details] of CurrencyBundle.SORTED_DETAILS) {
            const amount = amountPerCurrency.get(name);
            if (amount !== undefined) {
                let text = CurrencyBundle.getFormatted(name, amount);
                if (prefix !== undefined) text = prefix + text;
                if (suffix !== undefined) text += suffix;

                if (isColored === true && details !== undefined) {
                    buildRichText(builder, text, details.color, undefined, "Bold");
                } else {
                    builder.append(text);
                }

                if (i < size) {
                    builder.append(i === last ? " and " : ", ");
                }
                i++;
            }
        }
        return builder.toString();
    }

    /**
     * Creates a {@link CurrencyBundle} instance with amounts of one for each currency.
     */
    static ones() {
        const ONES = new CurrencyBundle();
        for (const currency of CURRENCIES) {
            ONES.set(currency, 1);
        }
        return ONES;
    }

    /**
     * A {@link CurrencyBundle} instance with amounts of one for each currency.
     * @deprecated Use {@link CurrencyBundle.ones} instead.
     */
    static readonly ONES = CurrencyBundle.ones();

    /**
     * The amounts of each currency in the instance.
     */
    amountPerCurrency: CurrencyMap;

    /**
     * Creates a new CurrencyBundle instance with the specified amounts.
     *
     * @param amountPerCurrency A map of currency to amount. If undefined, the instance will be empty.
     * @param inplace Whether to not clone {@link amountPerCurrency} when creating the instance, therefore allowing direct modification.
     */
    constructor(amountPerCurrency?: CurrencyMap, inplace?: boolean) {
        if (amountPerCurrency !== undefined) {
            if (inplace === true) {
                this.amountPerCurrency = amountPerCurrency;
            } else {
                const cloned = new Map<Currency, OnoeNum>();
                new Map();
                for (const [currency, amount] of amountPerCurrency) {
                    cloned.set(currency, new OnoeNum(amount));
                }
                this.amountPerCurrency = cloned;
            }
        } else {
            this.amountPerCurrency = new Map();
        }
    }

    /**
     * Retrieves the first currency and its amount in the instance.
     * Use this if absolutely certain that there is only one currency in the instance, since {@link Map} does not guarantee order.
     *
     * @returns A tuple containing the currency and its amount, or undefined if none exists.
     */
    getFirst(): LuaTuple<[Currency | undefined, OnoeNum | undefined]> {
        for (const [currency, amount] of this.amountPerCurrency) {
            return $tuple(currency, amount);
        }
        return $tuple(undefined, undefined);
    }

    /**
     * Retrieves the amount of the specified currency in the instance.
     *
     * @param currency The currency to retrieve the amount of
     * @returns The amount of the specified currency. If the currency does not exist, returns undefined.
     */
    get(currency: Currency) {
        return this.amountPerCurrency.get(currency);
    }

    /**
     * Sets the amount for the specified currency in the instance.
     *
     * @param currency The currency to set the amount for
     * @param amount The amount to set, can be an OnoeNum or a number
     * @returns The CurrencyBundle instance for chaining
     */
    set(currency: Currency, amount?: OnoeNum | number) {
        if (amount === undefined) {
            this.amountPerCurrency.delete(currency);
            return this;
        }
        this.amountPerCurrency.set(currency, typeIs(amount, "number") ? new OnoeNum(amount) : (amount as OnoeNum));
        return this;
    }

    /**
     * Checks if all currency amounts in the instance are equal to the specified currency amounts.
     *
     * @param value The currency amounts to check against.
     * @returns True if all amounts are equal, false otherwise.
     */
    equals(value: CurrencyBundle) {
        let equal = true;
        const otherSize = value.amountPerCurrency.size();
        let size = 0;
        for (const [currency, amount] of this.amountPerCurrency) {
            const other = value.get(currency);
            if (other === undefined || !amount.equals(other)) {
                equal = false;
                break;
            }
            size++;
        }
        return equal && size === otherSize;
    }

    /**
     * Concatenates all formatted amounts in the instance to a human-readable string that can be used
     * in displaying the prices of items, droplet boosts, etc.
     * Note that the order in which currencies are shown is determined based on their layout order.
     * ```
     * print(new CurrencyBundle().set("Funds", 100).set("Power", 5).toString()) // Output: $100, 5 W
     * ```
     *
     * @param currency A currency to format into a string. Omit this to format all currencies in the instance.
     * @param amount The amount of the specified currency. Omit this to use the amount in the instance instead.
     * @returns A formatted huamn-readable string of the CurrencyBundle instance
     */
    toString(isColored?: boolean, prefix?: string, suffix?: string) {
        return CurrencyBundle.currenciesToString(this.amountPerCurrency, isColored, prefix, suffix);
    }

    /**
     * Addition operator for adding two CurrencyBundle instances together.
     *
     * @param value The currencies to add.
     * @param inplace Whether to add the amounts to the instance itself.
     * @returns CurrencyBundle instance with the added amounts.
     */
    add(value: CurrencyBundle, inplace?: boolean) {
        const result = CurrencyMap.add(this.amountPerCurrency, value.amountPerCurrency, inplace);
        return inplace === true ? this : new CurrencyBundle(result, true);
    }

    /**
     * Subtraction operator for subtracting two CurrencyBundle instances.
     *
     * @param value The currencies to subtract.
     * @param inplace Whether to subtract the amounts from the instance itself.
     * @returns A new CurrencyBundle instance with the subtracted amounts.
     */
    sub(value: CurrencyBundle, inplace?: boolean) {
        const result = CurrencyMap.sub(this.amountPerCurrency, value.amountPerCurrency, inplace);
        return inplace === true ? this : new CurrencyBundle(result, true);
    }

    /**
     * Multiplies the instance by the specified value.
     *
     * @param value The value to multiply by, can be a CurrencyBundle instance or a number.
     * @param inplace Whether to multiply the amounts in the instance itself.
     * @returns A new CurrencyBundle instance with the multiplied amounts.
     */
    mul(value: CurrencyBundle | number, inplace?: boolean) {
        let result: CurrencyMap;
        if (typeIs(value, "number")) {
            result = CurrencyMap.mulConstant(this.amountPerCurrency, new OnoeNum(value as number), inplace);
        } else {
            result = CurrencyMap.mul(this.amountPerCurrency, (value as CurrencyBundle).amountPerCurrency, inplace);
        }
        return inplace === true ? this : new CurrencyBundle(result, true);
    }

    /**
     * Divides the instance by the specified value.
     *
     * @param value The value to divide by, can be a CurrencyBundle instance or a number.
     * @param inplace Whether to divide the amounts in the instance itself.
     * @returns A new CurrencyBundle instance with the divided amounts.
     */
    div(value: CurrencyBundle | number, inplace?: boolean) {
        let result: CurrencyMap;
        if (typeIs(value, "number")) {
            result = CurrencyMap.divConstant(this.amountPerCurrency, new OnoeNum(value as number), inplace);
        } else {
            result = CurrencyMap.div(this.amountPerCurrency, (value as CurrencyBundle).amountPerCurrency, inplace);
        }
        return inplace === true ? this : new CurrencyBundle(result, true);
    }

    /**
     * Raises the instance to the power of the specified value.
     *
     * @param value The value to raise to, can be a CurrencyBundle instance or a number.
     * @param inplace Whether to raise the amounts in the instance itself.
     * @returns A new CurrencyBundle instance with the powered amounts.
     */
    pow(value: CurrencyBundle | number, inplace?: boolean) {
        let result: CurrencyMap;
        if (typeIs(value, "number")) {
            result = CurrencyMap.powConstant(this.amountPerCurrency, new OnoeNum(value as number), inplace);
        } else {
            result = CurrencyMap.pow(this.amountPerCurrency, (value as CurrencyBundle).amountPerCurrency, inplace);
        }
        return inplace === true ? this : new CurrencyBundle(result, true);
    }

    /**
     * Checks if the instance can afford the specified required currency amounts.
     *
     * @param required The required currency amounts to check against.
     * @param result The result to store the remaining currency amounts after subtraction. If undefined, a new CurrencyBundle instance will be created.
     * @returns True if the instance can afford the required amounts, false otherwise.
     */
    canAfford(required: BaseCurrencyMap, result?: CurrencyMap) {
        return CurrencyMap.canAfford(this.amountPerCurrency, required, result);
    }

    /**
     * Checks if the instance has all currency amounts not equal to zero.
     *
     * @returns True if all currency amounts are not zero, false otherwise.
     */
    hasAll() {
        for (const currency of CURRENCIES) {
            const amount = this.get(currency);
            if (amount === undefined || amount.equals(ZERO)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Creates a clone of the instance.
     *
     * @returns A new CurrencyBundle instance with the same amounts.
     */
    clone() {
        return new CurrencyBundle(this.amountPerCurrency);
    }
}

export = CurrencyBundle;
