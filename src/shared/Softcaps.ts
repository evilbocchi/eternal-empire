import { OnoeNum } from "@antivivi/serikanum";

declare global {
    type CurrencySoftcaps = {
        div: Softcap,
        recippow: Softcap
    }
    type Softcap = {
        starts: OnoeNum,
        formula: (amount: OnoeNum) => OnoeNum
    }
}

const Softcaps = {
    Funds: {
        div: {
            starts: new OnoeNum(1e33),
            formula: (amount: OnoeNum) => amount.div(1e33).pow(0.15),
        },
        recippow: {
            starts: new OnoeNum(1e306),
            formula: (amount: OnoeNum) => amount.div(1e306).pow(0.15),
        },
    },
    Skill: {
        div: {
            starts: new OnoeNum(10000),
            formula: (amount: OnoeNum) => amount.div(10000).pow(0.2),
        },
        recippow: {
            starts: new OnoeNum(1e42),
            formula: (amount: OnoeNum) => amount.div(1e42).pow(0.2),
        },
    },
} as {[currency in Currency]: CurrencySoftcaps}

/**
 * Returns a softcap coefficient from a specified total.
 * This can be used in reducing income.
 * 
 * @param amount Total to get softcap from
 * @param softcap The softcap to apply
 * @returns A tuple with the resulting coefficient and the softcap starting point. If the softcap is not applicable, this will be undefined.
 */
export const performSoftcap = (amount?: OnoeNum, softcap?: Softcap) => {
    if (softcap === undefined || amount === undefined)
        return $tuple(undefined, undefined);
    const starts = softcap.starts;
    if (starts.moreThan(amount))
        return $tuple(undefined, starts);
    else
        return $tuple(softcap.formula(amount), starts);
}

export default Softcaps;

