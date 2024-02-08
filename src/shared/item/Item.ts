import { RunService } from "@rbxts/services";
import Area from "shared/Area";
import Price from "shared/Price";
import Difficulty from "shared/difficulty/Difficulty";
import ItemTypes from "shared/item/ItemTypes";
import ItemUtils from "shared/item/ItemUtils";
import Signal from "@rbxutil/signal";

class Item {

    initialised = new Signal<[ItemUtils, this]>();
    loaded = new Signal<[Model, ItemUtils, this]>();
    types: (keyof ItemTypes)[] = [];
    id: string;
    name: string | undefined = undefined;
    description: string | undefined = undefined;
    difficulty: Difficulty | undefined = undefined;
    maintenance: Price | undefined = undefined;
    placeableAreas: Area[] = [];
    pricePerIteration = new Map<number, Price>();

    constructor(id: string) {
        this.id = id;
    }

    getName() {
        return this.name; 
    }

    setName(name: string) {
        this.name = name;
        return this;
    }

    getDescription() {
        return this.description; 
    }

    setDescription(description: string) {
        this.description = description;
        return this;
    }

    getDifficulty() {
        return this.difficulty; 
    }

    setDifficulty(difficulty: Difficulty) {
        this.difficulty = difficulty;
        return this;
    }

    getTypes() {
        return this.types;
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

    getPlaceableAreas() {
        return this.placeableAreas;
    }

    addPlaceableArea(area: Area) {
        this.placeableAreas.push(area);
        return this;        
    }

    getMaintenance() {
        return this.maintenance;
    }

    setMaintenance(maintenance: Price) {
        this.maintenance = maintenance;
        return this;
    }

    isA<T extends keyof ItemTypes>(itemType: T): this is ItemTypes[T] {
        return this.types.includes(itemType);
    }

    onInit(initCallback: (utils: ItemUtils, item: this) => void) {
        this.initialised.Connect((utils, item) => initCallback(utils, item));
        return this;
    }

    onLoad(loadCallback: (model: Model, utils: ItemUtils, item: this) => void) {
        this.loaded.Connect((model, utils, item) => loadCallback(model, utils, item));
        return this;
    }

    repeat(model: Model | undefined, callback: () => unknown, delta?: number) {
        const d = delta ?? 0;
        let t = 0;
        const connection = RunService.Heartbeat.Connect((dt) => {
            t += dt;
            if (t > d) {
                t = 0;
                callback();
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
            const maintenance = this.getMaintenance();
            if (maintenance === undefined) {
                model?.SetAttribute("Maintained", true);
                return;
            }
            const bal = utils.getBalance().sub(maintenance);
            let affordable = true;
            for (const [_currency, amount] of bal.costPerCurrency) {
                if (amount.lt(0)) {
                    affordable = false;
                }
            }
            if (affordable) {
                utils.setBalance(bal);
            }
            if (callback !== undefined) {
                callback(affordable, bal);
            }
            model?.SetAttribute("Maintained", affordable);
        }, 1);
    }
}

export = Item;