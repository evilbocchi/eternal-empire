//!native
//!optimize 2

import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import { getAllInstanceInfo } from "@antivivi/vrldk";
import { RunService } from "@rbxts/services";
import Area, { AREAS } from "shared/Area";
import GameSpeed from "shared/GameSpeed";
import Packets from "shared/Packets";
import { RESET_LAYERS } from "shared/ResetLayer";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { ITEM_MODELS } from "shared/item/ItemModels";
import ItemUtils, { Server } from "shared/item/ItemUtils";

declare global {

    /**
     * Metadata for instances. This is used to store additional information about instances.
     * This provides more flexibility than using attributes as it allows for storing any type of data.
     * Additionally, this data is not replicated to the client, improving performance.
     * 
     * @see {@link getAllInstanceInfo} to retrieve the metadata for an instance.
     * @see {@link setInstanceInfo} to set the metadata for an instance.
     */
    interface InstanceInfo {
        /**
         * Whether the item is actively maintained.
         * If {@link Item.drain} is set, this value will be `false` if the price is not affordable.
         */
        Maintained?: boolean;
    }

    type Toggleable = ParticleEmitter | Beam | Script;

    type OmitConstructorSignature<T> = { [K in keyof T]: T[K] } & (T extends (...args: infer R) => infer S
    ? (...args: R) => S
    : unknown);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Constructor<T> = new (...args: any[]) => T;
}

const EMPTY_DIFFICULTY = new Difficulty();

/**
 * Represents an item in the game.
 * The item may or may not be placed in the world and interacted with.
 * 
 * @example
 * ```ts
 * const item = new Item("example")
 * .setName("Example Item")
 * .setDescription("This is an example item.");
 * print(item.name); // "Example Item"
 * ```
 */
export default class Item {

    /**
     * The {@link Model} of the item. This should be a descendant of the folder in {@link ReplicatedStorage} called `ItemModels`.
     * A hitbox should be present in the model to allow for placement in the world. The hitbox should be named `Hitbox`.
     * The {@link Model.PrimaryPart} is a required property for the model, which defines the primary hitbox.
     * 
     * @see {@link ITEM_MODELS} for the models that are available.
     */
    readonly MODEL?: Model;

    /**
     * Called when {@link NPCNavigationService} is initialized. 
     */
    readonly INITALIZES = new Array<<T extends this>(item: T) => void>();

    /**
     * Called when the item's model is loaded into the world.
     */
    readonly LOADS = new Array<<T extends this>(model: Model, item: T) => void>();

    /**
     * Called when the item's model is loaded into the world on the client.
     * Does not run on the server.
     */
    readonly CLIENT_LOADS = new Array<<T extends this>(model: Model, item: T, player: Player) => void>();

    /**
     * The types of the item.
     * 
     * @see {@link isA} to check if the item is of a specific type.
     */
    readonly types = new Map<keyof ItemTraits, ItemTraits[keyof ItemTraits]>();

    /**
     * The areas where the item can be placed.
     */
    readonly placeableAreas = new Array<Area>();

    /**
     * The price of the item per iteration.
     * The next iteration is the number of times the item has been purchased.
     */
    readonly pricePerIteration = new Map<number, CurrencyBundle>();

    /**
     * Describes the item.
     */
    description: string;

    /**
     * The description of the item that will be shown in the tooltip when hovering over the item in the inventory.
     * 
     * If not set, the {@link description} will be used as the tooltip description.
     */
    tooltipDescription?: string;

    /**
     * The difficulty of the item.
     */
    difficulty = EMPTY_DIFFICULTY;

    /**
     * The price that will be drained from balance every second.
     * If the price is not affordable, the item will be disabled.
     */
    drain?: CurrencyBundle;
    
    /**
     * The price set as the default for this item. This price will be used if no other price is set for a specific iteration.
     */
    defaultPrice?: CurrencyBundle;

    /**
     * The contributor who originally created the item.
     */
    creator?: string;

    /**
     * The items required to purchase this item.
     */
    requiredItems = new Map<Item, number>();

    /**
     * A formula that will be applied to the value of {@link formulaXGet} every second.
     * The result of the formula will be stored in {@link formulaResult}.
     */
    formula?: Formula;

    /**
     * The name of the variable that will be used in the formula.
     */
    formulaX?: string;

    /**
     * A function that will return the value of the variable that will be used in the {@link formula}.
     */
    formulaXGet?: (utils: Server) => OnoeNum;

    /**
     * The maximum value that {@link formulaXGet} can return.
     * This {@link CurrencyBundle} should only have one amount.
     * 
     * @see {@link formulaXCapValue} for the value of the amount.
     */
    formulaXCap?: CurrencyBundle;

    /**
     * The maximum value that {@link formulaXGet} can return.
     */
    formulaXCapValue?: OnoeNum;

