import { getAllInstanceInfo } from "@antivivi/vrldk";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface StatusEffectAssets {}

    interface Assets {
        StatusEffect: StatusEffectAssets;
    }

    interface StatusEffectInfo {}

    interface InstanceInfo {
        /**
         * The status effects applied to this droplet.
         */
        statusEffects?: Map<StatusEffect, StatusEffectInfo>;
    }
}

/**
 * A status effect applies a special effect to a droplet.
 */
export default abstract class StatusEffect extends ItemTrait {
    active = true;

    static load(model: Model, statusEffect: StatusEffect) {
        const modelInfo = getAllInstanceInfo(model);
        const onUpgraded = modelInfo.upgraderTriggered;
        if (onUpgraded === undefined)
            throw `Tried to load StatusEffect on model without OnUpgraded event: ${model.GetFullName()}`;

        onUpgraded.connect((dropletModel) => {
            if (statusEffect.active === false) {
                return;
            }
            const dropletInfo = getAllInstanceInfo(dropletModel);
            const statusEffects = dropletInfo.statusEffects ?? new Map<StatusEffect, StatusEffectInfo>();
            if (statusEffects.has(statusEffect)) {
                return;
            }

            statusEffects.set(statusEffect, statusEffect.decorate(dropletModel));
            dropletInfo.statusEffects = statusEffects;
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
