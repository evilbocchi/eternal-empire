import { DROPLETS_FOLDER } from "shared/constants";
import Conveyor from "shared/item/Conveyor";
import Droplet from "shared/item/Droplet";
import { GameUtils } from "shared/utils/ItemUtils";
import { findBaseParts } from "shared/utils/vrldk/BasePartUtils";

declare global {
    interface ItemTypes {
        Transformer: Transformer;
    }
}

class Transformer extends Conveyor {

    resultPerDroplet = new Map<Droplet, Droplet>();
    results: Droplet[] = [];
    defaultResult: Droplet | undefined = undefined;


    constructor(id: string) {
        super(id);
        this.types.add("Transformer");
        this.onLoad((model) => {
            const transformers = findBaseParts(model, "Transformer");
            for (const t of transformers) {
                t.Touched.Connect((d) => {
                    const instanceInfo = GameUtils.getAllInstanceInfo(d);
                    if (d.Parent !== DROPLETS_FOLDER || instanceInfo.Incinerated === true)
                        return;
                    const dropletId = instanceInfo.DropletId;
                    if (dropletId === this.id)
                        return;
                    const droplet = Droplet.getDroplet(dropletId!);
                    if (droplet === undefined)
                        return;
                    const res = this.getResult(droplet);
                    if (res === undefined)
                        return;
                    const model = res.model as BasePart | undefined;
                    if (model === undefined)
                        return;
                    d.Color = model.Color;
                    d.Material = model.Material;
                    d.Size = model.Size;
                    d.SetAttribute("Rainbow", model.GetAttribute("Rainbow"));
                    instanceInfo.DropletId = res.id;
                });
            }
        });
    }

    getResult(droplet?: Droplet) {
        if (droplet === undefined) {
            return this.defaultResult;
        }
        else {
            if (this.results.includes(droplet))
                return undefined;
            const result = this.resultPerDroplet.get(droplet);
            return result === undefined ? this.defaultResult : result;
        }
    }

    setResult(result: Droplet, input?: Droplet) {
        if (input === undefined) {
            this.defaultResult = result;
        }
        else {
            this.resultPerDroplet.set(input, result);
            this.results.push(result);
        }
        return this;
    }
}

export = Transformer;