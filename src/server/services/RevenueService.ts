//!native
//!optimize 2

import { Service } from "@flamework/core";
import { BombsService } from "server/services/BombsService";
import { DarkMatterService } from "server/services/DarkMatterService";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Operative from "shared/item/traits/Operative";
import Upgrader from "shared/item/traits/Upgrader";
import { PriceUpgrade } from "shared/namedupgrade/NamedUpgrade";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import { performSoftcaps } from "shared/Softcaps";
import { getAllInstanceInfo } from "@antivivi/vrldk";

const FURNACE_UPGRADES = NamedUpgrades.getUpgrades("Furnace");
const ONES = CurrencyBundle.ones();

@Service()
export class RevenueService {

    constructor(private dataService: DataService, private darkMatterService: DarkMatterService, private bombsService: BombsService,
        private currencyService: CurrencyService) {

    }

    /**
     * Get the global boosts that are applied to all revenue sources.
     * 
     * @param upgrades Upgrades for the revenue source
     * @returns Global boosts
     */
    getGlobal(upgrades?: Map<string, PriceUpgrade>) {
        let [add, mul, pow] = Operative.template();
        // dark matter
        const [darkMatterBoost] = this.darkMatterService.getBoost();
        mul = mul.mul(darkMatterBoost);

        // bombs
        if (this.bombsService.fundsBombEnabled === true)
            mul = mul.mul(this.bombsService.fundsBombBoost);

        // named upgrades from upgrade boards and other stuff
        if (upgrades !== undefined) {
            for (const [id, upgrade] of upgrades) {
                const amount = this.dataService.empireData.upgrades.get(id);
                if (amount === undefined)
                    continue;
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
     * Apply boosts that are globally put upon every revenue source.
     * 
     * @param add Addition term to apply.
     * @param mul Multiplication term to apply.
     * @param pow Power term to apply.
     * @param upgrades Upgrades for the revenue source
     * @returns Boosts
     */
    applyGlobal(add: CurrencyBundle, mul: CurrencyBundle, pow: CurrencyBundle, upgrades?: Map<string, PriceUpgrade>) {
        const [globalAdd, globalMul, globalPow] = this.getGlobal(upgrades);
        add = add.add(globalAdd);
        mul = mul.mul(globalMul);
        pow = pow.mul(globalPow);
        return $tuple(add, mul, pow);
    }

    performSoftcaps(value: CurrencyMap) {
        return performSoftcaps(this.currencyService.balance.amountPerCurrency, value);
    }

    /**
     * Gives the total value of the specified droplet.
     * Accounts for all boosts.
     * 
     * @param dropletModel Droplet to calculate
     * @param includesGlobalBoosts Whether to include global boosts e.g. Dark Matter, Funds bombs. This is useful for {@link Condenser}
     * @param includesUpgrades Whether to include upgrades introduced by {@link Upgrader} items
     * @param enforce Whether to enforce the includesUpgrades parameter. This is useful for {@link SkyDroplet}
     * @returns The value of the droplet, and the nerf applied to it.
     */
    calculateDropletValue(dropletModel: BasePart, includesGlobalBoosts: boolean, includesUpgrades: boolean, enforce?: boolean) {
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
            this.performSoftcaps(worth.amountPerCurrency);
        }

        return $tuple(worth.mul(nerf), nerf);
    }
}