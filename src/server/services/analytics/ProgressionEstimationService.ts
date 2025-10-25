//!native
//!optimize 2

/**
 * @fileoverview Estimates game progression and item acquisition times.
 *
 * This service provides:
 * - Calculating time to obtain items based on revenue and requirements
 * - Simulating optimal progression paths and upgrade purchases
 * - Posting progression reports to Discord and in-game
 * - Utility methods for revenue, price, and item calculations
 *
 * @since 1.0.0
 */

import { getAllInstanceInfo } from "@antivivi/vrldk";
import { OnStart, Service } from "@flamework/core";
import Difficulty from "@rbxts/ejt";
import { OnoeNum } from "@rbxts/serikanum";
import { HttpService, RunService, Workspace } from "@rbxts/services";
import StringBuilder from "@rbxts/stringbuilder";
import { Environment } from "@rbxts/ui-labs";
import { $env } from "rbxts-transform-env";
import ResetService from "server/services/ResetService";
import RevenueService from "server/services/RevenueService";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import NamedUpgradeService from "server/services/data/NamedUpgradeService";
import Packets from "shared/Packets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCIES } from "shared/currency/CurrencyDetails";
import CurrencyMap from "shared/currency/CurrencyMap";
import { RESET_LAYERS } from "shared/currency/mechanics/ResetLayer";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";
import { IOperative } from "shared/item/traits/Operative";
import Charger from "shared/item/traits/generator/Charger";
import Generator from "shared/item/traits/generator/Generator";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import VoidSkyUpgrader from "shared/items/0/happylike/VoidSkyUpgrader";
import SlamoStore from "shared/items/0/millisecondless/SlamoStore";
import Items from "shared/items/Items";
import AwesomeManumaticPurifier from "shared/items/negative/felixthea/AwesomeManumaticPurifier";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

const FURNACE_UPGRADES = NamedUpgrades.getUpgrades("Furnace");

declare global {
    interface Assets {}

    interface _G {
        ProgressEstimated?: (message: string) => void;
        ProgressionEstimateItem?: (itemId: string) => ItemEstimateSummary | undefined;
    }
}

type ItemProgressionStats = {
    revenue: CurrencyBundle;
    priceLabel?: string;
    item?: Item;
    timeToObtain?: OnoeNum;
    limitingCurrency?: Currency;
};

type ItemEstimateSummary = {
    itemId: string;
    itemName: string;
    iteration: number;
    priceLabel: string;
    timeToObtain: string;
    cumulativeTime: string;
    limitingCurrency?: Currency;
    revenuePerCurrency: Record<string, string>;
};

type ProfilingStats = {
    calculateRevenueTime: number;
    calculateRevenueCount: number;
    getNextItemTime: number;
    getNextItemCount: number;
    findShopTime: number;
    findShopCount: number;
    // Deeper profiling for calculateRevenue
    calcRevFirstLoopTime: number;
    calcRevSecondLoopTime: number;
    calcRevDropletLoopTime: number;
    calcRevChargerTime: number;
    calcRevOtherTime: number;
    // Even deeper for droplet loop
    dropletGetInstanceInfoTime: number;
    dropletSetUpgradesTime: number;
    dropletCalculateValueTime: number;
    dropletApplyFurnacesTime: number;
};

const stripOperativeToOneCurrency = (operative: IOperative, currency: Currency) => {
    const newOperative = {} as IOperative;
    const addValue = operative.add?.get(currency);
    if (addValue !== undefined) {
        newOperative.add = new CurrencyBundle().set(currency, addValue);
    }
    const mulValue = operative.mul?.get(currency);
    if (mulValue !== undefined) {
        newOperative.mul = new CurrencyBundle().set(currency, mulValue);
    }
    const powValue = operative.pow?.get(currency);
    if (powValue !== undefined) {
        newOperative.pow = new CurrencyBundle().set(currency, powValue);
    }

    return newOperative;
};

/**
 * Service that estimates progression, calculates optimal paths, and posts reports.
 */
@Service()
export default class ProgressionEstimationService implements OnStart {
    /**
     * Map of Droplet to their corresponding model instance in Workspace.
     * Used for simulating droplet upgrades and value calculations.
     */
    readonly MODEL_PER_DROPLET = new Map<Droplet, BasePart>();

