//!native
//!optimize 2

import Signal from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, OnStart, Service } from "@flamework/core";
import { DataService } from "server/services/serverdata/DataService";
import Packets from "shared/Packets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCIES, CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import CurrencyMap from "shared/currency/CurrencyMap";
import Queue from "shared/currency/Queue";

const ZERO = new OnoeNum(0);

@Service()
export class CurrencyService implements OnInit, OnStart {

    private readonly currencies: CurrencyMap;
    private readonly mostCurrencies: CurrencyMap;
    private readonly mostCurrenciesSinceReset: CurrencyMap;

    readonly balance: CurrencyBundle;
    readonly balanceChanged = new Signal<(balance: CurrencyBundle) => void>();
    lastPropagation?: CurrencyMap;

    constructor(private dataService: DataService) {
        this.currencies = CurrencyMap.wrap(dataService.empireData.currencies);
        this.mostCurrencies = CurrencyMap.wrap(dataService.empireData.mostCurrencies);
        this.mostCurrenciesSinceReset = CurrencyMap.wrap(dataService.empireData.mostCurrenciesSinceReset);

        this.balance = new CurrencyBundle(this.currencies, true);
    }

    get(currency: Currency) {
        return this.balance.get(currency) ?? ZERO;
    }

    set(currency: Currency, amount: OnoeNum | undefined) {
        this.balance.set(currency, amount);
    }

    increment(currency: Currency, delta: OnoeNum) {
        return this.set(currency, this.get(currency).add(delta));
    }

    setAll(currencies: CurrencyMap) {
        this.currencies.clear();
        for (const [currency, amount] of currencies) {
            this.currencies.set(currency, amount);
        }
    }

    /**
     * Checks whether the amount of each currency in the balance satisfies the required currency amounts.
     * 
     * @param required The currency amounts needed.
     * @returns A tuple that contains if there is sufficient currencies and the remaining currency amounts after subtraction.
     */
    canAfford(required: CurrencyBundle): LuaTuple<[boolean, CurrencyBundle]> {
        const result = new CurrencyBundle();
        const sufficient = this.balance.canAfford(required.amountPerCurrency, result.amountPerCurrency);
        return $tuple(sufficient, result);
    }

    incrementAll(delta: CurrencyMap) {
        for (const [currency, amount] of delta) {
            this.increment(currency, amount);
        }
    }

    purchase(price: CurrencyBundle, isFree?: boolean) {
        const [isSufficient, remaining] = this.canAfford(price);
        if (isSufficient === true) {
            if (isFree !== true) {
                for (const [currency, amount] of remaining.amountPerCurrency) {
                    this.set(currency, amount);
                }
            }
            return true;
        }
        return false;
    }

    propagate() {
        const currencies = this.currencies;
        if (this.lastPropagation !== undefined && CurrencyMap.equals(this.lastPropagation, currencies)) {
            return;
        }
        this.lastPropagation = table.clone(currencies);

        Packets.balance.set(currencies);
        this.balanceChanged.fire(this.balance);
    }

    /**
     * Naive implementation of offline revenue calculation.
     * Assumes revenue generation over the current reset period is linear. 
     * 
     * @returns Revenue generated per second.
     */
    getOfflineRevenue(t = tick()) {
        return new CurrencyBundle(this.mostCurrenciesSinceReset).div(t - this.dataService.empireData.lastReset);
    }

    onInit() {
        const queuePerCurrency = new Map<Currency, Queue>();
        for (const currency of CURRENCIES) {
            queuePerCurrency.set(currency, new Queue());
        }

        task.spawn(() => {
            while (task.wait(1)) {
                const revenue = new Map<Currency, OnoeNum>();
                for (const [currency, amount] of this.currencies) {
                    if (CURRENCY_DETAILS[currency] === undefined) {
                        this.currencies.delete(currency);
                        continue;
                    }

                    const most = this.mostCurrencies.get(currency);
                    if (most === undefined || amount.moreThan(most)) {
                        this.mostCurrencies.set(currency, amount);
                    }

                    const mostSinceReset = this.mostCurrenciesSinceReset.get(currency);
                    if (mostSinceReset === undefined || amount.moreThan(mostSinceReset)) {
                        this.mostCurrenciesSinceReset.set(currency, amount);
                    }

                    const queue = queuePerCurrency.get(currency);
                    if (queue === undefined) {
                        continue;
                    }
                    queue.addToQueue(amount);
                    revenue.set(currency, queue.getAverageGain());
                }
                Packets.mostBalance.set(this.mostCurrencies);
                Packets.revenue.set(revenue);
            }
        });
    }

    onStart() {
        task.spawn(() => {
            while (task.wait(0.1)) {
                this.propagate();
            }
        });
    }
}