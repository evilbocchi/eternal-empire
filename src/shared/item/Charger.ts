import Price from "shared/Price";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";

class Charger extends Item {
    
    radius: number | undefined;
    mul: Price | undefined;

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
            const charging = new Set<Instance>();
            const radius = this.radius;
            if (radius === undefined) {
                warn("No radius for charger");
                return;
            }
            const marker = model.FindFirstChild("Marker");
            let maintained = false;
            const area = model.GetAttribute("Area");
            const checkAdd = (m: Instance) => {
                if (maintained === false || !m.IsA("Model") || m.PrimaryPart === undefined || m.GetAttribute("Area") !== area) {
                    return;
                }
                const h = m.PrimaryPart;
                if (radius < 999) {
                    const hPos = h.Position;
                    const hitboxPos = hitbox.Position;
                    const xDiff = hPos.X - hitboxPos.X;
                    const zDiff = hPos.Z - hitboxPos.Z;
                    if ((xDiff * xDiff) + (zDiff * zDiff) > (radius * radius)) {
                        return;
                    }
                }
                charging.add(m);
                const boostsFolder = m.FindFirstChild("Boosts");
                if (boostsFolder === undefined) {
                    return;
                }
                const indicator = new Instance("BoolValue");
                indicator.Name = model.Name;
                indicator.Parent = boostsFolder;
                if (connection !== undefined) {
                    const name = "ConnectionVFX" + model.Name;
                    if (m.FindFirstChild(name) === undefined) {
                        const c = connection.Clone();
                        const start = c.WaitForChild("Start") as Attachment;
                        const e = c.WaitForChild("End") as Attachment;
                        start.Parent = marker ?? hitbox;
                        e.Parent = m.FindFirstChild("Marker") ?? h;
                        c.Name = name;
                        c.Parent = h;
                        start.Position = new Vector3();
                        e.Position = new Vector3();
                        c.Destroying.Once(() => {
                            start.Destroy();
                            e.Destroy();
                        });
                    }
                }
            }
            const checkRemove = (m: Instance) => {
                if (!m.IsA("Model")) {
                    return;
                }
                charging.delete(m);
                const boostsFolder = model.FindFirstChild("Boosts");
                if (boostsFolder === undefined) {
                    return;
                }
                const indicator = boostsFolder.FindFirstChild(model.Name);
                if (indicator === undefined) {
                    warn("No indicator found");
                    return;
                }
                indicator.Destroy();
                m.FindFirstChild("ConnectionVFX" + model.Name)?.Destroy();
            }

            for (const m of PLACED_ITEMS_FOLDER.GetChildren()) {
                checkAdd(m);
            }
            PLACED_ITEMS_FOLDER.ChildAdded.Connect((m) => checkAdd(m));
            PLACED_ITEMS_FOLDER.ChildRemoved.Connect((m) => checkRemove(m));
            model.Destroying.Connect(() => {
                for (const m of charging) {
                    checkRemove(m);
                }
            });

            this.maintain(model, utils, (maintain) => {
                if (maintain !== maintained) {
                    maintained = maintain;
                    if (maintain === true) {
                        for (const m of PLACED_ITEMS_FOLDER.GetChildren()) {
                            checkAdd(m);
                        }
                    }
                    else {
                        for (const m of PLACED_ITEMS_FOLDER.GetChildren()) {
                            checkRemove(m);
                        }
                    }
                }
            });
        });
    }

    setRadius(radius: number) {
        this.radius = radius;
        return this;
    }

    setMul(mul: Price) {
        this.mul = mul;
        return this;
    }
}

export = Charger;