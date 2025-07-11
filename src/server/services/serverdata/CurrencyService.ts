//!native

import Signal from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, Service } from "@flamework/core";
import { DataService } from "server/services/serverdata/DataService";
import Packets from "shared/network/Packets";
import Price from "shared/Price";
import Softcaps from "shared/Softcaps";
import Queue from "shared/utils/Queue";

const ZERO = new OnoeNum(0);


@Service()
export class CurrencyService implements OnInit {
    balanceChanged = new Signal<(balance: Map<Currency, OnoeNum>) => void>();

    constructor(private dataService: DataService) {

    }

    getCost(currency: Currency, currencies = this.dataService.empireData.currencies) {
        return new OnoeNum(currencies.get(currency) ?? 0);
    }

    setCost(currency: Currency, cost: OnoeNum | undefined, dontPropagateToClient?: boolean, currencies = this.dataService.empireData.currencies) {
        if (cost === undefined) {
            currencies.delete(currency);
        }
        else {
            currencies.set(currency, ZERO.moreThan(cost) ? ZERO : cost);
        }
        if (dontPropagateToClient !== true) {
            this.propagate(currencies);
        }
    }

    incrementCost(currency: Currency, delta: OnoeNum, dontPropagateToClient?: boolean, currencies = this.dataService.empireData.currencies) {
        return this.setCost(currency, this.getCost(currency, currencies).add(delta), dontPropagateToClient, currencies);
    }

    /**
     * Gets the amount of each currency in the server.
     * This is a slow function since it creates a new Price instance and
     * effectively clones the currencies object stored in data.
     * 
     * @returns Price instance containing amounts of each currency
     */
    getBalance() {
        const price = new Price();
        const currencies = this.dataService.empireData.currencies;
        for (const [currency, amount] of pairs(currencies)) {
            price.setCost(currency, new OnoeNum(amount));
        }
        return price;
    }

    setBalance(balance: Price) {
        this.setCurrencies(balance.costPerCurrency);
    }

    /**
     * Checks whether the amount of each currency in the server satisfies the required currency amounts.
     * 
     * @param required The currency amounts needed
     * @returns A tuple that contains if there is sufficient currencies and the remaining currency amounts after subtraction.
     */
    isSufficientBalance(required: Price): LuaTuple<[boolean, Price]> {
        const balance = this.getBalance();
        let sufficient = true;
        for (const [currency, cost] of required.costPerCurrency) {
            const balCost = balance.getCost(currency);
            if (balCost === undefined) {
                if (cost.moreThan(0))
                    sufficient = false;
                balance.setCost(currency, cost.unary());
            }
            else {
                if (balCost.lessThan(cost))
                    sufficient = false;
                balance.setCost(currency, balCost.sub(cost));
            }
        }
        return $tuple(sufficient, balance);
    }

    setCurrencies(to: Map<Currency, OnoeNum>, currencies = this.dataService.empireData.currencies) {
        for (const [currency, cost] of to) {
            this.setCost(currency, cost, true, currencies);
        }
        this.propagate(currencies);
    }

    incrementCurrencies(delta: Map<Currency, OnoeNum>, currencies = this.dataService.empireData.currencies) {
        for (const [currency, cost] of delta) {
            this.incrementCost(currency, cost, true, currencies);
        }
        this.propagate(currencies);
    }

    propagate(currencies: Map<Currency, OnoeNum>) {
        Packets.balance.set(currencies);
        this.balanceChanged.fire(currencies);
    }

    purchase(price: Price) {
        const [isSufficient, bal] = this.isSufficientBalance(price);
        if (isSufficient === true) {
            this.setCurrencies(bal.costPerCurrency);
            return true;
        }
        return false;
    }

    onInit() {
        Packets.balance.set(this.dataService.empireData.currencies);

        const queuePerCurrency = new Map<Currency, Queue>();
        for (const [currency] of pairs(Price.DETAILS_PER_CURRENCY)) {
            queuePerCurrency.set(currency, new Queue());
        }
        const income = new Map<Currency, OnoeNum>();

        task.spawn(() => {
            while (task.wait(1)) {
                const data = this.dataService.empireData;
                const currencies = data.currencies;
                const mostCurrencies = data.mostCurrencies;
                for (const [currency, amount] of currencies) {
                    if (Price.DETAILS_PER_CURRENCY[currency] === undefined) {
                        currencies.delete(currency);
                        continue;
                    }
                    const mostRecorded = mostCurrencies.get(currency);
                    if (mostRecorded === undefined || new OnoeNum(amount).moreThan(mostRecorded)) {
                        mostCurrencies.set(currency, amount);
                    }

                    const queue = queuePerCurrency.get(currency);
                    if (queue === undefined) {
                        continue;
                    }
                    queue.addToQueue(amount);
                    income.set(currency, queue.getAverageGain());
                }
                Packets.mostBalance.set(mostCurrencies);
                Packets.income.set(income);
            }
        });
    }
}