    private profilingStats: ProfilingStats = {
        calculateRevenueTime: 0,
        calculateRevenueCount: 0,
        getNextItemTime: 0,
        getNextItemCount: 0,
        findShopTime: 0,
        findShopCount: 0,
        calcRevFirstLoopTime: 0,
        calcRevSecondLoopTime: 0,
        calcRevDropletLoopTime: 0,
        calcRevChargerTime: 0,
        calcRevOtherTime: 0,
        dropletGetInstanceInfoTime: 0,
        dropletSetUpgradesTime: 0,
        dropletCalculateValueTime: 0,
        dropletApplyFurnacesTime: 0,
    };

    private operativeCache: { add: CurrencyBundle; mul: CurrencyBundle; pow: CurrencyBundle } | undefined;

    constructor(
        private revenueService: RevenueService,
        private currencyService: CurrencyService,
        private namedUpgradeService: NamedUpgradeService,
        private dataService: DataService,
        private resetService: ResetService,
    ) {}

    private serializeCurrencyBundle(bundle: CurrencyBundle) {
        const record: Record<string, string> = {};
        for (const [currency, amount] of bundle.amountPerCurrency) {
            record[currency] = amount.toString();
        }
        return record;
    }

    private withSimulatedState<T>(callback: () => T): T {
        const toRecoverCurrencies = this.currencyService.balance.clone();
        const toRecoverUpgrades = table.clone(this.dataService.empireData.upgrades);
        const previousWeatherBoost = this.revenueService.weatherBoostEnabled;

        this.revenueService.weatherBoostEnabled = false;
        this.currencyService.setAll(new Map());
        this.namedUpgradeService.setAmountPerUpgrade(new Map());

        this.MODEL_PER_DROPLET.clear();
        for (const droplet of Droplet.DROPLETS) {
            this.MODEL_PER_DROPLET.set(droplet, droplet.getInstantiator(Workspace)());
        }

        // Reset profiling stats
        this.profilingStats = {
            calculateRevenueTime: 0,
            calculateRevenueCount: 0,
            getNextItemTime: 0,
            getNextItemCount: 0,
            findShopTime: 0,
            findShopCount: 0,
            calcRevFirstLoopTime: 0,
            calcRevSecondLoopTime: 0,
            calcRevDropletLoopTime: 0,
            calcRevChargerTime: 0,
            calcRevOtherTime: 0,
            dropletGetInstanceInfoTime: 0,
            dropletSetUpgradesTime: 0,
            dropletCalculateValueTime: 0,
            dropletApplyFurnacesTime: 0,
        };

        this.operativeCache = undefined;

        let result: T;
        try {
            result = callback();
        } finally {
            this.revenueService.weatherBoostEnabled = previousWeatherBoost;
            this.currencyService.setAll(toRecoverCurrencies.amountPerCurrency);
            this.namedUpgradeService.setAmountPerUpgrade(toRecoverUpgrades);
        }

        for (const [, model] of this.MODEL_PER_DROPLET) {
            model.Destroy();
        }
        this.MODEL_PER_DROPLET.clear();

        return result;
    }

    private simulateSingleItem(target: Item): ItemEstimateSummary | undefined {
        const inventory = new Map<Item, number>();
        for (const [_, item] of Items.itemsPerId) {
            const freeIterations = this.getFreeIterations(item);
            if (freeIterations > 0) {
                inventory.set(item, freeIterations);
            }
        }
        const bought = table.clone(inventory);

        let lastRevenue = new CurrencyBundle();
        let totalTime = new OnoeNum(0);
        let steps = 0;
        const MAX_STEPS = 10000;

        while (steps < MAX_STEPS) {
            steps++;
            const stats = this.getNextItem(inventory, bought, lastRevenue);
            if (stats.item === undefined || stats.timeToObtain === undefined) {
                break;
            }

            lastRevenue = stats.revenue;
            totalTime = totalTime.add(stats.timeToObtain);

            const purchasedItem = stats.item;
            inventory.set(purchasedItem, (inventory.get(purchasedItem) ?? 0) + 1);
            bought.set(purchasedItem, (bought.get(purchasedItem) ?? 0) + 1);

            for (const [requiredItemId, amount] of purchasedItem.requiredItems) {
                const requiredItem = Items.getItem(requiredItemId);
                if (requiredItem === undefined) continue;
                inventory.set(requiredItem, (inventory.get(requiredItem) ?? 0) - amount);
            }

            if (purchasedItem.findTrait("Upgrader") !== undefined) {
                this.operativeCache = undefined;
                this.revenueService.clearUpgraderCache();
            }

            if (purchasedItem === target) {
                const iteration = bought.get(target) ?? 0;
                return {
                    itemId: target.id,
                    itemName: target.name,
                    iteration,
                    priceLabel: stats.priceLabel ?? "N/A",
                    timeToObtain: stats.timeToObtain.toString(),
                    cumulativeTime: totalTime.toString(),
                    limitingCurrency: stats.limitingCurrency,
                    revenuePerCurrency: this.serializeCurrencyBundle(stats.revenue),
                } satisfies ItemEstimateSummary;
            }
        }

        return undefined;
    }

