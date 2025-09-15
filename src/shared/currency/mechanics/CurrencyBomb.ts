import CurrencyBundle from "shared/currency/CurrencyBundle";

namespace CurrencyBomb {
    export const BOOSTING_CURRENCIES = {
        "Funds Bombs": new CurrencyBundle().set("Funds", 2),
    } as { [currency in Currency]: CurrencyBundle | undefined };

    /**
     * Gets the total boosts from all active bombs.
     * @param bombEndTimes The map of bomb end times.
     * @param t The current time (os.time()). Defaults to now.
     * @returns A CurrencyBundle of the total boosts, or undefined if no boosts are active.
     */
    export function getBombBoosts(bombEndTimes: Map<Currency, number>, t = os.time()): CurrencyBundle | undefined {
        const boost = new CurrencyBundle();
        let changed = false;
        for (const [currency, endTime] of bombEndTimes) {
            if (t > endTime) continue; // Skip expired bombs

            const boosting = BOOSTING_CURRENCIES[currency];
            if (!boosting) continue;

            for (const [boostCurrency, multiplier] of boosting.amountPerCurrency) {
                const currentBoost = boost.get(boostCurrency);
                if (currentBoost === undefined) {
                    boost.set(boostCurrency, multiplier);
                } else {
                    boost.set(boostCurrency, currentBoost.mul(multiplier));
                }
                changed = true;
            }
        }
        return changed ? boost : undefined;
    }
}

export default CurrencyBomb;
