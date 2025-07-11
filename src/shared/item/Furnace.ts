import { Debris } from "@rbxts/services";
import Signal from "@rbxutil/signal";
import Price from "shared/Price";
import Item from "shared/item/Item";
import { findBaseParts } from "shared/utils/vrldk/BasePartUtils";
import ItemUtils from "./ItemUtils";

class Furnace extends Item {

    static load(model: Model, utils: ItemUtils, item: Furnace) {
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
                    const [worth, raw] = model.GetAttribute("Maintained") === true ? utils.calculateDropletValue(droplet) : [new Price()];
                    let res = undefined;
                    const formula = item.getFormula();
                    if (worth !== undefined && formula !== undefined) {
                        res = formula(worth).mul((model.GetAttribute("V") as number) ?? 1);
                        utils.setBalance(utils.getBalance().add(res));
                    }                    
                    droplet.FindFirstChildOfClass("UnreliableRemoteEvent")?.FireAllClients(res?.costPerCurrency);
                    item.processed.Fire(model, utils, item, worth, raw);
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
    processed = new Signal<[Model, ItemUtils, this, Price?, Price?]>();
    variance: number | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Furnace");
        this.onLoad((model, utils) => Furnace.load(model, utils, this));
    }

    getFormula() {
        return this.formula;
    }

    setFormula(formula: ((value: Price) => Price) | undefined) {
        this.formula = formula;
        return this;
    }

    getVariance() {
        return this.variance;
    }

    setVariance(variance: number) {
        this.variance = variance;
        return this;
    }

    onProcessed(callback: (model: Model, utils: ItemUtils, item: this, worth?: Price, raw?: Price) => void) {
        this.processed.Connect((model, utils, item, worth, raw) => callback(model, utils, item, worth, raw));
        return this;
    }
}

export = Furnace;