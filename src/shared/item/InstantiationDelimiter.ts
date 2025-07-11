import { AREAS } from "shared/constants";
import Item from "shared/item/Item";
import { GameUtils } from "shared/utils/ItemUtils";

declare global {
    interface ItemTypes {
        InstantiationDelimiter: InstantiationDelimiter;
    }
}

class InstantiationDelimiter extends Item {

    dropletIncrease: number | undefined;

    constructor(id: string) {
        super(id);
        this.types.add("InstantiationDelimiter");
        this.onLoad((model, item) => {
            const area = model.GetAttribute("Area") as AreaId | undefined;
            if (area === undefined)
                error("HOW!?!?!");
            const a = new Instance("IntValue");
            a.Name = model.Name;
            a.Parent = AREAS[area].dropletLimit;
            item.repeat(model, () => {
                const n = GameUtils.getInstanceInfo(model, "Maintained") === true ? this.dropletIncrease : 0;
                if (n !== a.Value && n !== undefined)
                    a.Value = n;
            });
            model.Destroying.Once(() => a.Destroy());
            this.maintain(model);
        });
    }

    setDropletIncrease(dropletIncrease: number) {
        this.dropletIncrease = dropletIncrease;
        return this;
    }
}

export = InstantiationDelimiter;