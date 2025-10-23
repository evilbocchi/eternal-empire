import { formatGradient, getAllInstanceInfo } from "@antivivi/vrldk";
import { Workspace } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import StatusEffect from "shared/item/traits/status/StatusEffect";

declare global {
    interface ItemTraits {
        Massless: Massless;
        Grounder: Grounder;
    }

    interface StatusEffectAssets {
        Fire: ParticleEmitter;
    }
}

const format = (str: string) => {
    return str.gsub(
        "%%massless%%",
        formatGradient("Massless", new Color3(0.16, 0.96, 0.69), new Color3(0, 1, 0.53)),
    )[0];
};

export default class Massless extends StatusEffect {
    static BOOST = CurrencyBundle.ones().mulConstant(1.2);

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Massless.load(model, this));
    }

    decorate(dropletModel: BasePart) {
        const dropletInfo = getAllInstanceInfo(dropletModel);
        dropletModel.CustomPhysicalProperties = new PhysicalProperties(0.0001, 2, 0.15);
        dropletInfo.Upgrades!.set("Massless", {
            model: Workspace,
            boost: {
                mul: Massless.BOOST,
            },
        });

        return {};
    }

    format(str: string) {
        return format(str);
    }
}

export class Grounder extends StatusEffect {
    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Grounder.load(model, this));
    }

    decorate(dropletModel: BasePart) {
        const dropletInfo = getAllInstanceInfo(dropletModel);
        dropletModel.CustomPhysicalProperties = Droplet.PHYSICAL_PROPERTIES;
        dropletInfo.Upgrades!.delete("Massless");
        return {};
    }

    format(str: string) {
        return format(str);
    }
}
