//!native
//!optimize 2

import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import { getAllInstanceInfo, setInstanceInfo } from "@antivivi/vrldk";
import { RunService } from "@rbxts/services";
import { IS_EDIT, IS_SERVER } from "shared/Context";
import GameSpeed from "shared/GameSpeed";
import Packets from "shared/Packets";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { RESET_LAYERS } from "shared/currency/mechanics/ResetLayer";
import eat from "shared/hamster/eat";
import { ITEM_MODELS, preprocessModel } from "shared/item/ItemModels";
import Area, { AREAS } from "shared/world/Area";

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

        /**
         * Whether the item is currently broken. Broken items should not perform their usual behaviour.
         */
        Broken?: boolean;

        /**
         * The placed item data associated with the item model.
         */
        PlacedItem?: PlacedItem;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Constructor<T> = new (...args: any[]) => T;
}

/** The default difficulty for items. */
const EMPTY_DIFFICULTY = new Difficulty();

/** A map of repeat callbacks for items. */
const REPEATS = new Map<(dt: number) => void, { delta?: number; lastCall?: number }>();

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
     * Called when the {@link Server} API is first initialized. This is only called once per item.
     */
    readonly INITIALIZES = new Array<<T extends this>(item: T) => void>();

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
     * The unique identifier for the item.
     */
    readonly id: string;

    /**
     * Describes the item.
     */
    description: string;

    /**
     * The description of the item that will be shown in the tooltip when hovering over the item in the inventory,
     * and does **not** support currency coloring or trait formatting, unlike {@link description}.
     * If not set, the description will be used as the tooltip description.
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
    requiredItems = new Map<string, number>();

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
    formulaXGet?: () => OnoeNum;

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
    formulaCallback?: <T extends this>(value: OnoeNum, item: T) => unknown;

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
    image?: string;

    private static readonly itemPerId = new Map<string, Item>();

    /**
     * Define a new item with the specified ID and name.
     *
     * @param id The ID of the item.
     * @param name The name of the item. Defaults to the ID if not provided.
     * @returns The item instance.
     */
    constructor(
        id: string,
        public name = id,
    ) {
        this.id = id;
        this.MODEL = ITEM_MODELS.get(id);
        this.description = id;
        Item.itemPerId.set(id, this);
    }

    /**
     * Materialises the Roblox model that represents a placed instance of this item.
     * The model is cloned from `ITEM_MODELS` and then pivoted/annotated so services and
     * controllers can immediately treat it as gameplay-ready.
     *
     * @param placedItem The data snapshot produced during placement (position, rotation, area, id, etc.).
     * @returns The created model, or `undefined` if no base model exists for the item.
     *
     * @example
     * ```ts
     * const conveyor = new Item("conveyor");
     * const model = conveyor.createModel({
     *     item: conveyor.id,
     *     area: "starter",
     *     posX: 0,
     *     posY: 5,
     *     posZ: 0,
     *     rotX: 0,
     *     rotY: 90,
     *     rotZ: 0,
     * });
     * model?.Parent = workspace.Items;
     * ```
     */
    createModel(placedItem: PlacedItem) {
        const baseModel = this.MODEL;
        if (baseModel === undefined) {
            warn("Cannot find model for item " + placedItem.item);
            return;
        }
        const model = baseModel.Clone();

        if (IS_EDIT) {
            // We didn't preprocess models in edit mode before, so we need to do it now.
            preprocessModel(model);
        }

        // Position and rotate the model based on placed item data
        model.PivotTo(
            new CFrame(placedItem.posX, placedItem.posY, placedItem.posZ).mul(
                CFrame.Angles(math.rad(placedItem.rotX), math.rad(placedItem.rotY), math.rad(placedItem.rotZ)),
            ),
        );

        // Set model attributes for identification and functionality
        const modelInfo = getAllInstanceInfo(model);
        model.SetAttribute("Area", placedItem.area);
        model.SetAttribute("ItemId", this.id);

        modelInfo.PlacedItem = placedItem;
        modelInfo.ItemId = this.id;
        return model;
    }

    /**
     * Overrides the display name shown in UI, logs, and tooltips.
     * Useful when the internal id is terse but the user-facing label needs localisation or flair.
     *
     * @param name The name that should be presented to players.
     * @returns The item instance so builder calls can be chained.
     *
     * @example
     * ```ts
     * new Item("laser_miner")
     *     .setName("Laser Miner 3000")
     *     .setDescription("Vaporises ore into pure value");
     * ```
     */
    setName(name: string) {
        this.name = name;
        return this;
    }

    /**
     * Provides the rich-text description used in shop cards and detail panels.
     * Trait placeholders (e.g. `%%drain%%`) will be substituted when the UI renders.
     *
     * @param description Markdown-like string describing the item's purpose or flavour.
     * @returns The item instance for chaining.
     *
     * @example
     * ```ts
     * conveyor.setDescription("Doubles the speed of items that pass through it.");
     * ```
     */
    setDescription(description: string) {
        this.description = description;
        return this;
    }

    /**
     * Supplies the plain-text tooltip copy used when hovering the inventory button.
     * Unlike `setDescription`, this string is rendered literally and should avoid dynamic tokens.
     *
     * @param description Tooltip-safe text (no currency colour codes or trait placeholders).
     * @returns The item instance, enabling fluent chains.
     *
     * @example
     * ```ts
     * item
     *     .setDescription("Costs %%drain%% to keep running.")
     *     .setTooltipDescription("Consumes energy each second when enabled.");
     * ```
     */
    setTooltipDescription(description: string) {
        this.tooltipDescription = description;
        return this;
    }

    /**
     * Tags the item with its intended progression tier. Difficulty influences default
     * inventory ordering and which reset layer it persists through.
     *
     * @param difficulty A `Difficulty` enum value describing the recommended stage.
     * @returns The item instance.
     *
     * @example
     * ```ts
     * item.setDifficulty(Difficulty.Miscellaneous); // pushes to persistence queues automatically
     * ```
     */
    setDifficulty(difficulty: Difficulty) {
        this.difficulty = difficulty;
        if (
            difficulty === Difficulty.Miscellaneous ||
            difficulty === Difficulty.Excavation ||
            difficulty === Difficulty.Bonuses
        )
            this.persists();
        if (this.layoutOrder === -100000) {
            this.layoutOrder = difficulty.rating ?? 0;
        }
        if (this.levelReq === undefined) {
            this.calculateLevelReq();
        }
        return this;
    }

    private calculateLevelReq() {
        const rating = this.difficulty.rating;
        if (rating === undefined) return this;

        if (rating < Difficulty.Exist.rating!) {
            return this.setLevelReq(0);
        } else if (rating < Difficulty.InstantWin.rating!) {
            return this.setLevelReq(2);
        } else if (rating < Difficulty.Ifinitude.rating!) {
            return this.setLevelReq(4);
        } else if (rating < Difficulty.Joyful.rating!) {
            return this.setLevelReq(6);
        } else if (rating < Difficulty.Easy.rating!) {
            return this.setLevelReq(8);
        } else {
            return this.setLevelReq(10); // future difficulties
        }

        return this;
    }

    /**
     * Resolves the cost for a given purchase iteration.
     * Prices can be staged so the first few upgrades are cheaper before falling back to the default.
     *
     * @param iteration 1-indexed purchase count (1 = first buy).
     * @returns Matching `CurrencyBundle`, or the default iteration price if no override exists.
     *
     * @example
     * ```ts
     * const price = item.getPrice(profile.getPurchaseCount(item.id) + 1);
     * if (price !== undefined && wallet.canAfford(price)) purchase(item);
     * ```
     */
    getPrice(iteration: number) {
        return this.pricePerIteration.get(iteration) ?? this.defaultPrice;
    }

    /**
     * Configures the price curve for future purchases.
     * Prices can be set for a single iteration, a range, or globally when `iteration` is omitted.
     *
     * @param price Currency bundle charged when the iteration is reached.
     * @param iteration Optional 1-indexed iteration to override. Leave `undefined` to set the default.
     * @param endIteration Inclusive end of the iteration range to copy the price into.
     * @returns The item instance for chaining.
     *
     * @example
     * ```ts
     * item
     *     .setPrice(CurrencyBundle.fromCash(100))
     *     .setPrice(CurrencyBundle.fromCash(50), 1, 3); // first three purchases discounted
     * ```
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
     * Replaces the prerequisite map used during purchasing.
     * Each entry maps an item/harvestable id to the amount already owned in order to unlock this item.
     *
     * @param required Map of dependency ids to minimum counts.
     * @returns The item instance.
     */
    setRequiredItems(required: Map<string, number>) {
        this.requiredItems = required;
        return this;
    }

    /**
     * Adds or updates a prerequisite on another built item.
     *
     * @param item The dependency item whose ownership count is checked.
     * @param amount Quantity required before this item becomes buyable.
     * @returns The item instance.
     *
     * @example
     * ```ts
     * upgrader.setRequiredItemAmount(conveyor, 2); // need two conveyors first
     * ```
     */
    setRequiredItemAmount(item: Item, amount: number) {
        this.requiredItems.set(item.id, amount);
        return this;
    }

    /**
     * Declares a requirement on a harvestable resource rather than another item.
     *
     * @param id Harvestable identifier as defined in the shared harvestable catalogue.
     * @param amount Amount the player must collect before purchase is permitted.
     * @returns The item instance.
     *
     * @example
     * ```ts
     * altar.setRequiredHarvestableAmount("dark_matter", 10);
     * ```
     */
    setRequiredHarvestableAmount(id: HarvestableId, amount: number) {
        this.requiredItems.set(id, amount);
        return this;
    }

    /**
     * Recalculates which reset layer the item belongs to given its allowed placement areas.
     * Items outside known reset layers default to the highest tier so they persist across wipes.
     *
     * @example
     * ```ts
     * item.addPlaceableArea("starter");
     * // reset layer is recomputed automatically via updateResetLayer
     * ```
     */
    updateResetLayer() {
        let resetLayer = this.defaultResetLayer;
        for (const area of this.placeableAreas) {
            let layer: ResetLayer | undefined;
            for (const [_name, l] of pairs(RESET_LAYERS))
                if (l.area === area.id) {
                    layer = l;
                    break;
                }
            if (layer === undefined) {
                resetLayer = 999;
                break;
            }

            if (resetLayer === undefined || layer.order > resetLayer) resetLayer = layer.order;
        }
        this.defaultResetLayer = resetLayer;
    }

    /**
     * Returns the reset layer index that determines when the item is wiped during prestige cycles.
     * Takes into account persistent layers configured via `persists`.
     *
     * @returns Numeric layer ordering; higher numbers survive longer. Defaults to 999 for always-on items.
     */
    getResetLayer() {
        if (this.defaultResetLayer !== undefined) {
            if (this.persistingLayer !== undefined) {
                return math.max(this.persistingLayer + 1, this.defaultResetLayer);
            } else {
                return this.defaultResetLayer;
            }
        }
        return 999;
    }

    /**
     * Whitelists one or more placement areas in the world definition.
     * Reset layer metadata is recalculated automatically afterwards.
     *
     * @param areas One or more `AreaId`s defined in `AREAS`.
     * @returns The item instance.
     *
     * @example
     * ```ts
     * item.addPlaceableArea("starter", "factory_lower");
     * ```
     */
    addPlaceableArea(...areas: AreaId[]) {
        for (const area of areas) this.placeableAreas.push(AREAS[area]);
        this.updateResetLayer();
        return this;
    }

    /**
     * Marks the item as placeable in every registered area.
     * Primarily used for admin tools or global utility buildings.
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
     * Applies an upkeep cost that must be paid each second for the item to remain active.
     * Item maintenance routines will toggle `InstanceInfo.Maintained` based on affordability.
     *
     * @param drain Recurring cost bundle (e.g. power, currency) debited via `maintain`.
     * @returns The item instance.
     */
    setDrain(drain: CurrencyBundle) {
        this.drain = drain;
        return this;
    }

    /**
     * Credits the designer responsible for the item. Displayed in contributor UIs and analytics.
     *
     * @param creator Human-readable contributor handle.
     * @returns The item instance.
     */
    setCreator(creator: string) {
        this.creator = creator;
        return this;
    }

    /**
     * Schedules work to run once when the server boots the item catalogue.
     * Ideal for binding RPC handlers or registering with other systems.
     *
     * @param initCallback Invoked during item bootstrap with the item instance.
     * @returns The item instance.
     *
     * @example
     * ```ts
     * item.onInit((self) => {
     *     Packets.activateItem.fromClient((player) => self.tryActivate(player));
     * });
     * ```
     */
    onInit(initCallback: (item: this) => void) {
        this.INITIALIZES.push(initCallback);
        return this;
    }

    /**
     * Registers a callback that fires whenever the server spawns this item's model into the world.
     * Server-only; use `onClientLoad` for client initialisation.
     *
     * @param loadCallback Receives the spawned model and item reference.
     * @returns The item instance.
     *
     * @example
     * ```ts
     * item.onLoad((model) => {
     *     model.SetAttribute("IsInteractive", true);
     * });
     * ```
     */
    onLoad(loadCallback: (model: Model, item: this) => void) {
        this.LOADS.push(loadCallback);
        return this;
    }

    /**
     * Hooks into the client-side spawn of the item's model.
     * Use this to attach particle effects, client-only behaviour, or UI adornments.
     *
     * @param loadCallback Receives the client-side clone, the item, and the owning player.
     * @returns The item instance.
     *
     * @example
     * ```ts
     * item.onClientLoad((model, _item, player) => {
     *     MusicManager.playAmbientLoopFor(player, model);
     * });
     * ```
     */
    onClientLoad(loadCallback: (model: Model, item: this, player: Player) => void) {
        this.CLIENT_LOADS.push(loadCallback);
        return this;
    }

    /**
     * Convenience helper that wires the same callback to both `onLoad` and `onClientLoad`.
     * The player argument is `undefined` when executing on the server.
     *
     * @param loadCallback Fired for both server and client load events.
     * @returns The item instance.
     */
    onSharedLoad(loadCallback: (model: Model, item: this, player: Player | undefined) => void) {
        this.onLoad((model, item) => loadCallback(model, item, undefined));
        this.onClientLoad((model, item, player) => loadCallback(model, item, player));
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
        const ref = { delta: delta };
        REPEATS.set(callback, ref);
        if (instance !== undefined) instance.Destroying.Once(() => REPEATS.delete(callback));
        return ref;
    }

    /**
     * Drains the price set in {@link drain} every second.
     * If the price is not affordable, the item will be disabled.
     *
     * @param model The model of the item to maintain.
     */
    maintain(model: Model | undefined) {
        this.repeat(
            model,
            () => {
                const drain = this.drain;
                let affordable = true;

                if (drain !== undefined) affordable = Server.Currency.purchase(drain);

                if (model === undefined) return;
                const instanceInfo = getAllInstanceInfo(model);
                instanceInfo.Maintained = affordable;
            },
            1,
        );
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
        if (this.formula === undefined || this.formulaXGet === undefined || this.formulaCallback === undefined) return;

        let value = this.formulaXGet();
        const cap = this.formulaXCapValue;
        if (cap !== undefined && value.moreThan(cap) === true) {
            value = cap;
        }

        const result = this.formula.evaluate(value);
        this.formulaResult = result;
        this.formulaCallback(result, this);
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
    setImage(image: string) {
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

        if (this.drain !== undefined) str = str.gsub("%%drain%%", this.drain.toString(true, undefined, "/s"))[0];

        if (this.formulaXCap !== undefined) str = str.gsub("%%cap%%", this.formulaXCap.toString(true))[0];

        return str;
    }

    static {
        if (IS_SERVER || IS_EDIT) {
            REPEATS.set(
                () => {
                    const formulaResults = new Map<string, OnoeNum>();
                    for (const [id, item] of Item.itemPerId) {
                        formulaResults.set(id, item.performFormula()!);
                    }
                    if (os.clock() > 15) {
                        // simple delay to ensure clients are ready
                        Packets.boostChanged.toAllClients(formulaResults);
                    }
                },
                {
                    delta: 1,
                    lastCall: 0,
                },
            );
            const connection = RunService.Heartbeat.Connect(() => {
                if (Server.ready === false) return;

                const t = tick();
                const gameSpeed = GameSpeed.speed;
                for (const [callback, rep] of REPEATS) {
                    const last = rep.lastCall;
                    if (last === undefined) {
                        rep.lastCall = t;
                        continue;
                    }
                    const diff = t - last;
                    if (rep.delta === undefined || diff > rep.delta / gameSpeed) {
                        callback(diff);
                        rep.lastCall = t;
                    }
                }
            });
            eat(connection, "Disconnect");
        }
    }
}