    /**
     * A callback function that will be called every second with the result of the {@link formula}.
     */
    formulaCallback?: <T extends this>(value: OnoeNum, item: T, utils: Server) => unknown;

    /**
     * The result of the {@link formula} applied to the value of {@link formulaXGet}.
     */
    formulaResult?: OnoeNum;

    /**
     * Order in which the item will appear in the inventory.
     */
    layoutOrder = -100000;

    /**
     * The order of the {@link ResetLayer} in which this item will reset at.
     */
    defaultResetLayer?: number;
    
    /**
     * The order of the {@link ResetLayer} in which this item will persist. Takes precedence over {@link defaultResetLayer}.
     */
    persistingLayer?: number;

    /**
     * The level required to purchase and use the item.
     */
    levelReq?: number;

    /**
     * The name of the BasePart that will be used as the bounds for placing the item.
     */
    bounds?: string;

    /**
     * The image ID of the item.
     */
    image?: number;

    /**
     * Define a new item with the specified ID and name.
     * 
     * @param id The ID of the item.
     * @param name The name of the item. Defaults to the ID if not provided.
     * @returns The item instance.
     */
    constructor(public readonly id: string, public name = id) {
        this.MODEL = ITEM_MODELS.get(id);
        this.description = id;
    }

    /**
     * Set the name of the item.
     * 
     * @param name The name of the item.
     * @returns The item instance.
     */
    setName(name: string) {
        this.name = name;
        return this;
    }

    /**
     * Set the description of the item.
     * 
     * @param description The description of the item.
     * @returns The item instance.
     */
    setDescription(description: string) {
        this.description = description;
        return this;
    }

    /**
     * Set the tooltip description of the item.
     * This description will be shown in the tooltip when hovering over the item in the inventory.
     * 
     * @param description The tooltip description of the item.
     * @returns The item instance.
     */
    setTooltipDescription(description: string) {
        this.tooltipDescription = description;
        return this;
    }

    /**
     * Set the difficulty of the item. i.e. level of progression that the item is recommended to be obtained and used at.
     * 
     * @param difficulty The difficulty level of the item.
     * @returns The item instance.
     */
    setDifficulty(difficulty: Difficulty) {
        this.difficulty = difficulty;
        if (difficulty === Difficulty.Miscellaneous || difficulty === Difficulty.Excavation || difficulty === Difficulty.Bonuses)
            this.persists();
        if (this.layoutOrder === -100000) {
            this.layoutOrder = difficulty.rating ?? 0;
        }
        return this;
    }

    /**
     * Retrieve the price of the item for the specified iteration.
     * If the price is not set for the iteration, the default price will be returned.
     *
     * @param iteration The iteration number to get the price for. The first purchase is iteration 1.
     * @returns The price of the item for the specified iteration.
     */
    getPrice(iteration: number) {
        return this.pricePerIteration.get(iteration) ?? this.defaultPrice; 
    }

