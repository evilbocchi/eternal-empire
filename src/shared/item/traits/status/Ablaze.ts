import { formatGradient, getAllInstanceInfo } from "@antivivi/vrldk";
import { Workspace } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { ASSETS } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import StatusEffect from "shared/item/traits/status/StatusEffect";

declare global {
    interface ItemTraits {
        Ablaze: Ablaze;
    }

    interface StatusEffectAssets {
        Fire: ParticleEmitter;
    }
}

export default class Ablaze extends StatusEffect {
    static BOOST = CurrencyBundle.ones().mul(2);

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Ablaze.load(model, this));
    }

    decorate(dropletModel: BasePart) {
        const dropletInfo = getAllInstanceInfo(dropletModel);
        this.item.repeat(
            dropletModel,
            (dt) => {
                if (dropletInfo.Incinerated === true) return;
                dropletInfo.Health! -= 10 * dt;
            },
            0.5,
        );
        dropletInfo.Upgrades!.set("Ablaze", {
            Upgrader: Workspace,
            Boost: {
                mul: Ablaze.BOOST,
            },
        });
        ASSETS.StatusEffect.Fire.Clone().Parent = dropletModel;

        return {};
    }

    format(str: string): string {
        return str.gsub("%%ablaze%%", formatGradient("Ablaze", new Color3(0.96, 0.41, 0.16), new Color3(1, 0, 0)))[0];
    }
}
