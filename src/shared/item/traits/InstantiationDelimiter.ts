import { getAllInstanceInfo } from "@antivivi/vrldk";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import isPlacedItemUnusable from "shared/item/utils/isPlacedItemUnusable";
import { AREAS } from "shared/world/Area";

declare global {
    interface ItemTraits {
        InstantiationDelimiter: InstantiationDelimiter;
    }

    interface InstanceInfo {
        /**
         * The amount that the item model increases the droplet limit, overriding
         * the {@link InstantiationDelimiter}'s value if set.
         */
        dropletIncrease?: number;
    }
}

export default class InstantiationDelimiter extends ItemTrait {
    static load(model: Model, delimiter: InstantiationDelimiter) {
        const item = delimiter.item;

        const modelInfo = getAllInstanceInfo(model);
        const area = modelInfo.areaId;
        if (area === undefined) throw `InstantiationDelimiter ${model.Name} is not in an area`;

        item.repeat(
            model,
            () => {
                const baseIncrease = modelInfo.dropletIncrease ?? delimiter.dropletIncrease;
                const actual = isPlacedItemUnusable(modelInfo) ? 0 : baseIncrease;
                AREAS[area].boostDropletLimit(model.Name, actual);
            },
            1,
        );
        model.Destroying.Once(() => AREAS[area].boostDropletLimit(model.Name));
        item.maintain(model);
    }

    dropletIncrease: number | undefined;

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => InstantiationDelimiter.load(model, this));
    }

    setDropletIncrease(dropletIncrease: number) {
        this.dropletIncrease = dropletIncrease;
        return this;
    }
}
