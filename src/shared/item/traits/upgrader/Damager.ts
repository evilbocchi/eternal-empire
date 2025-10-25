import { formatRichText, getAllInstanceInfo } from "@antivivi/vrldk";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

declare global {
    interface ItemTraits {
        Damager: Damager;
    }
}

export default class Damager extends ItemTrait {
    damage = 0;
    variance = 0;

    static load(model: Model, damager: Damager) {
        const modelInfo = getAllInstanceInfo(model);
        const onUpgraded = modelInfo.upgraderTriggered;
        if (!onUpgraded) throw `Damager trait requires OnUpgraded to be present on item ${damager.item.id}`;

        onUpgraded.connect((droplet) => {
            const dropletInfo = getAllInstanceInfo(droplet);
            if (dropletInfo.health === undefined) return;

            let damage = damager.damage;
            if (damager.variance > 0) {
                const vary = damager.variance * damage;
                damage = math.random(damage - vary, damage + vary);
            }

            dropletInfo.health! -= damage;
        });
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Damager.load(model, this));
        item.trait(Upgrader);
    }

    setDamage(damage: number) {
        this.damage = damage;
        return this;
    }

    /**
     * Sets the variance percentage for the damage dealt, where 0 means no variance and 1 means up to 100% variance.
     * @param variance A value between 0 and 1 representing the variance percentage.
     * @returns The Damager instance.
     */
    setVariance(variance: number) {
        this.variance = variance;
        return this;
    }

    format(str: string): string {
        const heal = -this.damage;
        const label = heal > 0 ? `+${heal} HP` : `${heal} HP`;
        return str.gsub("%%hp_add%%", formatRichText(label, CURRENCY_DETAILS.Health.color))[0];
    }
}
