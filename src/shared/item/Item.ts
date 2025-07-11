import { RunService } from "@rbxts/services";
import Area from "shared/Area";
import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import ItemTypes from "shared/item/ItemTypes";
import { Signal } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

class Item {

    initialised = new Signal<(utils: ItemUtils, item: this) => void>();
    loaded = new Signal<(model: Model, utils: ItemUtils, item: this) => void>();
    types: (keyof ItemTypes)[] = [];
    id: string;
    name: string | undefined = undefined;
    description: string | undefined = undefined;
    difficulty: Difficulty | undefined = undefined;
    maintenance: Price | undefined = undefined;
    placeableAreas: Area[] = [];
    pricePerIteration = new Map<number, Price>();
    creator: string | undefined = undefined;
    requiredItems = new Map<Item, number>();

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
        return this.pricePerIteration.get(iteration); 
    }

    setPrice(price: Price, iteration: number, endIteration?: number) {
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

    addPlaceableArea(area: Area) {
        this.placeableAreas.push(area);
        return this;        
    }

    setMaintenance(maintenance: Price) {
        this.maintenance = maintenance;
        return this;
    }

    setCreator(creator: string) {
        this.creator = creator;
        return this;
    }

    isA<T extends keyof ItemTypes>(itemType: T): this is ItemTypes[T] {
        return this.types.includes(itemType);
    }

    onInit(initCallback: (utils: ItemUtils, item: this) => void) {
        this.initialised.connect((utils, item) => initCallback(utils, item));
        return this;
    }

    onLoad(loadCallback: (model: Model, utils: ItemUtils, item: this) => void) {
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

    maintain(model: Model | undefined, utils: ItemUtils, callback?: (isMaintained: boolean, balance: Price) => void) {
        this.repeat(model, () => {
            const maintenance = this.maintenance;
            let bal = utils.getBalance();
            if (maintenance === undefined) {
                if (callback !== undefined) {
                    callback(true, bal);
                }
                model?.SetAttribute("Maintained", true);
                return;
            }
            bal = bal.sub(maintenance);
            let affordable = true;
            for (const [_currency, amount] of bal.costPerCurrency) {
                if (amount.lt(0)) {
                    affordable = false;
                }
            }
            if (affordable === true) {
                utils.setBalance(bal);
            }
            if (callback !== undefined) {
                callback(affordable, bal);
            }
            model?.SetAttribute("Maintained", affordable);
        }, 1);
    }


    /**
     * Calls the callback function every second by passing the return of the x function in the formula function, and passing the return of that to the callback.
     * 
     * @param callback Called every second with the return of the formula function as the value parameter.
     * @param x The value to be used in the formula.
     * @param formula The formula to be applied to x.
     */
    applyFormula(callback: (value: Price) => unknown, x: () => InfiniteMath, formula: (x: InfiniteMath) => Price) {
        this.repeat(undefined, () => {
            const v = x();
            if (v !== undefined) {
                callback(formula(v));
            }
        }, 1);
    }
}

export = Item;