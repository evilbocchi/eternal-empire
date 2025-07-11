//!native

import { RunService } from "@rbxts/services";
import Area from "shared/Area";
import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS, RESET_LAYERS } from "shared/constants";
import ItemTypes from "shared/item/ItemTypes";
import { Signal } from "@antivivi/fletchette";
import Formula from "shared/utils/Formula";
import { OnoeNum } from "@antivivi/serikanum";

class Item {

    initialized = new Signal<(utils: GameUtils, item: this) => void>();
    loaded = new Signal<(model: Model, utils: GameUtils, item: this) => void>();
    types: (keyof ItemTypes)[] = [];
    id: string;
    name: string | undefined = undefined;
    description: string | undefined = undefined;
    difficulty: Difficulty | undefined = undefined;
    drain: Price | undefined = undefined;
    placeableAreas: Area[] = [];
    defaultPrice: Price | undefined;
    pricePerIteration = new Map<number, Price>();
    creator: string | undefined = undefined;
    requiredItems = new Map<Item, number>();
    formula: Formula | undefined;
    formulaResult: OnoeNum | undefined;
    formulaResultChanged = new Signal<(multiplier: OnoeNum) => void>();

    constructor(id: string) {
        this.id = id;
    }


    setName(name: string) {
        this.name = name;
        return this;
    }

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    setDifficulty(difficulty: Difficulty) {
        this.difficulty = difficulty;
        return this;
    }

    getPrice(iteration: number) {
        return this.pricePerIteration.get(iteration) ?? this.defaultPrice; 
    }

    setPrice(price: Price, iteration?: number, endIteration?: number) {
        if (iteration === undefined) {
            this.defaultPrice = price;
            return this;
        }
        this.pricePerIteration.set(iteration, price);
        if (endIteration !== undefined) {
            for (let i = iteration + 1; i <= endIteration; i++) {
                this.pricePerIteration.set(i, price);
            }
        }
        return this;
    }

    setRequiredItems(required: Map<Item, number>) {
        this.requiredItems = required;
        return this;
    }

    setRequiredItemAmount(item: Item, amount: number) {
        this.requiredItems.set(item, amount);
        return this;
    }

    addPlaceableArea(...areas: (keyof (typeof AREAS))[]) {
        for (const area of areas)
            this.placeableAreas.push(AREAS[area]);
        return this;        
    }

    markPlaceableEverywhere() {
        for (const [_id, area] of pairs(AREAS)) {
            this.placeableAreas.push(area);
        }
        return this;
    }

    setDrain(drain: Price) {
        this.drain = drain;
        return this;
    }

    setCreator(creator: string) {
        this.creator = creator;
        return this;
    }

    isA<T extends keyof ItemTypes>(itemType: T): this is ItemTypes[T] {
        return this.types.includes(itemType);
    }

    onInit(initCallback: (utils: GameUtils, item: this) => void) {
        this.initialized.connect((utils, item) => initCallback(utils, item));
        return this;
    }

    onLoad(loadCallback: (model: Model, utils: GameUtils, item: this) => void) {
        this.loaded.connect((model, utils, item) => loadCallback(model, utils, item));
        return this;
    }

    repeat(model: Model | undefined, callback: (dt: number) => unknown, delta?: number) {
        const d = delta ?? 0;
        let t = 0;
        const connection = RunService.Heartbeat.Connect((dt) => {
            t += dt;
            if (t > d) {
                callback(t);
                t = 0;
            }
        });
        if (model !== undefined)
            model.Destroying.Once(() => connection.Disconnect());
    }

    ambienceSound(func: (model: Model) => Sound) {
        this.onLoad((model) => func(model).Play());
        return this;
    }

    maintain(model: Model | undefined, utils: GameUtils, callback?: (isMaintained: boolean, balance: Price) => void) {
        this.repeat(model, () => {
            const drain = this.drain;
            let bal = utils.getBalance();
            let affordable = true;
            if (drain === undefined) {
                if (callback !== undefined)
                    callback(true, bal);
            }
            else {
                bal = bal.sub(drain);
                for (const [_currency, amount] of bal.costPerCurrency) {
                    if (amount.lessThan(0)) {
                        affordable = false;
                    }
                }
                if (affordable === true) {
                    utils.setBalance(bal);
                }
                if (callback !== undefined) {
                    callback(affordable, bal);
                }
            }
            if (model !== undefined && model.GetAttribute("Maintained") !== affordable) {
                model.SetAttribute("Maintained", affordable);
            }
        }, 1);
    }

    setFormula(formula: Formula) {
        this.formula = formula;
        return this;
    }

    /**
     * Calls the callback function every second by passing the return of the x function in the formula function, and passing the return of that to the callback.
     * 
     * @param callback Called every second with the `value` parameter passed as the return of `this.formula`.
     * @param x The value to be used in the formula.
     */
    applyFormula(callback: (value: OnoeNum) => unknown, x: () => OnoeNum) {
        this.repeat(undefined, () => {
            const v = x();
            if (v !== undefined && this.formula !== undefined) {
                const result = this.formula.apply(v);
                callback(result);
                if (this.formulaResult === undefined || !this.formulaResult.equals(result)) {
                    this.formulaResultChanged.fire(result);
                }
                this.formulaResult = result;
            }
        }, 1);
    }

    isPersistent() {
        const difficulty = this.difficulty;
        return difficulty === Difficulty.Bonuses || difficulty === Difficulty.Excavation || difficulty === Difficulty.Miscellaneous || this.isA("Shop");
    }

    getResetLayer() {
        if (this.isPersistent())
            return -1;
        const size = RESET_LAYERS.size();
        for (let i = 0; i < size; i++) {
            const resetLayer = RESET_LAYERS[i];
            if (this.placeableAreas.includes(resetLayer.area))
                return i;
        }
        return -1;
    }
}

export = Item;