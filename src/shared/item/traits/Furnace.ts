import { OnoeNum } from "@antivivi/serikanum";
import { findBaseParts, getAllInstanceInfo } from "@antivivi/vrldk";
import { Debris } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Operative from "shared/item/traits/Operative";
import { VirtualCollision } from "shared/item/utils/VirtualReplication";
import Packets from "shared/Packets";

declare global {
    interface ItemTraits {
        Furnace: Furnace;
    }
    interface InstanceInfo {
        Incinerated?: boolean;
    }
}

const ZERO = new OnoeNum(0);

export default class Furnace extends Operative {
    static load(model: Model, furnace: Furnace) {
        const RevenueService = Server.Revenue;
        const CurrencyService = Server.Currency;
        const instanceInfo = getAllInstanceInfo(model);
        const item = furnace.item;

        for (const lava of findBaseParts(model, "Lava")) {
            lava.SetAttribute("ItemId", item.id);
            const lavaInfo = getAllInstanceInfo(lava);
            lavaInfo.DropletTouched = (droplet: BasePart) => {
                droplet.Anchored = true;

                const dropletInfo = getAllInstanceInfo(droplet);
                if (dropletInfo.Incinerated === true) return;

                if (instanceInfo.Area !== dropletInfo.Area && dropletInfo.LastTeleport === undefined) {
                    // Sanity check: droplet should be in the same area as the furnace unless it was teleported
                    return;
                }

                dropletInfo.Incinerated = true;
                Debris.AddItem(droplet, 6);

                if (instanceInfo.Maintained === false) return;

                const [worth] = RevenueService.calculateDropletValue(
                    droplet,
                    furnace.includesGlobalBoosts,
                    furnace.includesUpgrades,
                );
                let result = furnace.apply(worth);

                if (result === worth)
                    // furnace has no effect on droplet i.e. is a condenser
                    result = new CurrencyBundle();
                else {
                    const varianceResult = furnace.varianceResult;
                    if (varianceResult !== undefined) {
                        result = result.mul(varianceResult);
                    }
                    CurrencyService.incrementAll(result.amountPerCurrency);
                }
                for (const [currency, amount] of result.amountPerCurrency) {
                    if (amount.equals(ZERO)) result.amountPerCurrency.delete(currency);
                }
                Packets.dropletBurnt.toAllClients(droplet.Name, result.amountPerCurrency);
                instanceInfo.OnProcessed?.(result, worth, droplet);
            };
            VirtualCollision.handleDropletTouched(model, lava, lavaInfo.DropletTouched);
        }
        item.maintain(model);
    }

    static onClientLoad(model: Model) {
        for (const lava of findBaseParts(model, "Lava")) {
            VirtualCollision.listenForDropletTouches(model, lava);
        }
    }

    variance?: number;
    varianceResult?: number;
    includesGlobalBoosts = true;

    /**
     * Whether the furnace will process upgrades in droplets.
     * This should be false for cauldrons, where droplets are expected to be directly dropped into.
     *
     * The only exception is when droplets are marked as sky droplets, in which case they will be processed.
     *
     * @see {@link InstanceInfo.Sky} for more information on sky droplets.
     */
    includesUpgrades = true;

    constructor(item: Item) {
        super(item);
        item.onInit(() => {
            if (this.variance === undefined) return;

            item.repeat(
                undefined,
                () => {
                    const variance = this.variance;
                    if (variance === undefined) return;
                    this.varianceResult = math.random() * variance + 1 - variance * 0.5;
                },
                0.7,
            );
        });
        item.onLoad((model) => Furnace.load(model, this));
        item.onClientLoad((model) => Furnace.onClientLoad(model));
    }

    setVariance(variance: number) {
        this.variance = variance;
        return this;
    }

    acceptsGlobalBoosts(includesGlobalBoosts: boolean) {
        this.includesGlobalBoosts = includesGlobalBoosts;
        return this;
    }

    acceptsUpgrades(includesUpgrades: boolean) {
        this.includesUpgrades = includesUpgrades;
        return this;
    }
}
