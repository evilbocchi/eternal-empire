//!native
//!optimize 2

import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { CURRENCIES } from "shared/currency/CurrencyDetails";

declare global {
    /**
     * A map of currencies and their amounts.
     */
    type CurrencyMap = Map<Currency, OnoeNum>;

    /**
     * A base currency map that uses BaseOnoeNum for amounts.
     * This is used for operations that do not require the full functionality of OnoeNum.
     */
    type BaseCurrencyMap = Map<Currency, BaseOnoeNum>;
}

namespace CurrencyMap {
    const ONE = new OnoeNum(1);

    /**
     * Wraps a base currency map into a currency map.
     *
     * @param baseCurrencyMap The base currency map to wrap.
     * @returns The wrapped currency map.
     */
    export function wrap(baseCurrencyMap: BaseCurrencyMap) {
        for (const [currency, amount] of baseCurrencyMap) baseCurrencyMap.set(currency, new OnoeNum(amount));
        return baseCurrencyMap as CurrencyMap;
    }

    /**
     * Checks if two currency maps are equal.
     *
     * @param map The first map.
     * @param other The second map.
     * @returns True if the maps are equal, false otherwise.
     */
    export function equals(map: CurrencyMap, other: CurrencyMap) {
        if (map === other)
            // same reference
            return true;

        if (map.size() !== other.size()) return false;

        for (const [currency, amount] of map) {
            const otherAmount = other.get(currency);
            if (otherAmount === undefined || !amount.equals(otherAmount)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Adds each currency's amount in the other map to this map.
     * @example
     * ```ts
     * const a = new Map<Currency, OnoeNum>([
     *    ["Funds", new OnoeNum(100)],
     *    ["Power", new OnoeNum(200)]
     * ]);
     * const b = new Map<Currency, OnoeNum>([
     *   ["Funds", new OnoeNum(50)],
     *   ["Power", new OnoeNum(100)]
     * ]);
     * const result = a.add(b);
     * // result = new Map<Currency, OnoeNum>([
     * //   ["Funds", new OnoeNum(150)],
     * //   ["Power", new OnoeNum(300)]
     * // ]);
     * ```
     *
     * @param map The map to add to.
     * @param other The map to add from.
     * @param inplace If true, the result will be stored in this map. Otherwise, a new map will be created.
     * @returns The resulting map.
     */
    export function add(map: CurrencyMap, other: CurrencyMap, inplace?: boolean) {
        const result = inplace === true ? map : new Map<Currency, OnoeNum>();

        for (const currency of CURRENCIES) {
            const a = map.get(currency);
            const b = other.get(currency);

            if (a !== undefined && b !== undefined) {
                result.set(currency, a.add(b));
            } else if (a !== undefined) {
                result.set(currency, a);
            } else if (b !== undefined) {
                result.set(currency, b);
            }
        }
        return result;
    }

    /**
     * Subtracts each currency's amount in the other map from this map.
     *
     * @example
     * ```ts
     * const a = new Map<Currency, OnoeNum>([
     *  ["Funds", new OnoeNum(100)],
     *  ["Power", new OnoeNum(200)]
     * ]);
     * const b = new Map<Currency, OnoeNum>([
     *  ["Funds", new OnoeNum(50)],
     *  ["Power", new OnoeNum(100)]
     * ]);
     * const result = a.sub(b);
     * // result = new Map<Currency, OnoeNum>([
     * //   ["Funds", new OnoeNum(50)],
     * //   ["Power", new OnoeNum(100)]
     * // ]);
     * ```
     *
     * @param map The map to subtract from.
     * @param other The map to subtract.
     * @param inplace If true, the result will be stored in this map. Otherwise, a new map will be created.
     * @returns The resulting map.
     */
    export function sub(map: CurrencyMap, other: CurrencyMap, inplace?: boolean) {
        const result = inplace === true ? map : new Map<Currency, OnoeNum>();

        for (const currency of CURRENCIES) {
            const a = map.get(currency);
            const b = other.get(currency);

            if (a !== undefined && b !== undefined) {
                result.set(currency, a.sub(b));
            } else if (a !== undefined) {
                result.set(currency, a);
            } else if (b !== undefined) {
                result.set(currency, b.unary());
            }
        }
        return result;
    }

    /**
     * Multiplies each currency's amount in this map by the other map's amount.
     *
     * @example
     * ```ts
     * const a = new Map<Currency, OnoeNum>([
     * ["Funds", new OnoeNum(100)],
     * ["Power", new OnoeNum(200)],
     * ["Bitcoin", new OnoeNum(1)]
     * ]);
     * const b = new Map<Currency, OnoeNum>([
     * ["Funds", new OnoeNum(2)],
     * ["Power", new OnoeNum(3)]
     * ]);
     * const result = a.mul(b);
     * // result = new Map<Currency, OnoeNum>([
     * // ["Funds", new OnoeNum(200)],
     * // ["Power", new OnoeNum(600)],
     * // ["Bitcoin", new OnoeNum(1)]
     * // ]);
     *
     * @param this The map to multiply.
     * @param other  The map to multiply by.
     * @param inplace If true, the result will be stored in this map. Otherwise, a new map will be created.
     * @returns The resulting map.
     */
    export function mul(map: CurrencyMap, other: CurrencyMap, inplace?: boolean) {
        const result = inplace === true ? map : new Map<Currency, OnoeNum>();

        for (const [currency, amount] of map) {
            result.set(currency, amount.mul(other.get(currency) ?? ONE));
        }
        return result;
    }

    /**
     * Multiplies each currency's amount in this map by a constant value.
     *
     * @param map The map to multiply.
     * @param value The value to multiply by.
     * @param inplace If true, the result will be stored in this map. Otherwise, a new map will be created.
     * @returns The resulting map.
     */
    export function mulConstant(map: CurrencyMap, value: OnoeNum | number, inplace?: boolean) {
        const result = inplace === true ? map : new Map<Currency, OnoeNum>();

        for (const [currency, amount] of map) {
            result.set(currency, amount.mul(value));
        }
        return result;
    }

    /**
     * Divides each currency's amount in this map by the other map's amount.
     *
     * @param map The map to divide.
     * @param other The map to divide by.
     * @param inplace If true, the result will be stored in this map. Otherwise, a new map will be created.
     * @returns The resulting map.
     */
    export function div(map: CurrencyMap, other: CurrencyMap, inplace?: boolean) {
        const result = inplace === true ? map : new Map<Currency, OnoeNum>();

        for (const [currency, amount] of map) {
            result.set(currency, amount.div(other.get(currency) ?? ONE));
        }
        return result;
    }

    /**
     * Divides each currency's amount in this map by a constant value.
     *
     * @param map The map to divide.
     * @param value The value to divide by.
     * @param inplace If true, the result will be stored in this map. Otherwise, a new map will be created.
     * @returns The resulting map.
     */
    export function divConstant(map: CurrencyMap, value: OnoeNum | number, inplace?: boolean) {
        const result = inplace === true ? map : new Map<Currency, OnoeNum>();

        for (const [currency, amount] of map) {
            result.set(currency, amount.div(value));
        }
        return result;
    }

    /**
     * Raises each currency's amount in this map to the power of the other map's amount.
     *
     * @param map The map to raise to the power.
     * @param other The map to raise by.
     * @param inplace If true, the result will be stored in this map. Otherwise, a new map will be created.
     * @returns The resulting map.
     */
    export function pow(map: CurrencyMap, other: CurrencyMap, inplace?: boolean) {
        const result = inplace === true ? map : new Map<Currency, OnoeNum>();

        for (const [currency, amount] of map) {
            result.set(currency, amount.pow(other.get(currency) ?? ONE));
        }
        return result;
    }

    /**
     * Raises each currency's amount in this map to the power of a constant value.
     *
     * @param map The map to raise to the power.
     * @param value The value to raise by.
     * @param inplace If true, the result will be stored in this map. Otherwise, a new map will be created.
     * @returns The resulting map.
     */
    export function powConstant(map: CurrencyMap, value: OnoeNum | number, inplace?: boolean) {
        const result = inplace === true ? map : new Map<Currency, OnoeNum>();

        for (const [currency, amount] of map) {
            result.set(currency, amount.pow(value));
        }
        return result;
    }

    /**
     * Checks whether the amount of each currency in the balance satisfies the required currency amounts.
     *
     * @param balance The currency amounts to check against.
     * @param required The currency amounts needed.
     * @param result A map to store the resulting currency amounts after subtraction.
     * @returns If there is sufficient amount of each currency to cover the required amounts.
     */
    export function canAfford(balance: CurrencyMap, required: BaseCurrencyMap, result?: CurrencyMap): boolean {
        let sufficient = true;
        for (const [currency, amount] of required) {
            const inBalance = balance.get(currency);
            const after = inBalance === undefined ? OnoeNum.unary(amount) : inBalance.sub(amount);
            if (after.lessThan(0)) {
                // falls below 0, not enough in balance to cover amount
                sufficient = false;
            }
            result?.set(currency, after);
        }
        return sufficient;
    }
}

export default CurrencyMap;
