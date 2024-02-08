import { AREAS } from "shared/constants";
import Item from "shared/item/Item";

class InstantiationDelimiter extends Item {
    
    dropletIncrease: number | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("InstantiationDelimiter");
        this.onLoad((model, utils, item) => {
            const area = model.GetAttribute("Area") as keyof (typeof AREAS) | undefined;
            if (area === undefined)
                error("HOW!?!?!");
            const a = new Instance("IntValue");
            a.Name = model.Name;
            a.Parent = AREAS[area].dropletLimit;
            item.repeat(model, () => {
                const n = model.GetAttribute("Maintained") === true ? this.getDropletIncrease() : 0;
                if (n !== a.Value && n !== undefined)
                    a.Value = n;
            });
            this.maintain(model, utils);
        });
    }

    getDropletIncrease() {
        return this.dropletIncrease;
    }

    setDropletIncrease(dropletIncrease: number) {
        this.dropletIncrease = dropletIncrease;
        return this;
    }
}

export = InstantiationDelimiter;