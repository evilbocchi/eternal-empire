import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { findBaseParts } from "@antivivi/vrldk";

declare global {
    interface ItemTraits {
        Transformer: Transformer;
    }
}

class Transformer extends Conveyor {
    static load(model: Model, transformer: Transformer) {
        const item = transformer.item;

        for (const part of findBaseParts(model, "Transformer")) {
            getAllInstanceInfo(part).DropletTouched = (otherPart) => {
                const instanceInfo = getAllInstanceInfo(otherPart);
                if (instanceInfo.Incinerated === true) return;
                const dropletId = instanceInfo.DropletId;
                if (dropletId === item.id) return;
                const droplet = Droplet.getDroplet(dropletId!);
                if (droplet === undefined) return;
                const res = transformer.getResult(droplet);
                if (res === undefined) return;
                const model = res.model as BasePart | undefined;
                if (model === undefined) return;
                otherPart.Color = model.Color;
                otherPart.Material = model.Material;
                otherPart.Size = model.Size;
                for (const tag of model.GetTags()) otherPart.AddTag(tag);
                instanceInfo.DropletId = res.id;
            };
        }
    }

    resultPerDroplet = new Map<Droplet, Droplet>();
    results: Droplet[] = [];
    defaultResult: Droplet | undefined = undefined;

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => {});
    }

    getResult(droplet?: Droplet) {
        if (droplet === undefined) {
            return this.defaultResult;
        } else {
            if (this.results.includes(droplet)) return undefined;
            const result = this.resultPerDroplet.get(droplet);
            return result === undefined ? this.defaultResult : result;
        }
    }

    setResult(result: Droplet, input?: Droplet) {
        if (input === undefined) {
            this.defaultResult = result;
        } else {
            this.resultPerDroplet.set(input, result);
            this.results.push(result);
        }
        return this;
    }
}

export = Transformer;
