import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import { RunService } from "@rbxts/services";
import Area from "shared/Area";
import GameSpeed from "shared/GameSpeed";
import Price from "shared/Price";
import { AREAS, RESET_LAYERS } from "shared/constants";
import Formula from "shared/utils/Formula";
import ItemUtils, { GameUtils } from "shared/utils/ItemUtils";

declare global {
    interface InstanceInfo {
        Maintained?: boolean;
    }

    type ClientGameUtils = Partial<GameUtils>;
}

class Item {

    readonly INITALIZES = new Array<<T extends this>(item: T) => void>();
    readonly LOADS = new Array<<T extends this>(model: Model, item: T) => void>();
    readonly CLIENT_LOADS = new Array<<T extends this>(model: Model, item: T, player: Player) => void>();
    readonly types = new Set<keyof ItemTypes>();
    readonly id: string;
    readonly placeableAreas = new Array<Area>();
    readonly pricePerIteration = new Map<number, Price>();
    name?: string;
    description?: string;
    difficulty?: Difficulty;
    drain?: Price;
    defaultPrice?: Price;
    creator?: string;
    requiredItems = new Map<Item, number>();
    formula?: Formula;
    formulaX?: string;
    formulaXGet?: (utils: GameUtils) => OnoeNum;
    formulaXCap?: Price;
    formulaCallback?: <T extends this>(value: OnoeNum, item: T, utils: GameUtils) => unknown;
    formulaResult?: OnoeNum;
    /** Order in which the item will appear in the inventory */
    layoutOrder?: number;
    /** The reset layer's order in which this item will reset at */
    defaultResetLayer?: number;
    /** The reset layer's order in which this item will persist. Takes precedence over {@link Item.resetLayer} */
    persistingLayer?: number;
    levelReq?: number;
    bounds?: string;

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
        if (difficulty === Difficulty.Miscellaneous || difficulty === Difficulty.Excavation || difficulty === Difficulty.Bonuses)
            this.persists();
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

    setRequiredHarvestableAmount(harvestable: HarvestableId, amount: number) {
        if (ItemUtils.itemsPerId === undefined) {
            task.spawn(() => {
                while (ItemUtils.itemsPerId === undefined)
                    task.wait();
                this.requiredItems.set(ItemUtils.itemsPerId.get(harvestable)!, amount);
            });
        }
        else {
            this.requiredItems.set(ItemUtils.itemsPerId.get(harvestable)!, amount);
        }
        return this;
    }

    updateResetLayer() {
        let resetLayer = this.defaultResetLayer;
        for (const area of this.placeableAreas) {
            let layer: ResetLayer | undefined;
            for (const [_name, l] of pairs(RESET_LAYERS))
                if (l.area === area) {
                    layer = l;
                    break;
                }
            if (layer === undefined) {
                resetLayer = 999;
                break;
            }

            if (resetLayer === undefined || layer.order > resetLayer)
                resetLayer = layer.order;
        }
        this.defaultResetLayer = resetLayer;
    }

    getResetLayer() {
        if (this.defaultResetLayer !== undefined) {
            if (this.persistingLayer !== undefined) {
                return math.max(this.persistingLayer + 1, this.defaultResetLayer);
            }
            else {
                return this.defaultResetLayer;
            }
        }
        return 999;
    }

    addPlaceableArea(...areas: (AreaId)[]) {
        for (const area of areas)
            this.placeableAreas.push(AREAS[area]);
        this.updateResetLayer();
        return this;        
    }

    markPlaceableEverywhere() {
        for (const [_id, area] of pairs(AREAS)) {
            this.placeableAreas.push(area);
        }
        this.updateResetLayer();
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
        return this.types.has(itemType);
    }

    onInit(initCallback: (item: this) => void) {
        this.INITALIZES.push(initCallback);
        return this;
    }

    onLoad(loadCallback: (model: Model, item: this) => void) {
        this.LOADS.push(loadCallback);
        return this;
    }

    onClientLoad(loadCallback: (model: Model, item: this, player: Player) => void) {
        this.CLIENT_LOADS.push(loadCallback);
        return this;
    }

    repeat(model: Model | undefined, callback: (dt: number) => unknown, delta?: number) {
        ItemUtils.REPEATS.set(callback, {delta: delta});
        if (model !== undefined)
            model.Destroying.Once(() => ItemUtils.REPEATS.delete(callback));
    }

    ambienceSound(func: (model: Model) => Sound) {
        this.onClientLoad((model) => func(model).Play());
        return this;
    }

    maintain(model: Model | undefined) {
        this.repeat(model, () => {
            const drain = this.drain;
            let affordable = true;

            if (drain !== undefined)
                affordable = GameUtils.currencyService.purchase(drain);

            if (model === undefined)
                return;
            const instanceInfo = GameUtils.getAllInstanceInfo(model);
            instanceInfo.Maintained = affordable;
        }, 1);
    }

    setFormula(formula: Formula) {
        this.formula = formula;
        return this;
    }

    setFormulaX(x: string) {
        this.formulaX = x;
        return this;
    }

    setFormulaXCap(cap: Price) {
        this.formulaXCap = cap;
        return this;
    }

    /**
     * Calls the callback function every second by passing the return of the x function in the formula function, and passing the return of that to the callback.
     * 
     * @param callback Called every second with the `value` parameter passed as the return of `this.formula`.
     * @param x The value to be used in the formula.
     */
    applyFormula(callback: (value: OnoeNum, item: this) => unknown, x: () => OnoeNum) {
        this.formulaCallback = callback;
        this.formulaXGet = x;
        return this;
    }

    persists(layerName?: ResetLayerId) {
        this.persistingLayer = layerName === undefined ? 999 : RESET_LAYERS[layerName].order;
        this.updateResetLayer();
        return this;
    }

    setLevelReq(level: number) {
        this.levelReq = level;
        return this;
    }

    /**
     * Set a custom area where this item can be placed.
     * 
     * @param boundId Name of BasePart which is the custom area
     */
    setBounds(boundId: string) {
        this.bounds = boundId;
        return this;
    }

    static {
        ItemUtils.REPEATS.set(() => {
            const formulaResults = new Map<string, OnoeNum>();

            for (const [_id, item] of ItemUtils.itemsPerId) {
                if (item.formula === undefined || item.formulaXGet === undefined ||  item.formulaCallback === undefined)
                    continue;

                let v = item.formulaXGet(GameUtils);
                if (v === undefined)
                    continue;

                if (item.formulaXCap !== undefined) {
                    const [_c, val] = item.formulaXCap.getFirst();
                    if (val !== undefined && v.moreThan(val) === true)
                        v = val;
                }
                const result = item.formula.apply(v);
                item.formulaResult = result;
                item.formulaCallback(result, item, GameUtils);
                formulaResults.set(item.id, result);
            }
            ItemUtils.formulaResultsChanged.fire(formulaResults);
        }, {
            delta: 1,
            lastCall: 0
        });
        const connection = RunService.Heartbeat.Connect((dt) => {
            if (GameUtils.ready === false)
                return;

            const t = tick();
            const gameSpeed = GameSpeed.speed;
            dt *= gameSpeed;
            for (const [callback, rep] of ItemUtils.REPEATS) {
                if (rep.lastCall === undefined) {
                    rep.lastCall = t;
                    continue;
                }
                if (rep.delta === undefined || t > rep.lastCall + (rep.delta / gameSpeed)) {
                    callback(dt);
                    rep.lastCall = t;
                }
            }
        });
    }
}

export = Item;