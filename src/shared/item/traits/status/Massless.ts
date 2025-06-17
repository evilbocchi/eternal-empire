import { formatGradient, getAllInstanceInfo } from "@antivivi/vrldk";
import { Workspace } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { ASSETS } from "shared/GameAssets";
import Item from "shared/item/Item";
import StatusEffect from "shared/item/traits/status/StatusEffect";

declare global {
    interface ItemTraits {
        Massless: Massless;
    }

    interface StatusEffectAssets {
        Fire: ParticleEmitter;
    }
}

export default class Massless extends StatusEffect {

    static BOOST = CurrencyBundle.ones().mul(1.2);

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Massless.load(model, this));
    }

    decorate(dropletModel: BasePart) {
        const dropletInfo = getAllInstanceInfo(dropletModel);
        dropletModel.CustomPhysicalProperties = new PhysicalProperties(0.0001, 2, 0.15);
        dropletInfo.Upgrades!.set("Massless", {
            Upgrader: Workspace,
            Boost: {
                mul: Massless.BOOST,
            }
        });
        ASSETS.StatusEffect.Fire.Clone().Parent = dropletModel;

        return {};
    }

    format(str: string): string {
        return str.gsub("%%massless%%", formatGradient("Massless", new Color3(0.16, 0.96, 0.69), new Color3(0, 1, 0.53)))[0];
    }
}