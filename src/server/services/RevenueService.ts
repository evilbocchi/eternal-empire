//!native
//!optimize 2

/**
 * @fileoverview Handles all revenue, value, and boost calculations for items and droplets.
 *
 * This service manages:
 * - Global and upgrade-based revenue multipliers (e.g., Dark Matter, Funds Bombs, named upgrades)
 * - Application of additive, multiplicative, and exponential boosts to all revenue sources
 * - Calculation of droplet values, including all relevant boosts and nerfs
 *
 * RevenueService acts as the central authority for all value and boost calculations
 * related to item and droplet revenue, ensuring consistent and extensible logic for
 * upgrades, boosts, and special mechanics.
 *
 * @since 1.0.0
 */

import { getAllInstanceInfo } from "@antivivi/vrldk";
import { Service } from "@flamework/core";
import { BaseOnoeNum, OnoeNum } from "@rbxts/serikanum";
import BombsService from "server/services/boosts/BombsService";
import CurrencyService from "server/services/data/CurrencyService";
import DataService from "server/services/data/DataService";
import AtmosphereService from "server/services/world/AtmosphereService";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import DarkMatter from "shared/currency/mechanics/DarkMatter";
import Droplet from "shared/item/Droplet";
import type Condenser from "shared/item/traits/dropper/Condenser";
import Operative, { IOperative } from "shared/item/traits/Operative";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import { CurrencyBundleUpgrade } from "shared/namedupgrade/NamedUpgrade";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";

const FURNACE_UPGRADES = NamedUpgrades.getUpgrades("Furnace");

/**
 * Service for managing all revenue, value, and boost calculations for items and droplets.
 * Handles global and upgrade-based multipliers and value computation.
 */
@Service()
export default class RevenueService {
    weatherBoostEnabled = true;

    /**
     * Constructs the RevenueService with all required dependencies.
     */
    constructor(
        private readonly dataService: DataService,
        private readonly bombsService: BombsService,
        private readonly currencyService: CurrencyService,
        private readonly atmosphereService: AtmosphereService,
    ) {}

    applyNamedUpgradeBoost(
        add: CurrencyBundle,
        mul: CurrencyBundle,
        pow: CurrencyBundle,
        upgrades: Map<string, CurrencyBundleUpgrade>,
    ) {
        const amountPerUpgrade = this.dataService.empireData.upgrades;
        for (const [id, upgrade] of upgrades) {
            const amount = amountPerUpgrade.get(id);
            if (amount === undefined) continue;

            [add, mul, pow] = Operative.applyOperative(add, mul, pow, upgrade.getOperative(amount));
        }

        return $tuple(add, mul, pow);
    }

    /**
     * Calculates the value of a droplet instance, applying all relevant boosts and factors.
     * @param instance The droplet instance to calculate the value for.
     * @param verbose Whether to enable verbose logging of factors.
     * @returns The detailed droplet value result.
     */
    calculateDropletValue(instance: BasePart, verbose?: boolean) {
        const instanceInfo = getAllInstanceInfo(instance);

        const dropletId = instanceInfo.dropletId;
        if (dropletId === undefined) {
            throw `DropletId not found on droplet ${instance.GetFullName()}`;
        }

        const droplet = Droplet.getDroplet(dropletId);
        if (droplet === undefined) {
            throw `Droplet with ID ${dropletId} not found.`;
        }

        return new RevenueService.DropletValueResult({
            revenueService: this,
            instance,
            instanceInfo,
            droplet,
            verbose,
        });
    }

    /**
     * Calculates the final value of a single droplet after applying all relevant boosts and factors.
     * @param instance The droplet instance to calculate the value for.
     * @returns The final calculated value of the droplet as a coalesced CurrencyBundle.
     */
    calculateSingleDropletValue(instance: BasePart) {
        const result = this.calculateDropletValue(instance);
        result.applySource();
        result.applyFinal();
        return result.coalesce();
    }

    /**
     * Calculate the revenue that is generated from a source that is guaranteed to be single-use.
     * @param baseValue The base value of the revenue source.
     * @param sourceOperatives The operatives to consider when applying boosts.
     * @param namedUpgrades The named upgrades to consider when applying boosts.
     * @return The final calculated revenue value.
     */
    calculateSingleRevenue(
        baseValue: CurrencyBundle,
        sourceOperatives?: Map<string, IOperative>,
        namedUpgrades?: Map<string, CurrencyBundleUpgrade>,
    ) {
        const result = new RevenueService.RevenueSourceResult(this, baseValue);
        result.applySource();
        if (sourceOperatives !== undefined) {
            for (const [_, operative] of sourceOperatives) {
                result.applyOperative(operative);
            }
        }
        result.applyFinal(namedUpgrades);
        return result.coalesce();
    }

