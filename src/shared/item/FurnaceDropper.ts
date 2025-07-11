import Price from "../Price";
import Dropper from "./Dropper";
import Furnace from "./Furnace";
import { Signal } from "shared/utils/fletchette";

class FurnaceDropper extends Dropper implements Furnace {

    formula: ((value: Price) => Price) | undefined;
    processed = new Signal<(model: Model, utils: ItemUtils, item: this, worth?: Price, raw?: Price, droplet?: Instance) => void>();
    variance: number | undefined;
    isAcceptsUpgrades: boolean | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Furnace");
        this.onLoad((model, utils) => Furnace.load(model, utils, this));
    }

    setFormula(formula: (value: Price) => Price) {
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

    onProcessed(callback: (model: Model, utils: ItemUtils, item: this, worth?: Price, raw?: Price, droplet?: Instance) => void) {
        this.processed.connect((model, utils, item, worth, raw, droplet) => callback(model, utils, item, worth, raw, droplet));
        return this;
    }
}

export = FurnaceDropper;