    /**
     * Set the price of the item for the specified iteration.
     * If the end iteration is specified, the price will be set for all iterations between the start and end.
     * 
     * @param price The price of the item.
     * @param iteration The iteration number to set the price for. The first purchase is iteration 1.
     * @param endIteration The end iteration number to set the price for. If not specified, the price will be set for the specified iteration only.
     * @returns The item instance.
     */
    setPrice(price: CurrencyBundle, iteration?: number, endIteration?: number) {
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

    /**
     * Set the items required to purchase this item.
     * 
     * @param required The items required to purchase this item.
     * @returns The item instance.
     */
    setRequiredItems(required: Map<Item, number>) {
        this.requiredItems = required;
        return this;
    }

    /**
     * Set the amount of the item required to purchase this item.
     * 
     * @param item The item required to purchase this item.
     * @param amount The amount of the item required.
     * @returns The item instance.
     */
    setRequiredItemAmount(item: Item, amount: number) {
        this.requiredItems.set(item, amount);
        return this;
    }

    /**
     * Set the amount of the harvestable required to purchase this item.
     * 
     * @param id The ID of the harvestable required to purchase this item.
     * @param amount The amount of the harvestable required.
     * @returns The item instance.
     */
    setRequiredHarvestableAmount(id: HarvestableId, amount: number) {
        if (ItemUtils.itemsPerId === undefined) {
            task.spawn(() => {
                while (ItemUtils.itemsPerId === undefined)
                    task.wait();
                this.requiredItems.set(ItemUtils.itemsPerId.get(id)!, amount);
            });
        }
        else {
            this.requiredItems.set(ItemUtils.itemsPerId.get(id)!, amount);
        }
        return this;
    }

    /**
     * Calculates and updates the reset layer for the item based on its placeable areas.
     */
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

    /**
     * Get the reset layer for the item.
     * 
     * @returns The current reset layer for the item.
     */
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

    /**
     * Add a placeable area for the item.
     * 
     * @param areas The areas where the item can be placed.
     * @returns The item instance.
     */
    addPlaceableArea(...areas: (AreaId)[]) {
        for (const area of areas)
            this.placeableAreas.push(AREAS[area]);
        this.updateResetLayer();
        return this;        
    }

    /**
     * Adds all areas to the placeable areas for the item.
     * 
     * @returns The item instance.
     */
    placeableEverywhere() {
        for (const [_id, area] of pairs(AREAS)) {
            this.placeableAreas.push(area);
        }
        this.updateResetLayer();
        return this;
    }

    /**
     * Set the price that will be drained from balance every second.
     * If the price is not affordable, the item will be disabled.
     * 
     * @param drain The price that will be drained from balance every second.
     * @returns The item instance.
     */
    setDrain(drain: CurrencyBundle) {
        this.drain = drain;
        return this;
    }

    /**
     * Set the contributor who originally created the item.
     * 
     * @param creator The contributor who originally created the item.
     * @returns The item instance.
     */
    setCreator(creator: string) {
        this.creator = creator;
        return this;
    }

    /**
     * Calls the callback function when the item is initialized.
     * 
     * @param initCallback Callback function that will be called when the item is initialized.
     * @returns The item instance.
     */
    onInit(initCallback: (item: this) => void) {
        this.INITALIZES.push(initCallback);
        return this;
    }

    /**
     * Calls the callback function when the item is loaded.
     * 
     * @param loadCallback Callback function that will be called when the item is loaded.
     * @returns The item instance.
     */
    onLoad(loadCallback: (model: Model, item: this) => void) {
        this.LOADS.push(loadCallback);
        return this;
    }

    /**
     * Calls the callback function when the item is loaded on the client.
     * 
     * @param loadCallback Callback function that will be called when the item is loaded on the client.
     * @returns The item instance.
     */
    onClientLoad(loadCallback: (model: Model, item: this, player: Player) => void) {
        this.CLIENT_LOADS.push(loadCallback);
        return this;
    }

    /**
     * Calls the callback function every specified delta time.
     * 
     * @param instance Stops the repeat when the instance is destroyed. If undefined, the repeat will continue indefinitely.
     * @param callback The function to be called every delta time.
     * @param delta Delta time to specify the interval. If not specified, the function will be called every frame.
     * @returns An object that can be used to manage the repeat.
     */
    repeat(instance: Instance | undefined, callback: (dt: number) => unknown, delta?: number) {
        const ref = {delta: delta};
        ItemUtils.REPEATS.set(callback, ref);
        if (instance !== undefined)
            instance.Destroying.Once(() => ItemUtils.REPEATS.delete(callback));
        return ref;
    }

    /**
     * Drains the price set in {@link drain} every second.
     * If the price is not affordable, the item will be disabled.\
     * 
     * @param model The model of the item to maintain.
     */
    maintain(model: Model | undefined) {
        this.repeat(model, () => {
            const drain = this.drain;
            let affordable = true;

            if (drain !== undefined)
                affordable = Server.Currency.purchase(drain);

            if (model === undefined)
                return;
            const instanceInfo = getAllInstanceInfo(model);
            instanceInfo.Maintained = affordable;
        }, 1);
    }

    /**
     * Set the formula for the item.
     * 
     * @param formula The formula to be applied to the value of {@link formulaXGet} every second.
     * @returns The item instance.
     */
    setFormula(formula: Formula) {
        this.formula = formula;
        return this;
    }

    /**
     * Set the variable name that will be used in the formula.
     * 
     * @param x The variable name that will be used in the formula.
     * @returns The item instance.
     */
    setFormulaX(x: string) {
        this.formulaX = x;
        return this;
    }

    /**
     * Set the maximum value that {@link formulaXGet} can return.
     * 
     * @param cap The maximum value that {@link formulaXGet} can return.
     * @returns The item instance.
     */
    setFormulaXCap(cap: CurrencyBundle) {
        this.formulaXCap = cap;
        this.formulaXCapValue = cap.getFirst()[1];
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

    /**
     * Applies the value fetched from {@link formulaXGet} to the formula and calls the callback function.
     * The value is capped by {@link formulaXCap}.
     * 
     * @returns The result of the formula. Also stored in {@link formulaResult}.
     */
    performFormula() {
        if (this.formula === undefined || this.formulaXGet === undefined || this.formulaCallback === undefined)
            return;

        let value = this.formulaXGet(Server);
        const cap = this.formulaXCapValue;
        if (cap !== undefined && value.moreThan(cap) === true) {
            value = cap;
        }

        const result = this.formula.apply(value);
        this.formulaResult = result;
        this.formulaCallback(result, this, Server);
        return result;
    }

    /**
     * Marks the item to persist at the specified {@link ResetLayer}.
     * If the layer is not specified, the item will persist at the highest layer.
     * 
     * The item will reset at the next layer after the persisting layer.
     *
     * @param layerName The name of the {@link ResetLayer} to persist at.
     * @returns The item instance.
     */
    persists(layerName?: ResetLayerId) {
        this.persistingLayer = layerName === undefined ? 999 : RESET_LAYERS[layerName].order;
        this.updateResetLayer();
        return this;
    }

    /**
     * Set the level required to purchase and use the item.
     * 
     * @param level The level required to purchase and use the item.
     * @returns The item instance.
     */
    setLevelReq(level: number) {
        this.levelReq = level;
        return this;
    }
    
    /**
     * Set the order in which the item will appear in the inventory.
     * 
     * @param layoutOrder The order in which the item will appear in the inventory.
     * @returns The item instance.
     */
    setLayoutOrder(layoutOrder: number) {
        this.layoutOrder = layoutOrder;
        return this;
    }

    /**
     * Set a custom area where this item can be placed.
     * 
     * @param boundId Name of BasePart which is the custom area
     * @returns The item instance.
     */
    setBounds(boundId: string) {
        this.bounds = boundId;
        return this;
    }

    /**
     * Set the image ID of the item.
     * 
     * @param image The image ID of the item.
     * @returns The item instance.
     */
    setImage(image: number) {
        this.image = image;
        return this;
    }

    /**
     * Check if the item has a specific trait.
     * Equivalent to checking if a builder exists for the item trait.
     * 
     * @param traitName The key name of the trait.
     * @returns Whether the item is of the specified trait.
     */
    isA<T extends keyof ItemTraits>(traitName: T) {
        return this.types.has(traitName);
    }

    /**
     * Find a trait for the item.
     * If the trait does not exist, it will return undefined.
     * 
     * @example
     * ```ts
     * const item = new Item("example");
     * const upgrader = item.findTrait("Upgrader");
     * print(upgrader?.sky) // whether the item leads to skyline 
     * ```
     * 
     * @param name The key name of the trait.
     * @returns The trait for the item.
     */
    findTrait<T extends keyof ItemTraits>(name: T): ItemTraits[T] | undefined {
        return this.types.get(name) as ItemTraits[T] | undefined;
    }

    /**
     * Add a trait to the item.
     * If the trait already exists, it will return the existing trait.
     * 
     * @example
     * ```ts
     * const item = new Item("example");
     * item.trait(Killbrick.Damager).setDamage(10).exit(); // Adds damage functionality to the item.
     * item.trait(Conveyor).setSpeed(5).exit(); // Adds conveyor functionality to the item.
     * ```
     * 
     * @param Trait The constructor of the trait to add to the item.
     * @returns The trait for the item.
     */
    trait<T extends ItemTraits[keyof ItemTraits]>(Trait: Constructor<T>): T {
        const name = tostring(Trait) as keyof ItemTraits; // roblox-ts gives class name by default for tostring
        let trait = this.findTrait(name) as T | undefined;
        if (trait === undefined) {
            trait = new Trait(this);
            this.types.set(name, trait);
        }
        return trait;
    }

    /**
     * Format the string with the item's traits.
     * 
     * @param str The string to format.
     * @returns The formatted string.
     */
    format(str: string) {
        for (const [_, trait] of this.types) {
            str = trait.format(str);
        }

        if (this.drain !== undefined)
            str = str.gsub("%%drain%%", this.drain.toString(true, undefined, "/s"))[0];

        if (this.formulaXCap !== undefined)
            str = str.gsub("%%cap%%", this.formulaXCap.toString(true))[0];

        return str;
    }

    static init() {
        const start = tick();

        ItemUtils.REPEATS.set(() => {
            const formulaResults = new Map<string, OnoeNum>();
            for (const [_id, item] of ItemUtils.itemsPerId) {                
                formulaResults.set(item.id, item.performFormula()!);
            }
            if (tick() - start > 4) { // simple delay to ensure clients are ready
                Packets.boostChanged.fireAll(formulaResults);
            }
        }, {
            delta: 1,
            lastCall: 0
        });
        RunService.Heartbeat.Connect((dt) => {
            if (Server.ready === false)
                return;

            const t = tick();
            const gameSpeed = GameSpeed.speed;
            for (const [callback, rep] of ItemUtils.REPEATS) {
                const last = rep.lastCall;
                if (last === undefined) {
                    rep.lastCall = t;
                    continue;
                }
                const diff = t - last;
                if (rep.delta === undefined || diff > (rep.delta / gameSpeed)) {
                    callback(diff);
                    rep.lastCall = t;
                }
            }
        });
    }

    static {
        if (RunService.IsServer()) {
            this.init();
        }
    }
}