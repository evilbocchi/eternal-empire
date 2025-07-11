//!native

import { RunService, TweenService } from "@rbxts/services";
import { AREAS, getSound } from "shared/constants";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import { findBaseParts } from "shared/utils/vrldk/BasePartUtils";

class Dropper extends Item {

    static wrapInstantiator(drop: BasePart, instantiator: () => BasePart) {
        const sound = getSound("Drop").Clone();
        sound.Parent = drop;
        const originalSize = drop.Size;
        const bigSize = originalSize.add(new Vector3(0.25, 0.25, 0.25));
        const tweenInfo = new TweenInfo(0.2);
        return () => {
            drop.Size = bigSize;
            TweenService.Create(drop, tweenInfo, { Size: originalSize }).Play();
            sound.Play();
            const droplet = instantiator();
            const originalDropletSize = droplet.Size;
            droplet.Size = new Vector3(0.01, 0.01, 0.01);
            TweenService.Create(droplet, tweenInfo, { Size: originalDropletSize }).Play();
            return droplet;
        }
    }

    static load(model: Model, utils: GameUtils, item: Dropper) {
        const drops = findBaseParts(model, "Drop");
        for (const [drop, _droplet] of item.dropletPerDrop) {
            const part = model.FindFirstChild(drop);
            if (part !== undefined && part.IsA("Part")) {
                drops.push(part);
            }
        }
        for (const d of drops) {
            let instantiator = item.getDroplet(d.Name)?.getInstantiator(model, d.CFrame, utils);
            const areaId = utils.getPlacedItem(model.Name)?.area;
            if (instantiator !== undefined && areaId !== undefined) {
                const area = AREAS[areaId as keyof (typeof AREAS)];
                const dropletLimit = area.dropletLimit;
                const dropletCount = area.areaFolder.WaitForChild("DropletCount") as IntValue;
                let t = 0;
                instantiator = Dropper.wrapInstantiator(d, instantiator);
                item.instantiatorPerDrop.set(d, instantiator);
                const connection = RunService.Heartbeat.Connect((deltaTime) => {
                    const dropRate = d.GetAttribute("DropRate") as number | undefined ?? item.dropRate;
                    if (dropRate === undefined) {
                        return;
                    }
                    t += deltaTime;
                    if (t > 1 / dropRate && instantiator !== undefined) {
                        if (dropletCount.Value > dropletLimit.Value) {
                            return;
                        }
                        t = 0;
                        instantiator();
                    }
                });
                model.Destroying.Once(() => {
                    connection.Disconnect();
                    item.instantiatorPerDrop.delete(d);
                });
            }
        }
    }
    
    droplet: Droplet | undefined;
    dropletPerDrop = new Map<string, Droplet>();
    instantiatorPerDrop = new Map<BasePart, () => void>();
    dropRate: number | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Dropper");
        this.onLoad((model, utils) => Dropper.load(model, utils, this));
    }

    getDroplet(dropPart?: string) {
        if (dropPart !== undefined) {
            const cached = this.dropletPerDrop.get(dropPart);
            if (cached !== undefined) {
                return cached;
            }
        }
        return this.droplet;
    }

    setDroplet(droplet: Droplet, dropPart?: string) {
        if (dropPart !== undefined) {
            this.dropletPerDrop.set(dropPart, droplet);
            return this;
        }
        this.droplet = droplet;
        return this;
    }

    setDropRate(dropRate: number) {
        this.dropRate = dropRate;
        return this;
    }
}

export = Dropper;