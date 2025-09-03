//!native
//!optimize 2

/**
 * @fileoverview Handles all revenue, value, and boost calculations for items and droplets.
 *
 * This service manages:
 * - Global and upgrade-based revenue multipliers (e.g., Dark Matter, Funds Bombs, named upgrades)
 * - Application of additive, multiplicative, and exponential boosts to all revenue sources
 * - Calculation of droplet values, including all relevant boosts and nerfs
 * - Integration with softcap logic and currency balancing
 *
 * RevenueService acts as the central authority for all value and boost calculations
 * related to item and droplet revenue, ensuring consistent and extensible logic for
 * upgrades, boosts, and special mechanics.
 *
 * @since 1.0.0
 */

import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Service } from "@flamework/core";
import BombsService from "server/services/boosts/BombsService";
import DarkMatterService from "server/services/boosts/DarkMatterService";
import AtmosphereService from "server/services/world/AtmosphereService";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Operative from "shared/item/traits/Operative";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import { PriceUpgrade } from "shared/namedupgrade/NamedUpgrade";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import { performSoftcaps } from "shared/Softcaps";
import WeatherBoost from "shared/item/traits/boost/WeatherBoost";

const FURNACE_UPGRADES = NamedUpgrades.getUpgrades("Furnace");

/**
 * Service for managing all revenue, value, and boost calculations for items and droplets.
 * Handles global and upgrade-based multipliers, softcaps, and value computation.
 */
@Service()
export default class RevenueService {
    /**
     * Constructs the RevenueService with all required dependencies.
     */
    constructor(
        private dataService: DataService,
        private darkMatterService: DarkMatterService,
        private bombsService: BombsService,
        private currencyService: CurrencyService,
        private atmosphereService: AtmosphereService,
    ) {}

    /**
     * Gets the global additive, multiplicative, and exponential boosts applied to all revenue sources.
     * Includes boosts from dark matter, bombs, and named upgrades.
     *
     * @param upgrades Upgrades for the revenue source
     * @returns Tuple of (add, mul, pow) boosts
     */
    getGlobal(upgrades?: Map<string, PriceUpgrade>) {
        let [add, mul, pow] = Operative.template();
        // dark matter
        const [darkMatterBoost] = this.darkMatterService.getBoost();
        mul = mul.mul(darkMatterBoost);

        // bombs
        if (this.bombsService.fundsBombEnabled === true) mul = mul.mul(this.bombsService.fundsBombBoost);

        // named upgrades from upgrade boards and other stuff
        if (upgrades !== undefined) {
            for (const [id, upgrade] of upgrades) {
                const amount = this.dataService.empireData.upgrades.get(id);
                if (amount === undefined) continue;
                switch (upgrade.operative) {
                    case "mul":
                        mul = upgrade.apply(mul, amount);
                        break;
                    case "pow":
                        pow = pow.mul(upgrade.operationFormula!(amount)); // you CANNOT use .apply because 1^ANYTHING is 1
                        break;
                }
            }
        }
        return $tuple(add, mul, pow);
    }

    /**
     * Applies global boosts to the provided add, mul, and pow terms.
     *
     * @param add Addition term to apply
     * @param mul Multiplication term to apply
     * @param pow Power term to apply
     * @param upgrades Upgrades for the revenue source
     * @returns Tuple of (add, mul, pow) with global boosts applied
     */
    applyGlobal(add: CurrencyBundle, mul: CurrencyBundle, pow: CurrencyBundle, upgrades?: Map<string, PriceUpgrade>) {
        const [globalAdd, globalMul, globalPow] = this.getGlobal(upgrades);
        add = add.add(globalAdd);
        mul = mul.mul(globalMul);
        pow = pow.mul(globalPow);
        return $tuple(add, mul, pow);
    }

    /**
     * Applies softcaps to the provided value, using the current balance as context.
     *
     * @param value The value to apply softcaps to
     * @returns The softcapped value
     */
    performSoftcaps(value: CurrencyMap) {
        return performSoftcaps(this.currencyService.balance.amountPerCurrency, value);
    }

    /**
     * Calculates the total value of a droplet, including all relevant boosts and nerfs.
     *
     * @param dropletModel Droplet to calculate
     * @param includesGlobalBoosts Whether to include global boosts (e.g., Dark Matter, Funds bombs)
     * @param includesUpgrades Whether to include upgrades from Upgrader items
     * @param enforce Whether to enforce the includesUpgrades parameter (for special cases)
     * @returns Tuple of (droplet value, nerf applied)
     */
    calculateDropletValue(
        dropletModel: BasePart,
        includesGlobalBoosts: boolean,
        includesUpgrades: boolean,
        enforce?: boolean,
    ) {
        const instanceInfo = getAllInstanceInfo(dropletModel);

        let [totalAdd, totalMul, totalPow] = Operative.template();
        const [nerf, isSky] = Droplet.getNerf(instanceInfo);
        if (isSky === true && enforce !== true) {
            includesUpgrades = true;
        }

        if (includesGlobalBoosts === true) {
            [totalAdd, totalMul, totalPow] = this.applyGlobal(totalAdd, totalMul, totalPow, FURNACE_UPGRADES);
        }

        if (includesUpgrades === true) {
            [totalAdd, totalMul, totalPow] = Upgrader.applyUpgrades(totalAdd, totalMul, totalPow, instanceInfo);
        }

        let worth = Droplet.getDroplet(instanceInfo.DropletId!)!.coalesce(totalAdd, totalMul, totalPow);

        if (includesGlobalBoosts === true) {
            // Apply weather value multipliers
            const weatherMultiplier = WeatherBoost.getDropletValueMultiplier(dropletModel);
            if (weatherMultiplier !== 1) {
                worth = worth.mul(weatherMultiplier);
            }

            this.performSoftcaps(worth.amountPerCurrency);
        }

        return $tuple(worth.mul(nerf), nerf);
    }
}
