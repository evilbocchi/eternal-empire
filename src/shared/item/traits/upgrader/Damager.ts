import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import { getInstanceInfo, setInstanceInfo } from "@antivivi/vrldk";
import { formatRichText } from "@antivivi/vrldk";

declare global {
    interface ItemTraits {
        Damager: Damager;
    }
}

export default class Damager extends ItemTrait {
    damage = 0;
    variance = 0;

    static load(model: Model, damager: Damager) {
        getInstanceInfo(model, "OnUpgraded")!.connect((droplet) => {
            const health = getInstanceInfo(droplet, "Health") as number | undefined;
            if (health === undefined) {
                return;
            }
            let damage = damager.damage;
            if (damager.variance > 0) {
                const vary = damager.variance * damage;
                damage = math.random(damage - vary, damage + vary);
            }

            setInstanceInfo(droplet, "Health", health - damage);
        });
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Damager.load(model, this));
    }

    setDamage(damage: number) {
        this.damage = damage;
        return this;
    }

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
