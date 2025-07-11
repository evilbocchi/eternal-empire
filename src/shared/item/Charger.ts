//!native

import { Debris } from "@rbxts/services";
import Price from "shared/Price";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";
import Operative from "shared/item/Operative";

class Charger extends Item implements Operative {
    
    ignoreLimit: boolean | undefined;
    radius: number | undefined;
    add: Price | undefined;
    mul: Price | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Charger");
        this.onLoad((model) => {
            const hitbox = model.PrimaryPart;
            if (hitbox === undefined) {
                return;
            }
            const connection = model.FindFirstChild("ConnectionVFX");
            if (connection !== undefined) {
                connection.Parent = script;
            }
            const charging = new Set<Instance>();
            let radius = this.radius;
            if (radius === undefined) {
                warn("No radius for charger");
                return;
            }
            radius += hitbox.Size.X / 2;
            const marker = model.FindFirstChild("Marker");
            const area = model.GetAttribute("Area");
            const watching = new Map<Model, RBXScriptConnection>();
            const checkAdd = (m: Instance) => {
                if (!m.IsA("Model") || m.PrimaryPart === undefined || m.GetAttribute("Area") !== area) {
                    return;
                }
                const h = m.PrimaryPart;
                if (radius !== undefined && radius < 999) {
                    const hPos = h.Position;
                    const hitboxPos = hitbox.Position;
                    const xDiff = hPos.X - hitboxPos.X;
                    const zDiff = hPos.Z - hitboxPos.Z;
                    if ((xDiff * xDiff) + (zDiff * zDiff) > (radius * radius)) {
                        return;
                    }
                }
                const boostsFolder = m.FindFirstChild("Boosts");
                if (boostsFolder === undefined || boostsFolder.FindFirstChild(model.Name) !== undefined) {
                    return;
                }
                const disconnect = () => {
                    const connection = watching.get(m);
                    if (connection !== undefined) {
                        connection.Disconnect();
                        watching.delete(m);
                    }
                }
                if (this.ignoreLimit !== true) {
                    const boosts = boostsFolder.GetChildren();
                    let i = 0;
                    for (const boost of boosts) {
                        if (boost.IsA("BoolValue")) {
                            if (boost.Value !== true)
                                ++i;
                        }
                    }
                    if (i > 1) {
                        if (!watching.has(m)) {
                            disconnect();
                            watching.set(m, boostsFolder.ChildRemoved.Connect(() => {
                                checkAdd(m);
                            }));
                        }
                        return;
                    }
                    disconnect();
                }
                charging.add(m);
                const indicator = new Instance("BoolValue");
                indicator.Name = model.Name;
                indicator.Value = this.ignoreLimit === true;
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
                        c.Parent = m;
                        start.Position = new Vector3();
                        e.Position = new Vector3();
                        c.Destroying.Once(() => {
                            start.Destroy();
                            e.Destroy();
                        });
                    }
                }
                m.Destroying.Once(() => disconnect());
            }
            const checkRemove = (m: Instance) => {
                if (!m.IsA("Model")) {
                    return;
                }
                charging.delete(m);
                const boostsFolder = m.FindFirstChild("Boosts");
                if (boostsFolder === undefined) {
                    return;
                }
                const indicator = boostsFolder.FindFirstChild(model.Name);
                if (indicator === undefined) {
                    warn("No indicator found");
                    return;
                }
                indicator.Destroy();
                const connectionVFX = m.FindFirstChild("ConnectionVFX" + model.Name);
                if (connectionVFX !== undefined) {
                    connectionVFX.ClearAllChildren();
                    Debris.AddItem(connectionVFX, 0.5);
                }
            }

            for (const m of PLACED_ITEMS_FOLDER.GetChildren()) {
                checkAdd(m);
            }
            const connection1 = PLACED_ITEMS_FOLDER.ChildAdded.Connect((m) => checkAdd(m));
            const connection2 = PLACED_ITEMS_FOLDER.ChildRemoved.Connect((m) => checkRemove(m));
            model.Destroying.Connect(() => {
                connection1.Disconnect();
                connection2.Disconnect();
                for (const m of charging) {
                    checkRemove(m);
                }
            });
        });
    }

    ignoresLimit(ignoreLimit: boolean) {
        this.ignoreLimit = ignoreLimit;
        return this;
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