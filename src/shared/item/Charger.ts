import { Debris } from "@rbxts/services";
import Price from "shared/Price";
import Item from "shared/item/Item";

class Charger extends Item {
    
    radius: number | undefined;
    generatorBoost: Price | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Charger");
        this.onLoad((model, utils) => {
            const hitbox = model.PrimaryPart;
            if (hitbox === undefined) {
                return;
            }
            const connection = model.FindFirstChild("ConnectionVFX");
            this.repeat(model, () => {
                for (const m of utils.getPlacedItems().GetChildren()) {
                    if (!m.IsA("Model")) {
                        continue;
                    }
                    const h = m.PrimaryPart;
                    if (h !== undefined && h.Name === "Hitbox" && h.Position.sub(hitbox.Position).Magnitude <= 5) {
                        const indicator = new Instance("BoolValue");
                        indicator.Name = model.Name;
                        indicator.Parent = m.WaitForChild("Boosts");
                        if (connection !== undefined) {
                            const c = connection.Clone();
                            const start = c.WaitForChild("Start") as Attachment;
                            const end = c.WaitForChild("Start") as Attachment;
                            start.Position = new Vector3();
                            end.Position = new Vector3();
                            start.Parent = hitbox;
                            end.Parent = h;
                            c.Parent = h;
                            
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
    
    getGeneratorBoost() {
        return this.generatorBoost;
    }

    setGeneratorBoost(generatorBoost: Price) {
        this.generatorBoost = generatorBoost;
        return this;
    }
}

export = Charger;