    static RevenueSourceResult = class {
        public readonly add = new CurrencyBundle();
        public readonly mul = CurrencyBundle.ones();
        public readonly pow = CurrencyBundle.ones();

        /**
         * The list of factors that contributed to the final value calculation.
         * Disabled by default; enable verbose mode to populate this.
         */
        public readonly factors = new Array<
            [
                string,
                {
                    add?: CurrencyBundle;
                    mul?: CurrencyBundle | OnoeNum;
                    pow?: CurrencyBundle | OnoeNum;
                    inverse?: boolean;
                },
            ]
        >();

        /** Whether global factors have been applied. */
        public finalApplied = false;

        /** Whether local factors have been applied. */
        public localApplied = false;

        /**
         * Constructs a RevenueSourceResult for calculating the value of a revenue source.
         * @param revenueService The RevenueService instance.
         * @param baseValue The base value of the revenue source.
         * @param verbose Whether to enable verbose logging of factors.
         */
        public constructor(
            protected readonly revenueService: RevenueService,
            public readonly baseValue: CurrencyBundle,
            public readonly verbose = false,
        ) {}

        /**
         * Applies factors such as {@link DarkMatter}, bombs, etc.
         * Use this right before actually adding the revenue to the balance to avoid double application.
         * @param namedUpgrades The named upgrades to consider when applying boosts.
         */
        public applyFinal(namedUpgrades?: Map<string, CurrencyBundleUpgrade>) {
            if (this.finalApplied === true) throw "Global factors have already been applied.";

            this.finalApplied = true;
            const revenueService = this.revenueService;
            const verbose = this.verbose;
            const add = this.add;
            const mul = this.mul;
            const pow = this.pow;

            // Dark Matter
            const [darkMatterMul] = DarkMatter.getBoost(revenueService.currencyService.balance.amountPerCurrency);
            if (darkMatterMul !== undefined) {
                mul.mul(darkMatterMul, true);
                if (verbose === true) {
                    this.factors.push(["DARKMATTER", { mul: darkMatterMul }]);
                }
            }

            // Bombs
            const bombsMul = revenueService.bombsService.boost;
            if (bombsMul !== undefined) {
                mul.mul(bombsMul, true);
                if (verbose === true) {
                    this.factors.push(["CURRENCYBOMBS", { mul: bombsMul }]);
                }
            }

            // Named Upgrades
            if (namedUpgrades !== undefined) {
                const amountPerUpgrade = revenueService.dataService.empireData.upgrades;
                for (const [id, upgrade] of namedUpgrades) {
                    const amount = amountPerUpgrade.get(id);
                    if (amount === undefined) continue;

                    const operative = upgrade.getOperative(amount);
                    Operative.applyOperative(add, mul, pow, operative, undefined, undefined, true);
                    if (verbose === true) {
                        this.factors.push([id.upper(), operative]);
                    }
                }
            }
        }

        /**
         * Applies factors that are guaranteed to be one-time. This means that while `applySource` may be called multiple times for even the same source, each `applySource` call will have distinct factors that do not overlap with previous calls.
         */
        public applySource() {
            if (this.localApplied === true) throw "Local factors have already been applied.";

            this.localApplied = true;
        }

        /**
         * Applies an operative to the current revenue calculation.
         * @param operative The operative to apply.
         * @param inverse Whether to apply the inverse of the operative.
         * @param label An optional label for verbose logging.
         */
        public applyOperative(operative: IOperative, inverse?: boolean, label?: string) {
            Operative.applyOperative(this.add, this.mul, this.pow, operative, inverse, undefined, true);
            if (this.verbose === true) {
                this.factors.push([label ?? "OPERATIVE", operative]);
            }
        }

        /**
         * Applies a constant to the current revenue calculation.
         * @param constant The constant to apply.
         * @param operation The operation to perform: "mul" or "pow".
         * @param label An optional label for verbose logging.
         */
        public applyConstant(constant: number | BaseOnoeNum, operation: "mul" | "pow", label?: string) {
            if (operation === "mul") {
                this.mul.mulConstant(constant, true);
            } else if (operation === "pow") {
                this.pow.mulConstant(constant, true);
            }
            if (this.verbose === true) {
                this.factors.push([
                    label ?? operation.upper(),
                    operation === "mul" ? { mul: new OnoeNum(constant) } : { pow: new OnoeNum(constant) },
                ]);
            }
        }

        /**
         * Calculates the coalesced value from the current add, mul, and pow components.
         * @param value The base value to apply the components to.
         * @returns The resulting value after applying add, mul, and pow.
         */
        public coalesce() {
            return Operative.coalesce(this.baseValue, this.add, this.mul, this.pow);
        }
    };

