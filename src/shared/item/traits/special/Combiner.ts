import { findBaseParts } from "@antivivi/vrldk";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import Operative from "shared/item/traits/Operative";

export default class Combiner extends ItemTrait {

    constructor(item: Item) {
        super(item);
    }

    combine(...items: Item[]) {
        let [totalAdd, totalMul, totalPow] = Operative.template();
        let totalDamage = 0;
        for (const item of items) {
            if (item.MODEL === undefined)
                continue;
            const laserCount = findBaseParts(item.MODEL, "Laser").size();
            const upgrader = item.findTrait("Upgrader");
            if (upgrader !== undefined) {
                for (let i = 0; i < laserCount; i++) {
                    [totalAdd, totalMul, totalPow] = upgrader.apply(totalAdd, totalMul, totalPow);
                }
            }
            const damager = item.findTrait("Damager");
            if (damager !== undefined) {
                totalDamage += damager.damage * laserCount;
            }
        }
        for (const [currency, amount] of totalMul.amountPerCurrency) {
            if (amount.equals(1)) {
                totalMul.amountPerCurrency.delete(currency);
            }
        }


    }
}