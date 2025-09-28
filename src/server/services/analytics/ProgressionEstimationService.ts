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

import { OnoeNum } from "@antivivi/serikanum";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { OnStart, Service } from "@flamework/core";
import { HttpService, RunService, Workspace } from "@rbxts/services";
import StringBuilder from "@rbxts/stringbuilder";
import { $env } from "rbxts-transform-env";
import { OnGameAPILoaded } from "server/services/ModdingService";
import ResetService from "server/services/ResetService";
import RevenueService from "server/services/RevenueService";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import NamedUpgradeService from "server/services/data/NamedUpgradeService";
import Packets from "shared/Packets";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCIES } from "shared/currency/CurrencyDetails";
import { RESET_LAYERS } from "shared/currency/mechanics/ResetLayer";
import eat from "shared/hamster/eat";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";
import Charger from "shared/item/traits/generator/Charger";
import Items from "shared/items/Items";
import AwesomeManumaticPurifier from "shared/items/negative/felixthea/AwesomeManumaticPurifier";

declare global {
    interface Assets {}
}

type ItemProgressionStats = {
    revenue: CurrencyBundle;
    item?: Item;
    timeToObtain?: OnoeNum;
    limitingCurrency?: Currency;
};

/**
 * Service that estimates progression, calculates optimal paths, and posts reports.
 */
@Service()
export default class ProgressionEstimationService implements OnGameAPILoaded, OnStart {
    /**
     * Map of Droplet to their corresponding model instance in Workspace.
     * Used for simulating droplet upgrades and value calculations.
     */
    readonly MODEL_PER_DROPLET = new Map<Droplet, BasePart>();

    constructor(
        private revenueService: RevenueService,
        private currencyService: CurrencyService,
        private namedUpgradeService: NamedUpgradeService,
        private dataService: DataService,
        private resetService: ResetService,
    ) {}

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
        let nextItem: Item | undefined;
        let timeToObtain: OnoeNum | undefined;
        let limitingCurrency: Currency | undefined;
        revenue = this.calculateRevenue(inventory, revenue.mul(500));

        // find time to obtain other items
        for (const [_, item] of Items.itemsPerId) {
            // check if item is already at the maximum amount
            const currentAmount = bought.get(item) ?? 0;
            const nextIteration = currentAmount === undefined ? 1 : currentAmount + 1;
            let nextPrice = item.pricePerIteration.get(nextIteration);
            if (nextPrice === undefined) {
                if (nextIteration > 1 && item.defaultPrice !== undefined)
                    // prevent infinite loop
                    continue;
                nextPrice = item.defaultPrice;
                if (nextPrice === undefined) continue;
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

            const [t, limiting] = this.getTimeToReachPrice(revenue, nextPrice);
            if (t === undefined || t.moreThan(1e6)) continue;
            limitingCurrency = limiting;
            if (timeToObtain === undefined || t.lessThan(timeToObtain)) {
                timeToObtain = t;
                nextItem = item;
            }
        }
        return { revenue, item: nextItem, timeToObtain, limitingCurrency };
    }

