import { findBaseParts, getAllInstanceInfo } from "@antivivi/vrldk";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import isPlacedItemUnusable from "shared/item/utils/isPlacedItemUnusable";
import { VirtualCollision } from "shared/item/utils/VirtualReplication";

declare global {
    interface ItemTraits {
        Transformer: Transformer;
    }
}

class Transformer extends Conveyor {
    static load(model: Model, transformer: Transformer) {
        const modelInfo = getAllInstanceInfo(model);
        const item = transformer.item;

        for (const part of findBaseParts(model, "Transformer")) {
            VirtualCollision.onDropletTouched(model, part, (otherPart) => {
                if (isPlacedItemUnusable(modelInfo)) return;

                const instanceInfo = getAllInstanceInfo(otherPart);
                if (instanceInfo.Incinerated === true) return;

                const dropletId = instanceInfo.DropletId;
                if (dropletId === item.id) return;

                const droplet = Droplet.getDroplet(dropletId!);
                if (droplet === undefined) return;

                const resultingDroplet = transformer.getResult(droplet);
                if (resultingDroplet === undefined) return;

                const resultingDropletModel = resultingDroplet.model as BasePart | undefined;
                if (resultingDropletModel === undefined) return;

                otherPart.Color = resultingDropletModel.Color;
                otherPart.Material = resultingDropletModel.Material;
                otherPart.Size = resultingDropletModel.Size;
                for (const tag of resultingDropletModel.GetTags()) otherPart.AddTag(tag);
                instanceInfo.DropletId = resultingDroplet.id;
            });
        }
    }

    resultPerDroplet = new Map<Droplet, Droplet>();
    results: Droplet[] = [];
    defaultResult: Droplet | undefined = undefined;

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Transformer.load(model, this));
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
