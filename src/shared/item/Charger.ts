import { Debris } from "@rbxts/services";
import Price from "shared/Price";
import Item from "shared/item/Item";

class Charger extends Item {
    
    radius: number | undefined;
    formula: ((val: Price) => Price) | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Charger");
        this.onLoad((model, utils) => {
            const hitbox = model.PrimaryPart;
            if (hitbox === undefined) {
                return;
            }
            const connection = model.FindFirstChild("ConnectionVFX");
            if (connection !== undefined) {
                connection.Parent = script;
            }
            let isMaintained = false;
            this.maintain(model, utils, (i) => isMaintained = i);
            this.repeat(model, () => {
                if (!isMaintained) {
                    return;
                }
                const radius = this.getRadius();
                for (const m of utils.getPlacedItems().GetChildren()) {
                    if (!m.IsA("Model")) {
                        continue;
                    }
                    const h = m.PrimaryPart;
                    const boostsFolder = m.FindFirstChild("Boosts");
                    
                    if (boostsFolder !== undefined && h !== undefined && h.Name === "Hitbox" && radius !== undefined) {
                        const hPos = h.Position;
                        const hitboxPos = hitbox.Position;
                        const xDiff = hPos.X - hitboxPos.X;
                        const zDiff = hPos.Z - hitboxPos.Z;
                        if ((xDiff * xDiff) + (zDiff * zDiff) > (radius * radius)) {
                            continue;
                        }

                        const indicator = new Instance("BoolValue");
                        indicator.Name = model.Name;
                        indicator.Parent = boostsFolder;
                        if (connection !== undefined) {
                            if (m.FindFirstChild("ConnectionVFX" + model.Name) === undefined) {
                                const c = connection.Clone();
                                const start = c.WaitForChild("Start") as Attachment;
                                const e = c.WaitForChild("End") as Attachment;
                                start.Parent = hitbox;
                                e.Parent = h;
                                c.Name = "ConnectionVFX" + model.Name;
                                c.Parent = m;
                                start.Position = new Vector3();
                                e.Position = new Vector3();
                                c.Destroying.Once(() => {
                                    start.Destroy();
                                    e.Destroy();
                                });
                            }
                            task.delay(3, () => {
                                if (boostsFolder.FindFirstChild(model.Name) === undefined) {
                                    const f = h.FindFirstChild("ConnectionVFX");
                                    if (f !== undefined) {
                                        f.Destroy();
                                    }
                                }
                            });
                        }
                        Debris.AddItem(indicator, 2);
                    }
                }
            }, 2);
            task.spawn(() => {
                
            });
        });
    }

    getRadius() {
        return this.radius;
    }

    setRadius(radius: number) {
        this.radius = radius;
        return this;
    }
    
    getFormula() {
        return this.formula;
    }

    setFormula(formula: (val: Price) => Price) {
        this.formula = formula;
        return this;
    }
}

export = Charger;