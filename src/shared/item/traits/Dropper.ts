//!native
//!optimize 2

import { Players, RunService } from "@rbxts/services";
import Area, { AREAS } from "shared/Area";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import GameSpeed from "shared/GameSpeed";
import Droplet, { DROPLET_STORAGE } from "shared/item/Droplet";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { GameUtils } from "shared/item/ItemUtils";
import { findBaseParts } from "@antivivi/vrldk";
import { formatRichText } from "@antivivi/vrldk";

declare global {
    interface ItemTraits {
        Dropper: Dropper;
    }

    interface Modifier {
        multi: number;
    }

    interface InstanceInfo {
        DropRate?: number;
        DropRateModifiers?: Set<Modifier>;
        LastDrop?: number;
        DropletLimitValue?: IntValue;
        Instantiator?: () => void;
    }
}

export default class Dropper extends ItemTrait {

    static wrapInstantiator(instantiator: () => BasePart, dropper: Dropper) {
        const callback = dropper.dropletProduced;
        return () => {
            const droplet = instantiator();
            droplet.Parent = DROPLET_STORAGE;

            const player = Players.GetPlayerByUserId(GameUtils.empireData.owner) ?? Players.GetPlayers()[0];
            if (player !== undefined) {
                droplet.SetNetworkOwner(player);
            }


            if (callback !== undefined)
                callback(droplet, dropper);
            return droplet;
        };
    }

    static load(model: Model, dropper: Dropper) {
        const drops = findBaseParts(model, "Drop");
        for (const [drop, _droplet] of dropper.dropletPerDrop) {
            const part = model.FindFirstChild(drop);
            if (part !== undefined && part.IsA("Part")) {
                drops.push(part);
            }
        }
        for (const drop of drops) {
            drop.AddTag("Drop");
            drop.SetAttribute("OriginalSize", drop.Size);
            let instantiator = dropper.getDroplet(drop.Name)?.getInstantiator(model, drop);
            const areaId = GameUtils.itemsService.getPlacedItem(model.Name)?.area as AreaId | undefined;
            const info = getAllInstanceInfo(drop);
            info.Area = areaId;

            info.DropletLimitValue = areaId === undefined ? Area.globalDropletLimit : AREAS[areaId].dropletLimit;
            info.DropRateModifiers = new Set();
            info.DropRate = dropper.dropRate;

            if (instantiator !== undefined) {
                info.Instantiator = Dropper.wrapInstantiator(instantiator, dropper);
            }

            Dropper.SPAWNED_DROPS.set(drop, info);
            model.Destroying.Once(() => Dropper.SPAWNED_DROPS.delete(drop));
        }
    }

    static readonly SPAWNED_DROPS = new Map<BasePart, InstanceInfo>();

    readonly dropletPerDrop = new Map<string, Droplet>();
    dropletProduced: ((droplet: BasePart, item: this) => void) | undefined;
    droplet: Droplet | undefined;
    dropRate = 0;

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Dropper.load(model, this));
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

    format(str: string) {
        const droplet = this.droplet;
        if (droplet === undefined)
            return str;
        const value = droplet.value;
        if (value === undefined)
            return str;

        str = str.gsub("%%val%%", value.toString(true))[0];
        str = str.gsub("%%health%%", formatRichText(`${droplet.health} HP`, CURRENCY_DETAILS.Health.color))[0];
        return str;
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
                    const dropletCount = GameUtils.dropletCountPerArea.get(info.Area!);
                    if (dropletCount !== undefined && dropletCount > info.DropletLimitValue!.Value)
                        continue;
                    info.LastDrop = t;
                    info.Instantiator!();
                }
            }
        });
    }
}