//!native

import Price from "../Price";
import Dropper from "./Dropper";
import Furnace from "./Furnace";
import { Signal } from "@antivivi/fletchette";

class FurnaceDropper extends Dropper implements Furnace {

    add: Price | undefined;
    mul: Price | undefined;
    processed = new Signal<(model: Model, utils: GameUtils, item: this, worth?: Price, raw?: Price, droplet?: Instance) => void>();
    variance: number | undefined;
    isAcceptsUpgrades: boolean | undefined;

    constructor(id: string) {
        super(id);
        this.types.push("Furnace");
        this.onLoad((model, utils) => Furnace.load(model, utils, this));
    }

    setAdd(add: Price | undefined) {
        this.add = add;
        return this;
    }

    setMul(mul: Price | undefined) {
        this.mul = mul;
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

    onProcessed(callback: (model: Model, utils: GameUtils, item: this, worth?: Price, raw?: Price, droplet?: Instance) => void) {
        this.processed.connect((model, utils, item, worth, raw, droplet) => callback(model, utils, item, worth, raw, droplet));
        return this;
    }
}

export = FurnaceDropper;