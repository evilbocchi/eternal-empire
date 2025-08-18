//!native
//!optimize 2

import { findBaseParts, formatRichText, getAllInstanceInfo } from "@antivivi/vrldk";
import { Players, RunService } from "@rbxts/services";
import Area, { AREAS } from "shared/Area";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import GameSpeed from "shared/GameSpeed";
import Droplet, { DROPLET_STORAGE } from "shared/item/Droplet";
import Item from "shared/item/Item";
import { Server } from "shared/item/ItemUtils";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Dropper: Dropper;
    }

    interface InstanceInfo {
        DropRate?: number;
        LastDrop?: number;
        DropletLimitValue?: IntValue;
        Instantiator?: () => void;
    }
}

export default class Dropper extends ItemTrait {

    /**
     * Wraps an instantiator function to create a droplet.
     * This function will set the parent of the droplet to the DROPLET_STORAGE,
     * set the network owner to the player, and handle lucky droplet spawning.
     * 
     * @param instantiator The function that creates the droplet.
     * @param dropper The dropper item that produced the droplet.
     * @param model The model of the item.
     * @param drop The drop part that the droplet is associated with.
     * @returns A new instantiator function that produces a droplet.
     */
    static wrapInstantiator(instantiator: () => BasePart, dropper: Dropper, model: Model, drop: BasePart) {
        const callback = dropper.dropletProduced;
        return () => {
            const droplet = instantiator();
            droplet.Parent = DROPLET_STORAGE;

            const player = Players.GetPlayerByUserId(Server.empireData.owner) ?? Players.GetPlayers()[0];
            if (player !== undefined) {
                droplet.SetNetworkOwner(player);
            }

            if (this.hasLuckyWindow) {
                this.hasLuckyWindow = false;
                task.delay(0.25, () => {
                    const luckyDropletInstantiator = Droplet.LuckyDroplet.getInstantiator(model, drop);
                    if (luckyDropletInstantiator !== undefined) {
                        const luckyDroplet = luckyDropletInstantiator();
                        luckyDroplet.Parent = DROPLET_STORAGE;
                        if (player !== undefined) {
                            luckyDroplet.SetNetworkOwner(player);
                        }
                    }
                });
            }

            if (callback !== undefined)
                callback(droplet, dropper);
            return droplet;
        };
    }

    /**
     * Loads the dropper item into the model.
     * This function finds all drop parts in the model, sets their attributes,
     * and initializes the instance info for each drop part.
     * 
     * @param model The model to load the dropper into.
     * @param dropper The dropper item to load.
     */
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
            const areaId = Server.Item.getPlacedItem(model.Name)?.area as AreaId | undefined;
            const info = getAllInstanceInfo(drop);
            info.Area = areaId;

            info.DropletLimitValue = areaId === undefined ? Area.globalDropletLimit : AREAS[areaId].dropletLimit;
            info.Boosts = new Map<string, ItemBoost>();
            info.DropRate = dropper.dropRate;

            if (instantiator !== undefined) {
                info.Instantiator = Dropper.wrapInstantiator(instantiator, dropper, model, drop);
            }

            Dropper.SPAWNED_DROPS.set(drop, info);
            model.Destroying.Once(() => Dropper.SPAWNED_DROPS.delete(drop));
        }
    }

    /**
     * A map of all spawned drops.
     * The key is the drop part, and the value is the instance info.
     */
    static readonly SPAWNED_DROPS = new Map<BasePart, InstanceInfo>();

    /**
     * Whether there is a lucky droplet window open.
     * This window changes every second, and if it is open, only one lucky droplet can spawn.
     */
    private static hasLuckyWindow = false;

    /**
     * Chance to spawn a lucky droplet every second.
     */
    static luckyChance = 200;

    /**
     * A map of droplet parts to their droplet instances.
     * This allows for different droplet types per drop part.
     */
    readonly dropletPerDrop = new Map<string, Droplet>();

    /**
     * Callback that is called when a droplet is produced.
     * The callback receives the droplet and the dropper item.
     */
    dropletProduced: ((droplet: BasePart, item: this) => void) | undefined;

    /**
     * The droplet that is produced by this dropper.
     * If a droplet is set for a specific drop part, it will be used instead.
     */
    droplet: Droplet | undefined;

    /**
     * The drop rate of this dropper.
     * This is the number of droplets produced per second.
     */
    dropRate = 0;

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Dropper.load(model, this));
    }

    /**
     * Gets the droplet for a specific drop part.
     * If no droplet is set for the drop part, it returns the default droplet.
     * 
     * @param dropPart The name of the drop part to get the droplet for.
     * @returns The droplet for the specified drop part, or the default droplet if not set.
     */
    getDroplet(dropPart?: string) {
        if (dropPart !== undefined) {
            const cached = this.dropletPerDrop.get(dropPart);
            if (cached !== undefined) {
                return cached;
            }
        }
        return this.droplet;
    }

    /**
     * Sets the droplet for a specific drop part or the default droplet.
     * 
     * @param droplet The droplet to set.
     * @param dropPart The name of the drop part to set the droplet for. If undefined, sets the default droplet.
     * @returns The Dropper instance for chaining.
     */
    setDroplet(droplet: Droplet, dropPart?: string) {
        if (dropPart !== undefined) {
            this.dropletPerDrop.set(dropPart, droplet);
            return this;
        }
        this.droplet = droplet;
        return this;
    }

    /**
     * Sets the drop rate of this dropper.
     * 
     * @param dropRate The drop rate to set, in droplets per second.
     * @returns The Dropper instance for chaining.
     */
    setDropRate(dropRate: number) {
        this.dropRate = dropRate;
        return this;
    }

    /**
     * Sets a callback that is called when a droplet is produced.
     * 
     * @param callback The callback to set. It receives the droplet and the dropper item.
     * @returns The Dropper instance for chaining.
     */
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
        task.spawn(() => {
            while (task.wait(1)) {
                this.hasLuckyWindow = this.luckyChance > 0 && math.random(1, this.luckyChance) === 1;
            }
        });

        RunService.Heartbeat.Connect(() => {
            const speed = GameSpeed.speed;
            const t = tick();
            for (const [_d, info] of this.SPAWNED_DROPS) {
                const boosts = info.Boosts;
                if (boosts === undefined)
                    continue;
                
                if (info.LastDrop === undefined) {
                    info.LastDrop = t;
                    continue;
                }

                let dropRate = info.DropRate;
                if (dropRate === undefined)
                    continue;

                // Apply weather multipliers
                if (Server.Atmosphere) {
                    const weatherMultipliers = Server.Atmosphere.getWeatherMultipliers();
                    dropRate *= weatherMultipliers.dropRate;
                }

                for (const [_, boost] of boosts)
                    dropRate *= boost.dropRateMultiplier ?? 1;

                if (dropRate === 0)
                    continue;

                if (t > info.LastDrop + 1 / dropRate / speed) {
                    const dropletCount = Server.Area.dropletCountPerArea.get(info.Area!);
                    if (dropletCount !== undefined && dropletCount > info.DropletLimitValue!.Value)
                        continue;
                    info.LastDrop = t;
                    info.Instantiator!();
                }
            }
        });
    }
}