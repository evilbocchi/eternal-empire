import { getInstanceInfo } from "@antivivi/vrldk";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import { AREAS } from "shared/world/Area";

declare global {
    interface ItemTraits {
        InstantiationDelimiter: InstantiationDelimiter;
    }

    interface InstanceInfo {
        DropletIncrease?: number;
    }
}

export default class InstantiationDelimiter extends ItemTrait {
    static load(model: Model, delimiter: InstantiationDelimiter) {
        const item = delimiter.item;

        const area = model.GetAttribute("Area") as AreaId | undefined;
        if (area === undefined) throw `InstantiationDelimiter: ${model.Name} is not in an area`;

        item.repeat(
            model,
            () => {
                const actual =
                    getInstanceInfo(model, "Maintained") === true
                        ? (getInstanceInfo(model, "DropletIncrease") ?? delimiter.dropletIncrease)
                        : 0;
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
