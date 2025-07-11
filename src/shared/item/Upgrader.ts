import Price from "shared/Price";
import Conveyor from "shared/item/Conveyor";
import { findBaseParts } from "shared/utils/vrldk/BasePartUtils";

class Upgrader extends Conveyor {

    add: Price | undefined = undefined;
    mul: Price | undefined = undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Upgrader");
        this.onLoad((model, utils) => {
            const lasers = findBaseParts(model, "Laser");
            let i = 0;
            for (const d of lasers) {
                d.Name = tostring(i);
                const f = model.Name + d.Name;
                d.Touched.Connect((droplet) => {
                    if (droplet.Name !== "Droplet")
                        return;
                    let l = droplet.FindFirstChild(f) as ObjectValue | undefined;
                    if (l === undefined && model.GetAttribute("Maintained") === true) {
                        l = new Instance("ObjectValue");
                        l.Name = f;
                        l.Value = model;
                        l.SetAttribute("ItemId", this.id);
                        l.Parent = droplet;
                    }
                });
                const o = d.Transparency;
                model.GetAttributeChangedSignal("Maintained").Connect(() => d.Transparency = model.GetAttribute("Maintained") === true ? o : 1);
                i++;
            }
            this.maintain(model, utils);
        });
    }

    getAdd() {
        return this.add;
    }

    setAdd(add: Price) {
        this.add = add;
        return this;
    }

    getMul() {
        return this.mul;
    }

    setMul(mul: Price) {
        this.mul = mul;
        return this;
    }
}

export = Upgrader;