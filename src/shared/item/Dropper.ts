import { RunService } from "@rbxts/services";
import { AREAS } from "shared/constants";
import GameSpeed from "shared/GameSpeed";
import Droplet from "shared/item/Droplet";
import Furnace from "shared/item/Furnace";
import Packets from "shared/network/Packets";
import { GameUtils } from "shared/utils/ItemUtils";
import { findBaseParts } from "shared/utils/vrldk/BasePartUtils";

declare global {
    interface ItemTypes {
        Dropper: Dropper;
    }

    interface InstanceInfo {
        DropRate?: number;
        DropRateModifiers?: Set<{multi: number}>;
        LastDrop?: number;
        DropletLimitValue?: IntValue;
        Instantiator?: () => void;
    }
}

class Dropper extends Furnace {

    static wrapInstantiator(drop: BasePart, instantiator: () => BasePart, item: Dropper) {
        const placedItemId = drop.Parent!.Name;
        const dropId = drop.Name;
        const callback = item.dropletProduced;
        return () => {
            const droplet = instantiator();
            Packets.dropletAdded.fireAll(placedItemId, dropId, droplet.Name);
            if (callback !== undefined)
                callback(droplet, item);
            return droplet;
        };
    }

    static load(model: Model, item: Dropper) {
        const drops = findBaseParts(model, "Drop");
        for (const [drop, _droplet] of item.dropletPerDrop) {
            const part = model.FindFirstChild(drop);
            if (part !== undefined && part.IsA("Part")) {
                drops.push(part);
            }
        }
        for (const d of drops) {
            let instantiator = item.getDroplet(d.Name)?.getInstantiator(model, d.CFrame);
            const areaId = GameUtils.itemsService.getPlacedItem(model.Name)?.area;
            const info = GameUtils.getAllInstanceInfo(d);
            info.Area = areaId as AreaId;
            if (instantiator !== undefined && areaId !== undefined) {
                const area = AREAS[areaId as AreaId];
                info.DropletLimitValue = area.dropletLimit;
                info.DropRateModifiers = new Set();
                info.DropRate = item.dropRate;
                info.Instantiator = Dropper.wrapInstantiator(d, instantiator, item);
                Dropper.SPAWNED_DROPS.set(d, info);
                model.Destroying.Once(() => Dropper.SPAWNED_DROPS.delete(d));
            }
        }
    }

    static readonly SPAWNED_DROPS = new Map<BasePart, InstanceInfo>();
    dropletProduced: ((droplet: BasePart, item: this) => void) | undefined;
    droplet: Droplet | undefined;
    dropletPerDrop = new Map<string, Droplet>();
    dropRate: number | undefined;

    constructor(id: string) {
        super(id);
        this.types.add("Dropper");
        this.onLoad((model) => Dropper.load(model, this));
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

    onDropletProduced(callback: (droplet: BasePart, item: this) => void) {
        this.dropletProduced = callback;
        return this;
    }

    static {
        RunService.Heartbeat.Connect(() => {
            const speed = GameSpeed.speed;
            const t = tick();
            for (const [_d, info] of this.SPAWNED_DROPS) {
                const modifiers = info.DropRateModifiers;
                if (modifiers === undefined)
                    continue;
                if (info.LastDrop === undefined) {
                    info.LastDrop = t;
                    continue;
                }
                let dropRate = info.DropRate;
                if (dropRate === undefined)
                    continue;
                for (const modifier of modifiers)
                    dropRate *= modifier.multi;
                if (dropRate === 0)
                    continue;
                if (t > info.LastDrop + 1 / dropRate / speed) {
                    if (GameUtils.dropletCountPerArea.get(info.Area!)! > info.DropletLimitValue!.Value)
                        continue;
                    info.LastDrop = t;
                    info.Instantiator!();
                }
            }
        });
    }
}

export = Dropper;