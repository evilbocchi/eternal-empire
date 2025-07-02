//!native
//!optimize 2

/**
 * @fileoverview CurrencyService - Core currency management system for the game.
 * 
 * This service handles:
 * - Currency balance tracking and manipulation
 * - Purchase transactions and affordability checks
 * - Revenue calculation and tracking
 * - Currency propagation to clients
 * - Historical currency records (most ever, most since reset)
 * - Offline revenue estimation
 * 
 * The service uses OnoeNum for big number arithmetic to handle very large currency values
 * that exceed JavaScript's number precision limits.
 * 
 * @since 1.0.0
 */

import Signal from "@antivivi/lemon-signal";
import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, OnStart, Service } from "@flamework/core";
import DataService from "server/services/serverdata/DataService";
import Packets from "shared/Packets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCIES, CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import CurrencyMap from "shared/currency/CurrencyMap";
import Queue from "shared/currency/Queue";

/** Constant zero value for performance optimization. */
const ZERO = new OnoeNum(0);

/**
 * Core currency management service that handles all currency-related operations.
 * 
 * Manages multiple currency types with big number support, tracks historical maximums,
 * calculates revenue rates, and synchronizes currency data with clients.
 */
@Service()
export default class CurrencyService implements OnInit, OnStart {

    // Core Currency Data

    /**
     * Current currency amounts - the main currency storage.
     * Backed by empire data for persistence.
     */
    private readonly currencies: CurrencyMap;

    /**
     * Highest amounts ever reached for each currency.
     * Used for achievements and statistics.
     */
    private readonly mostCurrencies: CurrencyMap;

    /**
     * Highest amounts reached since the last reset.
     * Used for offline revenue calculations.
     */
    private readonly mostCurrenciesSinceReset: CurrencyMap;

    // Public Interface

    /**
     * Public interface for currency balance operations.
     * Provides a convenient API for currency manipulation.
     */
    readonly balance: CurrencyBundle;

    /**
     * Signal fired when currency balances change.
     * Used by other systems to react to currency updates.
     */
    readonly balanceChanged = new Signal<(balance: CurrencyBundle) => void>();

    /**
     * Last propagated currency state for change detection.
     * Prevents unnecessary network updates when currencies haven't changed.
     */
    lastPropagation?: CurrencyMap;

    /**
     * Initializes the CurrencyService with data from DataService.
     * Sets up currency maps and creates the public balance interface.
     * 
     * @param dataService Service providing persistent empire data.
     */
    constructor(private dataService: DataService) {
        // Wrap empire data maps for reactive updates
        this.currencies = CurrencyMap.wrap(dataService.empireData.currencies);
        this.mostCurrencies = CurrencyMap.wrap(dataService.empireData.mostCurrencies);
        this.mostCurrenciesSinceReset = CurrencyMap.wrap(dataService.empireData.mostCurrenciesSinceReset);

        // Create public balance interface
        this.balance = new CurrencyBundle(this.currencies, true);
    }

    // Currency Access Methods

    /**
     * Gets the current amount of a specific currency.
     * 
     * @param currency The currency type to retrieve.
     * @returns The current amount, or zero if not found.
     */
    get(currency: Currency) {
        return this.balance.get(currency) ?? ZERO;
    }

    /**
     * Sets the amount of a specific currency.
     * 
     * @param currency The currency type to set.
     * @param amount The new amount (undefined to remove currency).
     */
    set(currency: Currency, amount: OnoeNum | undefined) {
        this.balance.set(currency, amount);
    }

    /**
     * Increases a currency by a specific amount.
     * 
     * @param currency The currency type to increment.
     * @param delta The amount to add.
     */
    increment(currency: Currency, delta: OnoeNum) {
        return this.set(currency, this.get(currency).add(delta));
    }

    /**
     * Replaces all currencies with the provided currency map.
     * Clears existing currencies and sets new values.
     * 
     * @param currencies The new currency amounts to set.
     */
    setAll(currencies: CurrencyMap) {
        this.currencies.clear();
        for (const [currency, amount] of currencies) {
            this.currencies.set(currency, amount);
        }
    }

    // Transaction Methods

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

    /**
     * Increments multiple currencies at once.
     * 
     * @param delta Map of currencies and amounts to add.
     */
    incrementAll(delta: CurrencyMap) {
        for (const [currency, amount] of delta) {
            this.increment(currency, amount);
        }
    }

    /**
     * Attempts to purchase something with the given price.
     * Deducts currencies if affordable and not marked as free.
     * 
     * @param price The cost of the purchase.
     * @param isFree Whether the purchase should be free (no currency deduction).
     * @returns Whether the purchase was successful.
     */
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

    // Synchronization Methods

    /**
     * Propagates currency changes to clients.
     * Only sends updates when currencies have actually changed to optimize network usage.
     */
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
     * @param t Current time (defaults to current tick).
     * @returns Revenue generated per second.
     */
    getOfflineRevenue(t = tick()) {
        return new CurrencyBundle(this.mostCurrenciesSinceReset).div(t - this.dataService.empireData.lastReset);
    }

    // Lifecycle Methods

    /**
     * Initializes the currency service.
     * Sets up revenue tracking queues and starts the main currency update loop.
     */
    onInit() {
        // Create revenue tracking queues for each currency
        const queuePerCurrency = new Map<Currency, Queue>();
        for (const currency of CURRENCIES) {
            queuePerCurrency.set(currency, new Queue());
        }

        // Main currency update loop - runs every second
        task.spawn(() => {
            while (task.wait(1)) {
                const revenue = new Map<Currency, OnoeNum>();

                for (const [currency, amount] of this.currencies) {
                    // Remove invalid currencies
                    if (CURRENCY_DETAILS[currency] === undefined) {
                        this.currencies.delete(currency);
                        continue;
                    }

                    // Update all-time maximum
                    const most = this.mostCurrencies.get(currency);
                    if (most === undefined || amount.moreThan(most)) {
                        this.mostCurrencies.set(currency, amount);
                    }

                    // Update maximum since reset
                    const mostSinceReset = this.mostCurrenciesSinceReset.get(currency);
                    if (mostSinceReset === undefined || amount.moreThan(mostSinceReset)) {
                        this.mostCurrenciesSinceReset.set(currency, amount);
                    }

                    // Calculate revenue using queue averaging
                    const queue = queuePerCurrency.get(currency);
                    if (queue === undefined) {
                        continue;
                    }
                    queue.addToQueue(amount);
                    revenue.set(currency, queue.getAverageGain());
                }

                // Propagate updates to clients
                Packets.mostBalance.set(this.mostCurrencies);
                Packets.revenue.set(revenue);
            }
        });
    }

    /**
     * Starts the currency service.
     * Begins the high-frequency balance propagation loop.
     */
    onStart() {
        // High-frequency balance propagation loop - runs every 0.1 seconds
        task.spawn(() => {
            while (task.wait(0.1)) {
                this.propagate();
            }
        });
    }
}