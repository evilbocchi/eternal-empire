import { OnoeNum } from "@antivivi/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";

namespace DarkMatter {
    export const BOOSTING_CURRENCIES = {
        Funds: {
            requirement: new OnoeNum(0),
            formula: new Formula().add(1).log(11).pow(2).div(4.5).add(1.2),
        },
        Power: {
            requirement: new OnoeNum(1000),
            formula: new Formula().add(1).div(1000).log(11).pow(2).div(9).add(1.2),
        },
    } as const;

    /**
     * Calculates the boost values for Funds and Power based on Dark Matter.
     * Uses logarithmic scaling for diminishing returns.
     * @param balance The currency bundle to use (defaults to current balance).
     * @returns Tuple of (boost bundle, dark matter amount).
     */
    export function getBoost(balance: CurrencyBundle) {
        const darkMatter = balance.get("Dark Matter");

        const ZERO = new OnoeNum(0);
        if (!darkMatter || darkMatter.equals(ZERO)) {
            return $tuple(undefined, ZERO);
        }

        let boost = new CurrencyBundle();
        for (const [currency, boostingDetails] of pairs(BOOSTING_CURRENCIES)) {
            if (darkMatter.lessThan(boostingDetails.requirement)) continue;

            boost = boost.set(currency, boostingDetails.formula.apply(darkMatter));
        }

        return $tuple(boost, darkMatter);
    }
}

export default DarkMatter;
