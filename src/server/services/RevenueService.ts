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
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import AtmosphereService from "server/services/world/AtmosphereService";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import DarkMatter from "shared/currency/mechanics/DarkMatter";
import { performSoftcaps } from "shared/currency/mechanics/Softcaps";
import Droplet from "shared/item/Droplet";
import Operative from "shared/item/traits/Operative";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import { PriceUpgrade } from "shared/namedupgrade/NamedUpgrade";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

const FURNACE_UPGRADES = NamedUpgrades.getUpgrades("Furnace");

/**
 * Service for managing all revenue, value, and boost calculations for items and droplets.
 * Handles global and upgrade-based multipliers, softcaps, and value computation.
 */
@Service()
export default class RevenueService {
    weatherBoostEnabled = true;

    private operativeCache: { add: CurrencyBundle; mul: CurrencyBundle; pow: CurrencyBundle } | undefined;
    private useOperativeCache = false;

    /**
     * Constructs the RevenueService with all required dependencies.
     */
    constructor(
        private dataService: DataService,
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
        const [darkMatterBoost] = DarkMatter.getBoost(this.currencyService.balance.amountPerCurrency);
        if (darkMatterBoost !== undefined) {
            mul = mul.mul(darkMatterBoost);
        }

        // bombs
        if (this.bombsService.boost !== undefined) {
            mul = mul.mul(this.bombsService.boost);
        }

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

        if (this.weatherBoostEnabled === true) {
            // Apply weather value multipliers
            const weatherMultiplier = this.atmosphereService.currentMultipliers.dropletValue;
            if (weatherMultiplier !== 1) {
                mul = mul.mul(weatherMultiplier);
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
     * Applies droplet-specific effects to the provided add, mul, and pow terms.
     * @param add Addition term to apply
     * @param mul Multiplication term to apply
     * @param pow Power term to apply
     * @param dropletInfo Instance info of the droplet
     * @returns Tuple of (add, mul, pow) with droplet effects applied
     */
    applyDroplet(add: CurrencyBundle, mul: CurrencyBundle, pow: CurrencyBundle, dropletInfo: InstanceInfo) {
        if (dropletInfo.LightningSurged === true) {
            mul = mul.mul(10);
        }
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
     * Sets the operative cache for estimation.
     */
    setOperativeCache(cache: { add: CurrencyBundle; mul: CurrencyBundle; pow: CurrencyBundle }) {
        this.operativeCache = cache;
        this.useOperativeCache = true;
    }

    /**
     * Clears the operative cache.
     */
    clearOperativeCache() {
        this.useOperativeCache = false;
        this.operativeCache = undefined;
    }
    calculateDropletValue(
        dropletModel: BasePart,
        includesGlobalBoosts: boolean,
        includesUpgrades: boolean,
        enforceIncludesUpgrades?: boolean,
    ) {
        const dropletInfo = getAllInstanceInfo(dropletModel);

        let [totalAdd, totalMul, totalPow] = Operative.template();
        const [nerf, isSky] = Droplet.getNerf(dropletInfo);
        if (isSky === true && enforceIncludesUpgrades !== true) {
            includesUpgrades = true;
        }

        if (includesGlobalBoosts === true) {
            [totalAdd, totalMul, totalPow] = this.applyGlobal(totalAdd, totalMul, totalPow, FURNACE_UPGRADES);
        }

        if (includesUpgrades === true) {
            if (this.useOperativeCache) {
                [totalAdd, totalMul, totalPow] = [
                    this.operativeCache!.add,
                    this.operativeCache!.mul,
                    this.operativeCache!.pow,
                ];
            } else {
                [totalAdd, totalMul, totalPow] = Upgrader.applyUpgrades(totalAdd, totalMul, totalPow, dropletInfo);
            }
        }

        [totalAdd, totalMul, totalPow] = this.applyDroplet(totalAdd, totalMul, totalPow, dropletInfo);

        const dropletId = dropletInfo.DropletId;
        if (dropletId === undefined) {
            throw `DropletId not found on droplet ${dropletModel.GetFullName()}`;
        }

        const droplet = Droplet.getDroplet(dropletId);
        if (droplet === undefined) {
            throw `Droplet with ID ${dropletId} not found.`;
        }

        let worth = droplet.coalesce(totalAdd, totalMul, totalPow);
        return $tuple(worth.mul(nerf), nerf);
    }
}
