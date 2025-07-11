import Signal from "@rbxutil/signal";
import Price from "../Price";
import Dropper from "./Dropper";
import Furnace from "./Furnace";
import ItemUtils from "./ItemUtils";

class FurnaceDropper extends Dropper implements Furnace {

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

    setFormula(formula: (value: Price) => Price) {
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

export = FurnaceDropper;