    getSingleItemEstimate(itemId: string): ItemEstimateSummary | undefined {
        const item = Items.getItem(itemId);
        if (item === undefined) {
            return undefined;
        }

        return this.withSimulatedState(() => this.simulateSingleItem(item));
    }

    /**
     * Checks if a price is free (all currencies are zero).
     *
     * @param price The price bundle to check.
     */
    isPriceFree(price: CurrencyBundle) {
        for (const [_, amount] of price.amountPerCurrency) {
            if (amount.moreThan(0)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Gets the highest iteration of an item that is free.
     *
     * @param item The item to check.
     */
    getFreeIterations(item: Item) {
        let highestIteration = 0;
        for (const [iteration, price] of item.pricePerIteration) {
            if (this.isPriceFree(price) && iteration > highestIteration) {
                highestIteration = iteration;
            }
        }
        // if (item.defaultPrice !== undefined && this.isPriceFree(item.defaultPrice)) {
        //     highestIteration = math.max(highestIteration, 10);
        // }
        return highestIteration;
    }

    /**
     * Calculates the minimum time to obtain a specified revenue with the specified price.
     * Returns a tuple of (max time, limiting currency) or undefined if not possible.
     *
     * @param revenue The revenue per second.
     * @param price The price to reach.
     */
    getTimeToReachPrice(revenue: CurrencyBundle, price: CurrencyBundle) {
        let maxTime = new OnoeNum(0);
        let limitingCurrency: Currency | undefined;
        for (const [currency, amount] of price.amountPerCurrency) {
            const revenueAmount = revenue.get(currency);
            if (revenueAmount === undefined || revenueAmount.lessEquals(0)) return $tuple(undefined, undefined); // revenue cannot generate this currency, impossible to obtain

            const t = amount.div(revenueAmount);
            if (t.moreThan(maxTime)) {
                maxTime = t;
                limitingCurrency = currency;
            }
        }
        return $tuple(maxTime, limitingCurrency);
    }

    /**
     * Finds the shop that sells a given item.
     *
     * @param targetItem The item to find a shop for.
     * @returns The shop item that sells the target item, or undefined if no shop is found.
     */
    findShopForItem(targetItem: Item): Item | undefined {
        const startTime = os.clock();
        for (const [_, shopItem] of Items.itemsPerId) {
            const shop = shopItem.findTrait("Shop");
            if (shop !== undefined) {
                for (const item of shop.items) {
                    if (item === targetItem) {
                        this.profilingStats.findShopTime += os.clock() - startTime;
                        this.profilingStats.findShopCount++;
                        return shopItem;
                    }
                }
            }
        }
        this.profilingStats.findShopTime += os.clock() - startTime;
        this.profilingStats.findShopCount++;
        return undefined;
    }

    /**
     * Finds the next obtainable item and time to obtain it, given inventory and revenue.
     *
     * @param inventory Map of items and their amounts.
     * @param bought Map of items and their bought amounts.
     * @param revenue Current revenue bundle.
     */
    getNextItem(
        inventory: Map<Item, number>,
        bought: Map<Item, number>,
        revenue: CurrencyBundle,
    ): ItemProgressionStats {
        const startTime = os.clock();
        let nextItem: Item | undefined;
        let timeToObtain: OnoeNum | undefined;
        let limitingCurrency: Currency | undefined;
        let nextPrice: CurrencyBundle | undefined;
        revenue = this.calculateRevenue(inventory, revenue.mulConstant(500));

        // find time to obtain other items
        for (const [_, item] of Items.itemsPerId) {
            // check if item is already at the maximum amount
            const currentAmount = bought.get(item) ?? 0;
            const nextIteration = currentAmount === undefined ? 1 : currentAmount + 1;
            let price = item.pricePerIteration.get(nextIteration);
            if (price === undefined) {
                if (nextIteration > 1 && item.defaultPrice !== undefined)
                    // prevent infinite loop
                    continue;
                price = item.defaultPrice;
                if (price === undefined) continue;
            }

            // check if required items is in items
            let canObtain = true;
            for (const [requiredItemId, requiredAmount] of item.requiredItems) {
                const requiredItem = Items.getItem(requiredItemId);
                if (requiredItem === undefined) continue;
                if (!inventory.has(requiredItem) || inventory.get(requiredItem)! < requiredAmount) {
                    canObtain = false;
                    break;
                }
            }
            if (!canObtain) continue;

            // check if required shop is available (negative shop is always available)
            const requiredShop = this.findShopForItem(item);
            if (
                requiredShop !== undefined &&
                requiredShop.difficulty.id !== Difficulty.TheFirstDifficulty.id &&
                requiredShop.id !== SlamoStore.id
            ) {
                if (!inventory.has(requiredShop)) {
                    canObtain = false;
                    continue;
                }
            }

            const [t, limiting] = this.getTimeToReachPrice(revenue, price);
            if (t === undefined || t.moreThan(1e6)) continue;
            limitingCurrency = limiting;
            if (timeToObtain === undefined || t.lessThan(timeToObtain)) {
                timeToObtain = t;
                nextItem = item;
                nextPrice = price;
            }
        }
        this.profilingStats.getNextItemTime += os.clock() - startTime;
        this.profilingStats.getNextItemCount++;
        return { revenue, priceLabel: nextPrice?.toString() ?? "N/A", item: nextItem, timeToObtain, limitingCurrency };
    }

    /**
     * Buys all upgrades in the provided list, using free purchases.
     *
     * @param upgrades List of upgrade IDs.
     */
    maxUpgradeBoard(upgrades: string[]) {
        for (const id of upgrades) {
            const purchase = () => this.namedUpgradeService.buyUpgrade(id, undefined, undefined, true);
            let i = 0;
            while (purchase()) {
                i++;
                if (i > 1000) {
                    warn(`Max upgrade loop detected for ${id}`);
                    break;
                }
            }
        }
    }

    /**
     * Finds the progression path of the game, sorting by shortest to longest time to obtain the next item.
     *
     * @returns An array of item progression statistics.
     */
    getProgression() {
        // start with free items
        const inventory = new Map<Item, number>();
        for (const [_, item] of Items.itemsPerId) {
            const freeIterations = this.getFreeIterations(item);
            if (freeIterations > 0) {
                inventory.set(item, freeIterations);
            }
        }
        const bought = table.clone(inventory);

        let lastRevenue = new CurrencyBundle();
        let totalTime = new OnoeNum(0);
        const allStats = new Array<ItemProgressionStats>();
        const progress = () => {
            const stats = this.getNextItem(inventory, bought, lastRevenue);
            const item = stats.item;
            if (item === undefined || stats.timeToObtain === undefined) return allStats;
            allStats.push(stats);
            lastRevenue = stats.revenue;

            inventory.set(item, (inventory.get(item) ?? 0) + 1);
            bought.set(item, (bought.get(item) ?? 0) + 1);
            for (const [requiredItemId, amount] of item.requiredItems) {
                const requiredItem = Items.getItem(requiredItemId);
                if (requiredItem === undefined) continue;
                inventory.set(requiredItem, inventory.get(requiredItem)! - amount);
            }
            if (item.findTrait("Upgrader") !== undefined) {
                this.operativeCache = undefined;
                this.revenueService.clearUpgraderCache();
            }
            totalTime = totalTime.add(stats.timeToObtain);

            return progress();
        };
        return progress();
    }

    /**
     * Calculates the revenue generated by the specified items if optimally used.
     * Simulates droplet upgrades, generators, furnaces, and reset layers.
     *
     * @param items Items and their amounts.
     * @param balance The balance to emulate for calculations.
     */
    calculateRevenue(items: Map<Item, number>, balance: CurrencyBundle) {
        const startTime = os.clock();
        this.currencyService.setAll(balance.amountPerCurrency);

        const droplets = new Map<Droplet, number>();
        const upgrades = new Set<UpgradeInfo>();
        const damagePerCurrency = new Map<Currency, number>();
        const furnacePerCurrency = new Map<Currency, Furnace>();
        const cauldronPerCurrency = new Map<Currency, Furnace>();
        const condension = new CurrencyBundle();
        const namedUpgrades = new Array<string>();

        const currencies = new Set<Currency>();

        let generatorRevenue = new CurrencyBundle();
        if (items.has(AwesomeManumaticPurifier)) {
            generatorRevenue = generatorRevenue.add(new CurrencyBundle().set("Purifier Clicks", 1)); // assume the player is clicking the purifier
        }
        let canUpgradeInCauldrons = items.has(VoidSkyUpgrader);

        const bestChargersPerCurrency = new Map<Currency, Charger[]>();
        const supplementaryChargers = new Set<Charger>();

        for (const currency of CURRENCIES) {
            currencies.add(currency);
            damagePerCurrency.set(currency, 0);
        }

        // first check
        const firstLoopStart = os.clock();
        for (const [item, amount] of items) {
            item.performFormula();

            const dropper = item.findTrait("Dropper");
            if (dropper !== undefined) {
                const droplet = dropper.droplet;
                if (droplet !== undefined) {
                    let dropRate = droplets.get(droplet) ?? 0;
                    if (dropper.item.id === "DropDropper") {
                        dropRate = 10;
                    } else {
                        dropRate += dropper.dropRate * amount;
                    }
                    droplets.set(droplet, dropRate);
                }
            }

            const damager = item.findTrait("Damager");
            const upgrader = item.findTrait("Upgrader");

            if (damager !== undefined) {
                const damage = damager.damage * amount;
                for (const currency of upgrader?.getCurrencies() ?? currencies) {
                    damagePerCurrency.set(currency, damagePerCurrency.get(currency)! + damage);
                }
            }

            if (upgrader !== undefined) {
                for (let i = 0; i < amount; i++) {
                    upgrades.add({
                        model: Workspace,
                        boost: upgrader,
                    });
                }
            }

            const furnace = item.findTrait("Furnace");
            if (furnace !== undefined) {
                for (const currency of furnace.getCurrencies()) {
                    const toModify: Map<Currency, Furnace> =
                        furnace.isCauldron === false ? cauldronPerCurrency : furnacePerCurrency;
                    const previous = toModify.get(currency);
                    if (previous === undefined || previous.lessThan(furnace, currency)) {
                        toModify.set(currency, furnace);
                    }
                }
            }

            const generator = item.findTrait("Generator");
            if (generator !== undefined) {
                const passiveGain = generator.passiveGain;
                if (passiveGain !== undefined) {
                    const value = Generator.getValue(1, passiveGain, new Map());
                    CurrencyMap.mulConstant(value.amountPerCurrency, amount, true);
                    CurrencyMap.add(generatorRevenue.amountPerCurrency, value.amountPerCurrency, true);
                }
            }

            const charger = item.findTrait("Charger");
            if (charger !== undefined) {
                for (const currency of charger.getCurrencies()) {
                    const chargers = bestChargersPerCurrency.get(currency);
                    if (chargers === undefined) {
                        bestChargersPerCurrency.set(currency, [charger]);
                        continue;
                    }
                    if (charger.ignoreLimit) {
                        supplementaryChargers.add(charger);
                        continue;
                    }

                    if (chargers[1] === undefined || chargers[1].lessThan(charger, currency)) {
                        chargers[1] = charger;
                        continue;
                    }

                    if (chargers[0] === undefined || chargers[0].lessThan(charger, currency)) {
                        chargers[0] = charger;
                        continue;
                    }
                }
            }

            const clicker = item.findTrait("Clicker");
            if (clicker !== undefined) {
                generatorRevenue = generatorRevenue.add(
                    new CurrencyBundle().set("Purifier Clicks", clicker.getCPS() * amount),
                );
            }

            const upgradeBoard = item.findTrait("UpgradeBoard");
            if (upgradeBoard !== undefined) {
                for (const upgrade of upgradeBoard.upgrades) {
                    namedUpgrades.push(upgrade.id);
                }
            }

            const condenser = item.findTrait("Condenser");
            if (condenser !== undefined) {
                for (const [currency, _] of condenser.totalValue.amountPerCurrency) {
                    const previous = condension.get(currency) ?? new OnoeNum(1);
                    if (previous.moreThan(condenser.quota)) {
                        condension.set(currency, condenser.quota);
                    }
                }
            }
        }
        this.profilingStats.calcRevFirstLoopTime += os.clock() - firstLoopStart;
        this.maxUpgradeBoard(namedUpgrades);

        // second check
        const secondLoopStart = os.clock();
        for (const [item, amount] of items) {
            const transformer = item.findTrait("Transformer");
            if (transformer !== undefined) {
                for (const [droplet, dropRate] of droplets) {
                    const result = transformer.getResult(droplet);
                    if (result === undefined) continue;
                    if (result.value.canAfford(droplet.value.amountPerCurrency)) {
                        droplets.delete(droplet);
                        let resultDropRate = droplets.get(result) ?? 0;
                        resultDropRate += dropRate;
                        droplets.set(result, resultDropRate);
                    }
                }
            }
        }
        this.profilingStats.calcRevSecondLoopTime += os.clock() - secondLoopStart;

        let revenue = new CurrencyBundle();

        // calculate droplets and its upgrades
        const dropletLoopStart = os.clock();
        for (const [droplet, dropRate] of droplets) {
            const getInstanceStart = os.clock();
            const dropletModel = this.MODEL_PER_DROPLET.get(droplet)!;
            const instanceInfo = getAllInstanceInfo(dropletModel);
            this.profilingStats.dropletGetInstanceInfoTime += os.clock() - getInstanceStart;

            const setUpgradesStart = os.clock();
            const dropletUpgrades = new Map<string, UpgradeInfo>();
            instanceInfo.upgrades = dropletUpgrades;
            let i = 0;
            for (const upgrade of upgrades) {
                dropletUpgrades.set(tostring(i), upgrade);
                i++;
            }
            instanceInfo.health = 100; // override health check to make our own damage calculations
            this.profilingStats.dropletSetUpgradesTime += os.clock() - setUpgradesStart;

            const calcValueStart = os.clock();
            const resultWithUpgraders = this.revenueService.calculateDropletValue(dropletModel);
            const resultWithoutUpgraders = this.revenueService.calculateDropletValue(dropletModel);
            resultWithUpgraders.markAsCauldron();

            resultWithUpgraders.applySource();
            resultWithoutUpgraders.applySource();

            this.profilingStats.dropletCalculateValueTime += os.clock() - calcValueStart;

            const applyFurnacesStart = os.clock();
            for (const [currency] of CurrencyBundle.SORTED_DETAILS) {
                const furnace = furnacePerCurrency.get(currency);
                const cauldron = cauldronPerCurrency.get(currency);

                if (furnace) {
                    resultWithUpgraders.applyOperative(stripOperativeToOneCurrency(furnace, currency));
                }

                if (cauldron) {
                    resultWithoutUpgraders.applyOperative(stripOperativeToOneCurrency(cauldron, currency));
                }
            }

            resultWithUpgraders.applyFinal();
            resultWithoutUpgraders.applyFinal();

            const amountWithUpgraders = resultWithUpgraders.coalesce();
            const amountWithoutUpgraders = resultWithoutUpgraders.coalesce();

            const value = new CurrencyBundle();
            for (const [currency] of CurrencyBundle.SORTED_DETAILS) {
                const withUpgraders = amountWithUpgraders.get(currency);
                const withoutUpgraders = amountWithoutUpgraders.get(currency);

                if (withUpgraders === undefined) {
                    if (withoutUpgraders !== undefined) {
                        value.set(currency, withoutUpgraders);
                    }
                    continue;
                }

                if (withoutUpgraders === undefined) {
                    if (withUpgraders !== undefined) {
                        value.set(currency, withUpgraders);
                    }
                    continue;
                }

                value.set(currency, OnoeNum.max(withUpgraders, withoutUpgraders));
            }

            this.profilingStats.dropletApplyFurnacesTime += os.clock() - applyFurnacesStart;

            revenue = revenue.add(value.div(condension).mulConstant(dropRate));
        }
        this.profilingStats.calcRevDropletLoopTime += os.clock() - dropletLoopStart;
        const chargerStart = os.clock();
        for (let [currency, amount] of generatorRevenue.amountPerCurrency) {
            const chargers = bestChargersPerCurrency.get(currency);
            if (chargers !== undefined) {
                for (const charger of chargers) {
                    amount = charger.apply(new CurrencyBundle().set(currency, amount)).get(currency)!;
                }
            }
            for (const charger of supplementaryChargers) {
                amount = charger.apply(new CurrencyBundle().set(currency, amount)).get(currency)!;
            }
            generatorRevenue.set(currency, amount);
        }
        this.profilingStats.calcRevChargerTime += os.clock() - chargerStart;
        revenue = revenue.add(generatorRevenue);

        // lastly, account for reset layer gains
        const otherStart = os.clock();
        for (const [_, resetLayer] of pairs(RESET_LAYERS)) {
            const reward = this.resetService.getResetReward(resetLayer);
            if (reward === undefined) continue;
            revenue = revenue.add(reward.divConstant(500));
        }
        this.profilingStats.calcRevOtherTime += os.clock() - otherStart;

        this.profilingStats.calculateRevenueTime += os.clock() - startTime;
        this.profilingStats.calculateRevenueCount++;
        return revenue;
    }

    estimate() {
        const dt = this.withSimulatedState(() => {
            const t = os.clock();
            const progression = this.getProgression();
            const builder = new StringBuilder();
            let itemIteration = 1;
            const ttoList: Array<{ item: Item; tto: OnoeNum }> = [];

            for (const stats of progression) {
                const item = stats.item;
                const timeToObtain = stats.timeToObtain;
                if (item === undefined || timeToObtain === undefined) continue;
                builder.append(itemIteration);
                builder.append(". **");
                builder.append(item.name);
                builder.append("** from ");
                builder.append(item.difficulty.name);
                builder.append("\n\t> **");
                builder.append(timeToObtain.toString());
                builder.append("s** TTO at price ");
                builder.append(stats.priceLabel);
                builder.append(". (Limiting: **");
                builder.append(stats.limitingCurrency);
                builder.append("**)");
                if (timeToObtain.moreThan(1000)) {
                    builder.append(`\n\t> **LONG**`);
                }

                if (item.formula !== undefined) {
                    builder.append(`\n\t> Formula Result = ${item.formulaResult}`);
                    const upgrader = item.findTrait("Upgrader");
                    if (upgrader?.mul !== undefined) {
                        builder.append(`\n\t> Upgrader = ${upgrader.mul}`);
                    }
                }

                builder.append("\n");
                itemIteration++;
                ttoList.push({ item: item, tto: timeToObtain });
            }
            builder.append(`\n\n`);

            if (!ttoList.isEmpty()) {
                ttoList.sort((a, b) => a.tto.moreThan(b.tto));
                builder.append(`-# Top 10 Highest Time-To-Obtain (TTO) Items:\n`);
                for (let i = 0; i < math.min(10, ttoList.size()); i++) {
                    const entry = ttoList[i];
                    builder.append(`  ${i + 1}. **${entry.item.name}**: ${entry.tto.toString()}s\n`);
                }
            }

            builder.append(
                `-# Note that this is a rough estimate and does not account for all mechanics in the game.\n`,
            );
            const dtInner = math.floor((os.clock() - t) * 100) / 100;

            // Add profiling information
            builder.append(`\n## Performance Profiling\n`);
            builder.append(`- Total time: ${dtInner}s\n`);
            builder.append(
                `- calculateRevenue: ${math.floor(this.profilingStats.calculateRevenueTime * 100) / 100}s (${
                    this.profilingStats.calculateRevenueCount
                } calls, avg ${
                    math.floor(
                        (this.profilingStats.calculateRevenueTime / this.profilingStats.calculateRevenueCount) * 10000,
                    ) / 10000
                }s/call)\n`,
            );
            builder.append(
                `  - First item loop: ${math.floor(this.profilingStats.calcRevFirstLoopTime * 100) / 100}s\n`,
            );
            builder.append(
                `  - Second item loop: ${math.floor(this.profilingStats.calcRevSecondLoopTime * 100) / 100}s\n`,
            );
            builder.append(
                `  - Droplet loop: ${math.floor(this.profilingStats.calcRevDropletLoopTime * 100) / 100}s\n`,
            );
            builder.append(
                `    - Get instance info: ${math.floor(this.profilingStats.dropletGetInstanceInfoTime * 100) / 100}s\n`,
            );
            builder.append(
                `    - Set upgrades: ${math.floor(this.profilingStats.dropletSetUpgradesTime * 100) / 100}s\n`,
            );
            builder.append(
                `    - Calculate value: ${math.floor(this.profilingStats.dropletCalculateValueTime * 100) / 100}s\n`,
            );
            builder.append(
                `    - Apply furnaces: ${math.floor(this.profilingStats.dropletApplyFurnacesTime * 100) / 100}s\n`,
            );
            builder.append(
                `  - Charger application: ${math.floor(this.profilingStats.calcRevChargerTime * 100) / 100}s\n`,
            );
            builder.append(
                `  - Other (reset layers): ${math.floor(this.profilingStats.calcRevOtherTime * 100) / 100}s\n`,
            );
            builder.append(
                `- getNextItem: ${math.floor(this.profilingStats.getNextItemTime * 100) / 100}s (${
                    this.profilingStats.getNextItemCount
                } calls, avg ${
                    math.floor((this.profilingStats.getNextItemTime / this.profilingStats.getNextItemCount) * 10000) /
                    10000
                }s/call)\n`,
            );
            builder.append(
                `- findShopForItem: ${math.floor(this.profilingStats.findShopTime * 100) / 100}s (${
                    this.profilingStats.findShopCount
                } calls, avg ${
                    math.floor((this.profilingStats.findShopTime / this.profilingStats.findShopCount) * 10000) / 10000
                }s/call)\n`,
            );
            const otherTime =
                dtInner -
                this.profilingStats.calculateRevenueTime -
                this.profilingStats.getNextItemTime -
                this.profilingStats.findShopTime;
            builder.append(`- Other operations: ${math.floor(otherTime * 100) / 100}s\n`);
            builder.append(`\n`);

            for (const [id, amount] of this.namedUpgradeService.upgrades) {
                builder.append(`- Simulated named upgrade: ${id} x${amount}\n`);
            }
            for (const [id, resetLayer] of pairs(RESET_LAYERS)) {
                const reward = this.resetService.getResetReward(resetLayer);
                if (reward === undefined) continue;
                builder.append(`- Simulated reset layer: ${id} (Reward: ${reward})\n`);
            }

            builder.append(`-# Calculated in ${dtInner} seconds.\n`);

            this.post(builder.toString());

            return dtInner;
        });

        print(`Calculated in ${dt} seconds.`);
    }

    /**
     * Runs the progression estimation and posts the report if in the PROGRESSION empire.
     */
    onStart() {
        Environment.OriginalG.ProgressionEstimateItem = (itemId: string) => this.getSingleItemEstimate(itemId);
        Packets.progressEstimationRequest.fromClient(() => {
            if (RunService.IsStudio()) {
                this.estimate();
            }
        });
    }

    /**
     * Encodes a record as a URL-encoded string for HTTP POST.
     *
     * @param data The data to encode.
     */
    private encode(data: Record<string, unknown>): string {
        let str = "";
        for (const [key, value] of pairs(data)) {
            if (!value) continue;
            str += `&${HttpService.UrlEncode(key)}=${HttpService.UrlEncode(`${value}`)}`;
        }
        return str.sub(2);
    }

    /**
     * Posts a progression report to Discord and Workspace.
     *
     * @param message The report message.
     */
    post(message: string) {
        Environment.OriginalG.ProgressEstimated?.(message);

        const webhookUrl = $env.string("PROGRESSION_WEBHOOK");
        if (webhookUrl === undefined) {
            warn("PROGRESSION_WEBHOOK is not set, skipping posting to Discord.");
            return;
        }

        const timestamp = os.date("%Y-%m-%dT%H:%M:%S");
        const pasteUrl = `https://dpaste.com/api/v2/`;
        const data = {
            content: message,
            syntax: "md",
            title: `Progression Estimation Report ${timestamp}`,
            expiry_days: 7,
        };

        const response = HttpService.PostAsync(pasteUrl, this.encode(data), Enum.HttpContentType.ApplicationUrlEncoded);
        print(`Progression estimation report posted to ${response}`);

        const quotes = [
            `i love boxing`,
            `i glove boxing`,
            `eye of oxen`,
            `aisle of bo xing`,
            `high glove locks in`,
            `i loaf oxen`,
            `isle of poxing`,
            `i shove docks in`,
            `i love socks in`,
            `i love bach sing`,
        ];

        HttpService.PostAsync(
            webhookUrl,
            HttpService.JSONEncode({
                content: `${quotes[math.random(0, quotes.size() - 1)]}\n${response.sub(1, -2)}-preview`,
                embeds: [
                    {
                        title: "Progression Estimation Report",
                        description: `Report dumped at ${response}`,
                        color: 0xff0000,
                        timestamp: timestamp,
                    },
                ],
            }),
        );
    }
}
