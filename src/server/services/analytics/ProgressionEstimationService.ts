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
import { Service } from "@flamework/core";
import { OnoeNum } from "@rbxts/serikanum";
import { HttpService, Workspace } from "@rbxts/services";
import { Environment } from "@rbxts/ui-labs";
import ResetService from "server/services/ResetService";
import RevenueService from "server/services/RevenueService";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import NamedUpgradeService from "server/services/data/NamedUpgradeService";
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
import VoidSkyUpgrader from "shared/items/0/happylike/VoidSkyUpgrader";
import Items from "shared/items/Items";
import AwesomeManumaticPurifier from "shared/items/negative/felixthea/AwesomeManumaticPurifier";

declare global {
    interface Assets {}

    interface _G {
        EstimateProgress?: () => void;
        ProgressEstimated?: (message: string) => void;
    }
}

type ItemProgressionStats = {
    revenue: CurrencyBundle;
    priceLabel?: string;
    item?: Item;
    timeToObtain?: OnoeNum;
    limitingCurrency?: Currency;
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

type SerializedCurrencyAmount = {
    currency: string;
    formatted: string;
    single: number;
};

type ProgressionReportEntry = {
    order: number;
    itemId: string;
    itemName: string;
    difficulty: string;
    timeToObtainSeconds: number;
    timeToObtainLabel: string;
    cumulativeTimeSeconds: number;
    cumulativeTimeLabel: string;
    priceLabel?: string;
    limitingCurrency?: Currency;
    limitingCurrencyLabel: string;
    isLong: boolean;
    revenueBreakdown: SerializedCurrencyAmount[];
    formulaResult?: string;
    upgraderDetails?: string;
};

type ProfilingReport = ProfilingStats & {
    otherOperationsTime: number;
    totalExecutionTime: number;
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
export default class ProgressionEstimationService {
    /**
     * Map of Droplet to their corresponding model instance in Workspace.
     * Used for simulating droplet upgrades and value calculations.
     */
    readonly MODEL_PER_DROPLET = new Map<Droplet, BasePart>();

    readonly inventory: Map<string, number>;
    readonly bought: Map<string, number>;

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

    constructor(
        private revenueService: RevenueService,
        private currencyService: CurrencyService,
        private namedUpgradeService: NamedUpgradeService,
        private dataService: DataService,
        private resetService: ResetService,
    ) {
        this.inventory = dataService.empireData.items.inventory;
        this.bought = dataService.empireData.items.bought;

        Environment.OriginalG.EstimateProgress = () => this.estimate();
    }

    /**
     * Populates the MODEL_PER_DROPLET map with instantiated droplet models.
     * @returns A cleanup function to destroy the instantiated models.
     */
    populateDropletModels() {
        this.MODEL_PER_DROPLET.clear();
        for (const droplet of Droplet.DROPLETS) {
            this.MODEL_PER_DROPLET.set(droplet, droplet.getInstantiator(Workspace)());
        }
        return () => {
            for (const [, model] of this.MODEL_PER_DROPLET) {
                model.Destroy();
            }
            this.MODEL_PER_DROPLET.clear();
        };
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
     * Finds the next obtainable item and time to obtain it, given inventory and revenue.
     * @param revenue Current revenue bundle.
     */
    getNextItem(revenue: CurrencyBundle): ItemProgressionStats {
        const startTime = os.clock();
        const inventory = this.inventory;
        const bought = this.bought;

        let nextItem: Item | undefined;
        let timeToObtain: OnoeNum | undefined;
        let limitingCurrency: Currency | undefined;
        let nextPrice: CurrencyBundle | undefined;
        revenue = this.calculateRevenue(revenue.mulConstant(500), this.inventory);

        // find time to obtain other items
        for (const [itemId, item] of Items.itemsPerId) {
            // check if item is already at the maximum amount
            const currentAmount = bought.get(itemId) ?? 0;
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
                if (!inventory.has(requiredItemId) || inventory.get(requiredItemId)! < requiredAmount) {
                    canObtain = false;
                    break;
                }
            }
            if (!canObtain) continue;

            // check if shop is unlocked
            let hasAnyShopUnlocked = false;
            for (const shop of item.shopsSoldIn) {
                if (shop.pricePerIteration.isEmpty()) {
                    hasAnyShopUnlocked = true;
                    break;
                }

                const shopAmount = inventory.get(shop.id) ?? 0;
                if (shopAmount > 0) {
                    hasAnyShopUnlocked = true;
                    break;
                }
            }
            if (!hasAnyShopUnlocked) continue;

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
        this.revenueService.weatherBoostEnabled = false;
        this.dataService.softWipe();
        const inventory = this.inventory;
        const bought = this.bought;

        const cleanup = this.populateDropletModels();

        for (const [id, item] of Items.itemsPerId) {
            const freeIterations = this.getFreeIterations(item);
            if (freeIterations > 0) {
                inventory.set(id, freeIterations);
                bought.set(id, freeIterations);
            }
        }

        let lastRevenue = new CurrencyBundle();
        let totalTime = new OnoeNum(0);
        const allStats = new Array<ItemProgressionStats>();
        const progress = () => {
            const stats = this.getNextItem(lastRevenue);
            const item = stats.item;
            if (item === undefined || stats.timeToObtain === undefined) return allStats;
            allStats.push(stats);
            lastRevenue = stats.revenue;

            const itemId = item.id;
            inventory.set(itemId, (inventory.get(itemId) ?? 0) + 1);
            bought.set(itemId, (bought.get(itemId) ?? 0) + 1);
            for (const [requiredItemId, amount] of item.requiredItems) {
                const requiredItem = Items.getItem(requiredItemId);
                if (requiredItem === undefined) continue;
                inventory.set(requiredItemId, inventory.get(requiredItemId)! - amount);
            }
            totalTime = totalTime.add(stats.timeToObtain);

            return progress();
        };
        const result = progress();
        cleanup();
        return result;
    }

    /**
     * Calculates the revenue generated by itemsToUse if optimally used.
     * Simulates droplet upgrades, generators, furnaces, and reset layers.
     * @param balance The balance to emulate for calculations.
     * @param itemsToUse Map of item IDs to their amounts to consider for revenue.
     */
    calculateRevenue(balance: CurrencyBundle, itemsToUse: Map<string, number>): CurrencyBundle {
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
        if (itemsToUse.has(AwesomeManumaticPurifier.id)) {
            // assume the player is clicking the purifier 1 time every second
            generatorRevenue = generatorRevenue.add(new CurrencyBundle().set("Purifier Clicks", 1));
        }
        let canUpgradeInCauldrons = itemsToUse.has(VoidSkyUpgrader.id);

        const bestChargersPerCurrency = new Map<Currency, Charger[]>();
        const supplementaryChargers = new Set<Charger>();

        for (const currency of CURRENCIES) {
            currencies.add(currency);
            damagePerCurrency.set(currency, 0);
        }

        // first check
        const firstLoopStart = os.clock();
        for (const [itemId, amount] of itemsToUse) {
            const item = Items.getItem(itemId);
            if (item === undefined) continue;

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
        for (const [itemId, amount] of itemsToUse) {
            const item = Items.getItem(itemId);
            if (item === undefined) continue;

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
            const resultInFurnace = this.revenueService.calculateDropletValue(dropletModel);
            const resultInCauldron = this.revenueService.calculateDropletValue(dropletModel);
            resultInCauldron.markAsCauldron();

            resultInFurnace.applySource();
            resultInCauldron.applySource();

            this.profilingStats.dropletCalculateValueTime += os.clock() - calcValueStart;

            const applyFurnacesStart = os.clock();
            for (const [currency] of CurrencyBundle.SORTED_DETAILS) {
                const furnace = furnacePerCurrency.get(currency);
                const cauldron = cauldronPerCurrency.get(currency);

                if (furnace) {
                    resultInFurnace.applyOperative(stripOperativeToOneCurrency(furnace, currency));
                }

                if (cauldron) {
                    resultInCauldron.applyOperative(stripOperativeToOneCurrency(cauldron, currency));
                }
            }

            resultInFurnace.applyFinal();
            resultInCauldron.applyFinal();

            const amountWithUpgraders = resultInFurnace.coalesce();
            const amountWithoutUpgraders = resultInCauldron.coalesce();

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

    private serializeCurrencyBundle(bundle: CurrencyBundle) {
        const amounts = new Array<SerializedCurrencyAmount>();
        for (const [currency] of CurrencyBundle.SORTED_DETAILS) {
            const amount = bundle.amountPerCurrency.get(currency);
            if (amount === undefined) continue;

            amounts.push({
                currency,
                formatted: CurrencyBundle.getFormatted(currency, amount),
                single: amount.toSingle(),
            });
        }
        return amounts;
    }

    estimate() {
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

        const startClock = os.clock();
        const progression = this.getProgression();

        const entries = new Array<ProgressionReportEntry>();

        const longestTracker = new Array<{
            itemName: string;
            itemId: string;
            time: OnoeNum;
            timeLabel: string;
            timeSeconds: number;
        }>();

        const limitingCounts: Record<string, number> = {};
        const longThreshold = new OnoeNum(1000);
        let longCount = 0;
        let iteration = 1;
        let runningSimulatedTime = new OnoeNum(0);

        for (const stats of progression) {
            const item = stats.item;
            const timeToObtain = stats.timeToObtain;
            if (item === undefined || timeToObtain === undefined) continue;

            const limiting = stats.limitingCurrency;
            const limitingKey = limiting ?? "None";
            limitingCounts[limitingKey] = (limitingCounts[limitingKey] ?? 0) + 1;

            const isLong = timeToObtain.moreThan(longThreshold);
            if (isLong) {
                longCount++;
            }

            runningSimulatedTime = runningSimulatedTime.add(timeToObtain);

            const difficultyName = item.difficulty?.name ?? "Unknown";

            const entry: ProgressionReportEntry = {
                order: iteration,
                itemId: item.id,
                itemName: item.name,
                difficulty: difficultyName,
                timeToObtainSeconds: math.round(timeToObtain.revert()),
                timeToObtainLabel: timeToObtain.toString(),
                cumulativeTimeSeconds: math.round(runningSimulatedTime.revert()),
                cumulativeTimeLabel: runningSimulatedTime.toString(),
                priceLabel: stats.priceLabel,
                limitingCurrency: limiting,
                limitingCurrencyLabel: limitingKey,
                isLong,
                revenueBreakdown: this.serializeCurrencyBundle(stats.revenue),
            };

            if (item.formula !== undefined && item.formulaResult !== undefined) {
                entry.formulaResult = tostring(item.formulaResult);
            }

            const upgrader = item.findTrait("Upgrader");
            if (upgrader !== undefined && upgrader.mul !== undefined) {
                entry.upgraderDetails = tostring(upgrader.mul);
            }

            entries.push(entry);
            longestTracker.push({
                itemName: item.name,
                itemId: item.id,
                time: timeToObtain,
                timeLabel: entry.timeToObtainLabel,
                timeSeconds: entry.timeToObtainSeconds,
            });

            iteration++;
        }

        const itemCount = entries.size();
        const totalSimulatedTime = runningSimulatedTime;
        const averageTime = itemCount > 0 ? totalSimulatedTime.div(itemCount) : new OnoeNum(0);

        const dtInner = math.floor((os.clock() - startClock) * 100) / 100;

        longestTracker.sort((a, b) => a.time.moreThan(b.time));
        const topLongest = new Array<{
            rank: number;
            itemName: string;
            timeLabel: string;
            timeSeconds: number;
        }>();
        for (let i = 0; i < math.min(10, longestTracker.size()); i++) {
            const entry = longestTracker[i];
            topLongest.push({
                rank: i + 1,
                itemName: entry.itemName,
                timeLabel: entry.timeLabel,
                timeSeconds: entry.timeSeconds,
            });
        }

        const otherTime =
            dtInner -
            this.profilingStats.calculateRevenueTime -
            this.profilingStats.getNextItemTime -
            this.profilingStats.findShopTime;
        const profiling: ProfilingReport = {
            ...this.profilingStats,
            otherOperationsTime: otherTime,
            totalExecutionTime: dtInner,
        };

        const upgradesSimulated = new Array<{ id: string; amount: number }>();
        for (const [id, amount] of this.namedUpgradeService.upgrades) {
            upgradesSimulated.push({ id, amount });
        }

        const resetLayersSimulated = new Array<{
            id: string;
            rewardLabel: string;
            rewardBreakdown: SerializedCurrencyAmount[];
        }>();
        for (const [id, resetLayer] of pairs(RESET_LAYERS)) {
            const reward = this.resetService.getResetReward(resetLayer);
            if (reward === undefined) continue;
            resetLayersSimulated.push({
                id,
                rewardLabel: reward.toString(),
                rewardBreakdown: this.serializeCurrencyBundle(reward),
            });
        }

        const report = {
            generatedAt: DateTime.now().ToIsoDate(),
            runDurationSeconds: dtInner,
            summary: {
                totalItems: itemCount,
                longItems: longCount,
                longItemThresholdSeconds: 1000,
                totalSimulatedTimeSeconds: math.round(totalSimulatedTime.revert()),
                totalSimulatedTimeLabel: totalSimulatedTime.toString(),
                averageTimeSeconds: math.round(averageTime.revert()),
                averageTimeLabel: averageTime.toString(),
                limitingCurrencyCounts: limitingCounts,
            },
            progression: entries,
            topLongest,
            profiling,
            upgradesSimulated,
            resetLayersSimulated,
        };

        const compactReport = this.buildCompactReport(report);
        Environment.OriginalG.ProgressEstimated?.(HttpService.JSONEncode(compactReport));
    }

    private buildCompactReport(report: {
        generatedAt: string;
        runDurationSeconds: number;
        summary: {
            totalItems: number;
            longItems: number;
            longItemThresholdSeconds: number;
            totalSimulatedTimeSeconds: number;
            totalSimulatedTimeLabel: string;
            averageTimeSeconds: number;
            averageTimeLabel: string;
            limitingCurrencyCounts: Record<string, number>;
        };
        progression: ProgressionReportEntry[];
        topLongest: Array<{ rank: number; itemName: string; timeLabel: string; timeSeconds: number }>;
        profiling: ProfilingReport;
        upgradesSimulated: Array<{ id: string; amount: number }>;
        resetLayersSimulated: Array<{ id: string; rewardLabel: string; rewardBreakdown: SerializedCurrencyAmount[] }>;
    }): Record<string, unknown> {
        const compactSummary = {
            ti: report.summary.totalItems,
            li: report.summary.longItems,
            lt: report.summary.longItemThresholdSeconds,
            ts: report.summary.totalSimulatedTimeSeconds,
            tl: report.summary.totalSimulatedTimeLabel,
            as: report.summary.averageTimeSeconds,
            al: report.summary.averageTimeLabel,
            lc: report.summary.limitingCurrencyCounts,
        };

        const compactProgression = report.progression.map((entry) => {
            const compactEntry: Record<string, unknown> = {
                o: entry.order,
                n: entry.itemName,
                d: entry.difficulty,
                ts: entry.timeToObtainSeconds,
                tl: entry.timeToObtainLabel,
                cs: entry.cumulativeTimeSeconds,
                cl: entry.cumulativeTimeLabel,
                ll: entry.limitingCurrencyLabel,
                l: entry.isLong,
                rb: entry.revenueBreakdown.map((amount) => ({
                    c: amount.currency,
                    f: amount.formatted,
                    s: amount.single,
                })),
            };

            if (entry.priceLabel !== undefined) {
                compactEntry.p = entry.priceLabel;
            }

            if (entry.limitingCurrency !== undefined) {
                compactEntry.lc = entry.limitingCurrency;
            }

            if (entry.formulaResult !== undefined) {
                compactEntry.fr = entry.formulaResult;
            }

            if (entry.upgraderDetails !== undefined) {
                compactEntry.ud = entry.upgraderDetails;
            }

            return compactEntry;
        });

        const compactTopLongest = report.topLongest.map((entry) => ({
            r: entry.rank,
            n: entry.itemName,
            l: entry.timeLabel,
            s: entry.timeSeconds,
        }));

        const compactProfiling: Record<string, unknown> = {
            te: report.profiling.totalExecutionTime,
            oo: report.profiling.otherOperationsTime,
            cr: report.profiling.calculateRevenueTime,
            cc: report.profiling.calculateRevenueCount,
            gn: report.profiling.getNextItemTime,
            gc: report.profiling.getNextItemCount,
            fs: report.profiling.findShopTime,
            fc: report.profiling.findShopCount,
            c1: report.profiling.calcRevFirstLoopTime,
            c2: report.profiling.calcRevSecondLoopTime,
            cd: report.profiling.calcRevDropletLoopTime,
            ch: report.profiling.calcRevChargerTime,
            co: report.profiling.calcRevOtherTime,
            di: report.profiling.dropletGetInstanceInfoTime,
            su: report.profiling.dropletSetUpgradesTime,
            cv: report.profiling.dropletCalculateValueTime,
            af: report.profiling.dropletApplyFurnacesTime,
        };

        const compactUpgrades = report.upgradesSimulated.map((entry) => ({
            i: entry.id,
            a: entry.amount,
        }));

        const compactResetLayers = report.resetLayersSimulated.map((entry) => ({
            i: entry.id,
            l: entry.rewardLabel,
            rb: entry.rewardBreakdown.map((amount) => ({
                c: amount.currency,
                f: amount.formatted,
                s: amount.single,
            })),
        }));

        return {
            g: report.generatedAt,
            d: report.runDurationSeconds,
            s: compactSummary,
            p: compactProgression,
            l: compactTopLongest,
            f: compactProfiling,
            u: compactUpgrades,
            r: compactResetLayers,
        };
    }
}