    private static DropletValueResult = class extends RevenueService.RevenueSourceResult {
        public readonly instance: BasePart;
        public readonly instanceInfo: InstanceInfo;
        public readonly droplet: Droplet;

        private isCauldron = false;

        constructor({
            revenueService,
            instance,
            instanceInfo,
            droplet,
            verbose,
        }: {
            revenueService: RevenueService;
            instance: BasePart;
            instanceInfo: InstanceInfo;
            droplet: Droplet;
            verbose?: boolean;
        }) {
            super(revenueService, droplet.value, verbose);
            this.instance = instance;
            this.instanceInfo = instanceInfo;
            this.droplet = droplet;
        }

        public markAsCauldron() {
            this.isCauldron = true;
        }

        /**
         * Applies final adjustments to the droplet value right before incrementing the balance.
         *
         * Do **not** include this when calculating droplet value in {@link Condenser} or similar feeder items that will lead to double global factor application.
         */
        override applyFinal() {
            super.applyFinal(FURNACE_UPGRADES);

            const verbose = this.verbose;
            const mul = this.mul;

            // Weather Boost
            if (this.revenueService.weatherBoostEnabled === true) {
                const weatherMultiplier = this.revenueService.atmosphereService.currentMultipliers.dropletValue;
                if (weatherMultiplier !== 1) {
                    mul.mulConstant(weatherMultiplier, true);
                    if (verbose === true) {
                        this.factors.push(["WEATHER", { mul: new OnoeNum(weatherMultiplier) }]);
                    }
                }
            }

            // Sky Droplet Nerf
            if (this.instanceInfo.sky === true) {
                const skyDivNerf = new OnoeNum(250);
                mul.divConstant(skyDivNerf, true);
                if (verbose === true) {
                    this.factors.push(["SKYDROPLET", { mul: skyDivNerf, inverse: true }]);
                }
            }
        }

        /**
         * Applies the droplet's Upgraders to the revenue calculation.
         * Modifies the provided add, mul, and pow parameters in-place.
         * @param add The addition term to modify.
         * @param mul The multiplication term to modify.
         * @param pow The power term to modify.
         */
        private applyUpgraders(add: CurrencyBundle, mul: CurrencyBundle, pow: CurrencyBundle) {
            const dropletUpgrades = this.instanceInfo.upgrades;
            if (dropletUpgrades === undefined) {
                throw `Droplet upgrades not found on droplet ${this.instance.GetFullName()}`;
            }
            for (const [upgradeId, upgradeInfo] of dropletUpgrades) {
                let [operative, inverse] = Upgrader.getUpgrade(upgradeInfo);
                if (operative === undefined) continue;

                Operative.applyOperative(add, mul, pow, operative, inverse, undefined, true);
                if (this.verbose === true) {
                    this.factors.push([(upgradeInfo.item?.id ?? upgradeId).upper(), operative]);
                }
            }
        }

        /**
         * Calculate the factors that only apply to this specific droplet, such as {@link Upgrader} boosts and lightning surges.
         */
        override applySource() {
            super.applySource();

            const instanceInfo = this.instanceInfo;
            const verbose = this.verbose;
            const add = this.add;
            const mul = this.mul;
            const pow = this.pow;

            // Upgraders
            let upgradersEnabled = true;
            if (this.isCauldron === true && instanceInfo.sky !== true) {
                upgradersEnabled = false;
            }
            if (upgradersEnabled === true) {
                this.applyUpgraders(add, mul, pow);
            }

            // Lightning Surge
            if (instanceInfo.lightningSurged === true) {
                mul.mulConstant(10, true);
                if (verbose === true) {
                    this.factors.push(["LIGHTNINGSURGE", { mul: new OnoeNum(10) }]);
                }
            }

            // Health Nerf
            const health = instanceInfo.health;
            if (health === undefined || health <= 0) {
                throw `Droplet health is undefined or zero on droplet ${this.instance.GetFullName()}`;
            }
            if (health < 100) {
                const coef = health / 100;
                mul.mulConstant(coef, true);
                if (verbose === true) {
                    this.factors.push(["HEALTH", { mul: new OnoeNum(coef) }]);
                }
            }
        }
    };
}
