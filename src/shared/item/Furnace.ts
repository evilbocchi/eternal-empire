import { Debris } from "@rbxts/services";
import Price from "shared/Price";
import Item from "shared/item/Item";
import { Signal } from "shared/utils/fletchette";
import { findBaseParts } from "shared/utils/vrldk/BasePartUtils";

class Furnace extends Item {

    static load(model: Model, utils: ItemUtils, item: Furnace) {
        const isAcceptsUpgrades = item.isAcceptsUpgrades;
        for (const d of findBaseParts(model, "Lava")) {
            d.SetAttribute("ItemId", item.id);
            d.Touched.Connect((droplet) => {
                if (droplet.Name === "Droplet") {
                    droplet.Name = "IncineratedDroplet";
                    task.delay(0.5, () => {
                        if (droplet !== undefined)
                            droplet.Anchored = true;
                    });
                    Debris.AddItem(droplet, 4);
                    if (droplet.FindFirstChildOfClass("ObjectValue") !== undefined && isAcceptsUpgrades === false) {
                        droplet.Destroy();
                        return;
                    }
                    const [worth, raw] = model.GetAttribute("Maintained") === true ? utils.calculateDropletValue(droplet) : [new Price()];
                    let res = undefined;
                    const formula = item.formula;
                    if (worth !== undefined && formula !== undefined) {
                        res = formula(worth);
                        const variance = model.GetAttribute("V") as number;
                        if (variance !== undefined) {
                            res = res.mul(variance);
                        }
                        utils.setBalance(utils.getBalance().add(res));
                    }                    
                    droplet.FindFirstChildOfClass("UnreliableRemoteEvent")?.FireAllClients(res?.costPerCurrency);
                    item.processed.fire(model, utils, item, worth, raw, droplet);
                }
            });
        }
        const variance = item.variance;
        if (variance !== undefined && item.variance !== 0) {
            item.repeat(model, () => model.SetAttribute("V", (math.random() * variance) + 1 - (variance * 0.5)), 0.7);
        }
        item.maintain(model, utils);
    }
    
    formula: ((value: Price) => Price) | undefined;
    processed = new Signal<(model: Model, utils: ItemUtils, item: this, worth?: Price, raw?: Price, droplet?: Instance) => void>();
    variance: number | undefined;
    isAcceptsUpgrades: boolean | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Furnace");
        this.onLoad((model, utils) => Furnace.load(model, utils, this));
    }

    setFormula(formula: ((value: Price) => Price) | undefined) {
        this.formula = formula;
        return this;
    }

    setVariance(variance: number) {
        this.variance = variance;
        return this;
    }

    acceptsUpgrades(isAcceptsUpgrades: boolean) {
        this.isAcceptsUpgrades = isAcceptsUpgrades;
        return this;
    }

    onProcessed(callback: (model: Model, utils: ItemUtils, item: this, worth?: Price, raw?: Price) => void) {
        this.processed.connect((model, utils, item, worth, raw) => callback(model, utils, item, worth, raw));
        return this;
    }
}

export = Furnace;