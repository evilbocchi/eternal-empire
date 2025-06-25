import { AREAS } from "shared/Area";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import { getInstanceInfo } from "@antivivi/vrldk";

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
        if (area === undefined)
            throw `InstantiationDelimiter: ${model.Name} is not in an area`;

        const indicator = new Instance("IntValue");
        indicator.Name = model.Name;
        indicator.Parent = AREAS[area].dropletLimit;
        item.repeat(model, () => {
            const actual = getInstanceInfo(model, "Maintained") === true ?
                (getInstanceInfo(model, "DropletIncrease") ?? delimiter.dropletIncrease) : 0;
            if (actual !== indicator.Value && actual !== undefined)
                indicator.Value = actual;
        });
        model.Destroying.Once(() => indicator.Destroy());
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