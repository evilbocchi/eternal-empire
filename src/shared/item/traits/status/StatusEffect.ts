import { getAllInstanceInfo, getInstanceInfo } from "@antivivi/vrldk";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface StatusEffectAssets {

    }

    interface Assets {
        StatusEffect: StatusEffectAssets;
    }

    interface StatusEffectInfo {

    }

    interface InstanceInfo {
        StatusEffects?: Map<StatusEffect, StatusEffectInfo>;
    }
}

/**
 * A status effect applies a special effect to a droplet.
 */
export default abstract class StatusEffect extends ItemTrait {

    active = true;

    static load(model: Model, statusEffect: StatusEffect) {
        getInstanceInfo(model, "OnUpgraded")!.connect((dropletModel) => {
            if (statusEffect.active === false) {
                return;
            }
            const dropletInfo = getAllInstanceInfo(dropletModel);
            const statusEffects = dropletInfo.StatusEffects ?? new Map<StatusEffect, StatusEffectInfo>();
            if (statusEffects.has(statusEffect)) {
                return;
            }

            statusEffects.set(statusEffect, statusEffect.decorate(dropletModel));
            dropletInfo.StatusEffects = statusEffects;
        });
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => StatusEffect.load(model, this));
    }

    setActive(active: boolean) {
        this.active = active;
        return this;
    }

    abstract decorate(dropletModel: BasePart): StatusEffectInfo;
}