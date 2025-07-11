import Signal from "@antivivi/lemon-signal";
import { Debris } from "@rbxts/services";
import Price from "shared/Price";
import { DROPLETS_FOLDER } from "shared/constants";
import Conveyor from "shared/item/Conveyor";
import Packets from "shared/network/Packets";
import ItemUtils, { GameUtils } from "shared/utils/ItemUtils";
import { findBaseParts } from "shared/utils/vrldk/BasePartUtils";

declare global {
    interface ItemTypes {
        Furnace: Furnace;
    }
    interface InstanceInfo {
        Incinerated?: boolean;
    }
}

class Furnace extends Conveyor {

    static load(model: Model, item: Furnace) {
        for (const d of findBaseParts(model, "Lava")) {
            d.SetAttribute("ItemId", item.id);
            d.Touched.Connect((droplet) => {
                const dropletInfo = GameUtils.getAllInstanceInfo(droplet);
                if (droplet.Parent === DROPLETS_FOLDER && dropletInfo.Incinerated !== true) {
                    dropletInfo.Incinerated = true;
                    task.delay(0.5, () => {
                        if (droplet !== undefined)
                            droplet.Anchored = true;
                    });
                    Debris.AddItem(droplet, 4);
                    let worth: Price;
                    let raw: Price | undefined;
                    if (GameUtils.getInstanceInfo(model, "Maintained") === false) {
                        worth = new Price();
                    }
                    else {
                        [worth] = GameUtils.calculateDropletValue(droplet, item.includesGlobalBoosts, item.includesUpgrades);
                    }
                    let res = worth;
                    if (res !== undefined) {
                        if (item.add !== undefined)
                            res = res.add(item.add);
                        if (item.mul !== undefined)
                            res = res.mul(item.mul);

                        if (res === worth)
                            res = Price.EMPTY_PRICE;
                        else {
                            const variance = model.GetAttribute("V") as number;
                            if (variance !== undefined) {
                                res = res.mul(variance);
                            }
                            GameUtils.currencyService.incrementCurrencies(res.costPerCurrency);
                        }
                    }
                    Packets.dropletBurnt.fireAll(droplet.Name, res.costPerCurrency, model.Name, d.Name, ItemUtils.clientDroplets);
                    item.processed?.fire(model, item, worth, droplet);
                }
            });
        }
        const variance = item.variance;
        if (variance !== undefined && item.variance !== 0) {
            item.repeat(model, () => model.SetAttribute("V", (math.random() * variance) + 1 - (variance * 0.5)), 0.7);
        }
        item.maintain(model);
    }

    processed: Signal<(model: Model, item: this, worth?: Price, droplet?: Instance) => void> | undefined;
    variance: number | undefined;
    includesGlobalBoosts: boolean | undefined;
    includesUpgrades: boolean | undefined;

    constructor(id: string) {
        super(id);
        this.types.add("Furnace");
        this.onLoad((model) => Furnace.load(model, this));
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

    onProcessed(callback: (model: Model, item: this, worth?: Price, droplet?: Instance) => void) {
        if (this.processed === undefined) {
            this.processed = new Signal();
        }
        this.processed.connect((model, item, worth, droplet) => callback(model, item, worth, droplet));
        return this;
    }
}

export = Furnace;