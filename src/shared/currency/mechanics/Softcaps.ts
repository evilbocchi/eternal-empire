import { OnoeNum } from "@rbxts/serikanum";

declare global {
    type CurrencySoftcaps = {
        div: Softcap;
        recippow: Softcap;
    };
    type Softcap = {
        requirement: OnoeNum;
        formula: (amount: OnoeNum) => OnoeNum;
    };
}

const Softcaps = {
    Funds: {
        div: {
            requirement: new OnoeNum(1e33),
            formula: (amount: OnoeNum) => amount.div(1e33).pow(0.15),
        },
        recippow: {
            requirement: new OnoeNum(1e306),
            formula: (amount: OnoeNum) => amount.div(1e306).pow(0.15),
        },
    },
    Skill: {
        div: {
            requirement: new OnoeNum(100000),
            formula: (amount: OnoeNum) => amount.div(100000).pow(0.2),
        },
        recippow: {
            requirement: new OnoeNum(1e42),
            formula: (amount: OnoeNum) => amount.div(1e42).pow(0.2),
        },
    },
} as { [currency in Currency]: CurrencySoftcaps };

/**
 * Returns a softcap coefficient from a specified total.
 * This can be used in reducing revenue.
 *
 * @param amount Total to get softcap from
 * @param softcap The softcap to apply
 * @returns A tuple with the resulting coefficient and the softcap starting point. If the softcap is not applicable, this will be undefined.
 */
export const performSoftcap = (amount?: OnoeNum, softcap?: Softcap) => {
    if (softcap === undefined || amount === undefined) return $tuple(undefined, undefined);
    const starts = softcap.requirement;
    if (starts.moreThan(amount)) return $tuple(undefined, starts);
    else return $tuple(softcap.formula(amount), starts);
};

/**
 * Mutably applies softcaps to a value based on the balance.
 * @param balance The balance the server currently has.
 * @param value The value to apply softcaps to.
 * @returns The value with softcaps applied.
 */
export function performSoftcaps(balance: CurrencyMap, value: CurrencyMap) {
    for (const [currency, amount] of value) {
        const softcaps = Softcaps[currency];
        if (softcaps === undefined) continue;
        const inBal = balance.get(currency);
        const highest = inBal === undefined || inBal.lessThan(amount) ? amount : inBal;

        const [divSoftcap] = performSoftcap(highest, softcaps.div);
        if (divSoftcap !== undefined) {
            value.set(currency, amount.div(divSoftcap));
        }

        const [recippowSoftcap] = performSoftcap(highest, softcaps.recippow);
        if (recippowSoftcap !== undefined) {
            value.set(currency, amount.pow(new OnoeNum(1).div(recippowSoftcap)));
        }
    }
    return value;
}

export default Softcaps;
