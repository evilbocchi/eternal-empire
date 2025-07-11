//!native
//!optimize 2

import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { Service } from "@flamework/core";
import { BombsService } from "server/services/BombsService";
import { DarkMatterService } from "server/services/DarkMatterService";
import { DataService } from "server/services/serverdata/DataService";
import { OmniUpgrader } from "shared/item/Special";
import Upgrader from "shared/item/Upgrader";
import Items from "shared/items/Items";
import { PriceUpgrade } from "shared/namedupgrade/NamedUpgrade";
import Price from "shared/Price";
import Softcaps, { performSoftcap } from "shared/Softcaps";

@Service()
export class RevenueService {

    constructor(private dataService: DataService, private darkMatterService: DarkMatterService, private bombsService: BombsService) {

    }

    /**
     * Gets the boosts an upgrade from an Upgrader would give.
     * 
     * @param upgradeInfo Upgrade information
     * @returns Boosts
     */
    getUpgrade(upgradeInfo: UpgradeInfo) {
        if (upgradeInfo.Upgrader === undefined || upgradeInfo.Upgrader.Parent === undefined || upgradeInfo.EmptyUpgrade === true)
            return $tuple(undefined, undefined, undefined);

        const item = Items.getItem(upgradeInfo.UpgraderId!) as Upgrader | undefined;
        if (item === undefined)
            return $tuple(undefined, undefined, undefined);

        const omni = upgradeInfo.Omni;
        const isNotOmni = omni === undefined;
        const toAdd = isNotOmni ? item.add : (item as OmniUpgrader).addsPerLaser.get(omni);
        const toMul = isNotOmni ? item.mul : (item as OmniUpgrader).mulsPerLaser.get(omni);
        const toPow = item.pow;

        return $tuple(toAdd, toMul, toPow);
    }

    /**
     * Apply boosts that are globally put upon every revenue source.
     * 
     * @param add Additive Price instance
     * @param mul Multiplicative Price instance
     * @param pow Exponential Price instance
     * @param upgrades Upgrades for the revenue source
     * @returns Boosts
     */
    applyGlobal(add: Price, mul: Price, pow: Price, upgrades?: Map<string, PriceUpgrade>) {
        // dark matter
        mul = mul.mul(this.darkMatterService.boost);

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

    applySoftcaps(value: Map<Currency, OnoeNum>) {
        const bal = this.dataService.empireData.currencies;
        for (let [currency, amount] of value) {
            const softcaps = Softcaps[currency];
            if (softcaps === undefined)
                continue;
            const inBal = bal.get(currency);
            const highest = inBal === undefined || inBal.lessThan(amount) ? amount : inBal; 
            
            const [divSoftcap] = performSoftcap(highest, softcaps.div);
            if (divSoftcap !== undefined) {
                value.set(currency, amount.div(divSoftcap));
            }

            const [recippowSoftcap] = performSoftcap(highest, softcaps.recippow);
            if (recippowSoftcap !== undefined) {
                value.set(currency, amount.pow(new OnoeNum(1).div(recippowSoftcap)));
            }
        }
        return value;
    }

    coalesce(value: Price, add: Price, mul: Price, pow: Price) {
        return value.add(add).mul(mul).pow(pow);
    }
}