    /**
     * Buys all upgrades in the provided list, using free purchases.
     *
     * @param upgrades List of upgrade IDs.
     */
    maxUpgradeBoard(upgrades: string[]) {
        for (const id of upgrades) {
            const purchase = () => this.namedUpgradeService.buyUpgrade(id, undefined, undefined, true);
            while (purchase()) {
                task.wait();
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

        const bestChargersPerCurrency = new Map<Currency, Charger[]>();
        const supplementaryChargers = new Set<Charger>();

        for (const currency of CURRENCIES) {
            currencies.add(currency);
            damagePerCurrency.set(currency, 0);
        }

        // first check
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
                        Upgrader: Workspace,
                        Boost: upgrader,
                    });
                }
            }

            const furnace = item.findTrait("Furnace");
            if (furnace !== undefined) {
                for (const currency of furnace.getCurrencies()) {
                    const toModify: Map<Currency, Furnace> =
                        furnace.includesUpgrades === false ? cauldronPerCurrency : furnacePerCurrency;
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
                    generatorRevenue = generatorRevenue.add(passiveGain.mul(amount));
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
        this.maxUpgradeBoard(namedUpgrades);

        // second check
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

        let revenue = new CurrencyBundle();

        // calculate droplets and its upgrades
        for (const [droplet, dropRate] of droplets) {
            const dropletModel = this.MODEL_PER_DROPLET.get(droplet)!;
            const instanceInfo = getAllInstanceInfo(dropletModel);
            const dropletUpgrades = new Map<string, UpgradeInfo>();
            instanceInfo.Upgrades = dropletUpgrades;
            let i = 0;
            for (const upgrade of upgrades) {
                dropletUpgrades.set(tostring(i), upgrade);
                i++;
            }
            const baseHealth = droplet.health;
            instanceInfo.Health = 100; // override health check to make our own damage calculations

            const [upgradedValue] = this.revenueService.calculateDropletValue(dropletModel, true, true);
            // for (const [currency, amount] of upgradedValue.amountPerCurrency) {
            //     let damage = (baseHealth - (damagePerCurrency.get(currency) ?? 0)) / 100;
            //     damage = math.clamp(damage, 0.25, 1); // assume player wont degrade droplet more than 75%
            //     upgradedValue.set(currency, amount.mul(damage));
            // }

            const [unupgradedValue] = this.revenueService.calculateDropletValue(dropletModel, true, false);

            const value = new CurrencyBundle();
            for (const [currency, upgradedAmount] of upgradedValue.amountPerCurrency) {
                const furnace = furnacePerCurrency.get(currency);
                const cauldron = cauldronPerCurrency.get(currency);
                const furnaceValue =
                    furnace?.apply(new CurrencyBundle().set(currency, upgradedAmount)).get(currency) ?? upgradedAmount;
                const unupgradedAmount = unupgradedValue.get(currency)!;
                const cauldronValue =
                    cauldron?.apply(new CurrencyBundle().set(currency, unupgradedAmount)).get(currency) ??
                    unupgradedAmount;

                value.set(currency, OnoeNum.max(furnaceValue, cauldronValue));
            }

            revenue = revenue.add(value.div(condension).mul(dropRate));
        }
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
        revenue = revenue.add(generatorRevenue);

        // lastly, account for reset layer gains
        for (const [_, resetLayer] of pairs(RESET_LAYERS)) {
            const reward = this.resetService.getResetReward(resetLayer);
            if (reward === undefined) continue;
            revenue = revenue.add(reward.div(500)); // assume reset recovery is 500s
        }

        return revenue;
    }

    onGameAPILoaded() {
        for (const droplet of Droplet.DROPLETS) {
            this.MODEL_PER_DROPLET.set(droplet, droplet.getInstantiator(Workspace)());
        }
    }

    estimate() {
        const startingBalance = this.currencyService.balance.clone();
        this.currencyService.setAll(new Map());
        this.namedUpgradeService.setAmountPerUpgrade(new Map());

        const t = tick();
        const progression = this.getProgression();
        const builder = new StringBuilder();
        let itemIteration = 1;
        for (const stats of progression) {
            const revenue = stats.revenue;
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
            builder.append("s** TTO at revenue ");
            builder.append(revenue.toString());
            builder.append(". (Limiting: **");
            builder.append(stats.limitingCurrency);
            builder.append("**)");
            if (timeToObtain.moreThan(1000)) {
                builder.append(`\n\t> **LONG**`);
            }

            if (item.formula !== undefined) {
                builder.append(`\n\t> Formula Result = ${item.formulaResult}`);
                const upgrader = item.findTrait("Upgrader");
                if (upgrader !== undefined) {
                    builder.append(`\n\t> Upgrader = ${upgrader.mul}`);
                }
            }

            builder.append("\n");
            itemIteration++;
        }
        builder.append(`\n\n`);
        builder.append(`-# Note that this is a rough estimate and does not account for all mechanics in the game.\n`);
        const dt = math.floor((tick() - t) * 100) / 100;
        builder.append(`-# Calculated in ${dt} seconds.\n`);
        print(`Calculated in ${dt} seconds.`);

        this.post(builder.toString());
        this.currencyService.setAll(startingBalance.amountPerCurrency);
    }

    /**
     * Runs the progression estimation and posts the report if in the PROGRESSION empire.
     */
    onStart() {
        if (this.dataService.empireId === "PROGRESSION") {
            this.estimate();
        }
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
     * Posts a progression report to Workspace for offline usage.
     *
     * @param message The report message.
     */
    private postOffline(message: string) {
        const stringValue = new Instance("StringValue");
        stringValue.Name = "ProgressionEstimationReport";
        stringValue.Value = message;
        stringValue.Parent = Workspace;
        eat(stringValue, "Destroy");
    }

    /**
     * Posts a progression report to Discord and Workspace.
     *
     * @param message The report message.
     */
    post(message: string) {
        this.postOffline(message); // post to Workspace for offline usage

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
