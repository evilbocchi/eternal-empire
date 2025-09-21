import { OnoeNum } from "@antivivi/serikanum";
import { formatRichText } from "@antivivi/vrldk";
import ThisEmpire from "shared/data/ThisEmpire";
import Item from "shared/item/Item";
import { Server } from "shared/item/ItemUtils";
import ItemTrait from "shared/item/traits/ItemTrait";

declare global {
    interface ItemTraits {
        Unique: Unique;
    }

    /**
     * Configuration for a pot (unique stat) that can be generated for a unique item.
     * Defines the scaling range for converting raw 0-100 percentage values to actual values.
     */
    interface PotConfig {
        /**
         * The minimum value for this pot when scaling from 0%.
         */
        min: number;

        /**
         * The maximum value for this pot when scaling from 100%.
         */
        max: number;

        /**
         * Whether the scaled value should be an integer (default: false).
         */
        integer?: boolean;
    }
}

/**
 * Trait for items that can be generated as unique instances with randomized pots.
 *
 * Unique items have randomly generated stats (called "pots") that vary between instances
 * of the same item type. Pot values are stored as raw percentages (0-100) and scaled
 * to the configured min-max ranges when accessed. This ensures that changing pot ranges
 * after publication won't cause inconsistency for existing items.
 *
 * For example, an "Admirer" unique item might boost Admiration from 5% to 100% depending
 * on its pot value, but the raw percentage is always stored as 0-100.
 */
export default class Unique extends ItemTrait {
    /**
     * Configuration for the pots that can be generated for this unique item.
     * Key is the pot name, value is the configuration for that pot.
     */
    private readonly potConfigs = new Map<string, PotConfig>();

    /**
     * Callback to be called when the unique item is loaded.
     * This can be used to apply effects based on the generated pot values.
     */
    private loadCallback: ((model: Model, unique: Unique, scaledPots: Map<string, number>) => void) | undefined;

    private readonly MIN_COLOR = Color3.fromRGB(255, 0, 0);
    private readonly MAX_COLOR = Color3.fromRGB(0, 255, 255);

    static load(model: Model, unique: Unique) {
        const placedItem = Server.Item.getPlacedItem(model.Name);
        if (placedItem === undefined) {
            throw `Unique item model ${model.Name} not found in placed items.`;
        }

        const uuid = placedItem.uniqueItemId;
        if (uuid === undefined) {
            throw `Unique item model ${model.Name} does not have a unique item UUID.`;
        }

        const uniqueInstance = ThisEmpire.data.items.uniqueInstances.get(uuid);
        if (uniqueInstance === undefined) {
            throw `Unique item instance for UUID ${uuid} not found.`;
        }

        const aura = model.FindFirstChild("Aura") as BasePart | undefined;
        if (aura !== undefined) {
            aura.CanCollide = false;
            let maxValue = 0;
            let totalValue = 0;
            for (const [_, potValue] of uniqueInstance.pots) {
                maxValue += 100;
                totalValue += potValue;
            }
            aura.Color = unique.MIN_COLOR.Lerp(unique.MAX_COLOR, totalValue / maxValue);
        }

        const scaledPots = unique.getScaledPots(uniqueInstance);
        if (unique.loadCallback !== undefined) {
            unique.loadCallback(model, unique, scaledPots);
        }
    }

    constructor(item: Item) {
        super(item);
        item.onLoad((model) => Unique.load(model, this));
    }

    onLoad(callback: (model: Model, unique: Unique, scaledPots: Map<string, number>) => void) {
        this.loadCallback = callback;
        return this;
    }

    /**
     * Adds a pot configuration to this unique item.
     *
     * @param name The name of the pot (e.g., "admirationBoost", "dropRate").
     * @param min The minimum value for this pot.
     * @param max The maximum value for this pot.
     * @param integer Whether this value should be an integer (default: false).
     * @returns This trait for method chaining.
     *
     * @example
     * ```ts
     * item.trait(Unique)
     *     .addPot("admirationBoost", 0.05, 1.0)
     *     .addPot("dropRateMultiplier", 1.1, 2.5);
     * ```
     */
    addPot(name: string, min: number, max: number, integer: boolean = false): this {
        this.potConfigs.set(name, {
            min,
            max,
            integer,
        });
        return this;
    }

    /**
     * Gets the pot configurations for this unique item.
     *
     * @returns A read-only map of pot configurations.
     */
    getPotConfigs(): ReadonlyMap<string, PotConfig> {
        return this.potConfigs;
    }

    /**
     * Generates a new unique item instance with randomly generated pot values.
     * Pot values are generated as percentages (0-100) and scaled when accessed.
     *
     * @param allPots Optional parameter to specify a fixed value for all pots (0-100).
     * @returns A unique item instance with generated pots.
     */
    generateInstance(allPots?: number): UniqueItemInstance {
        const pots = new Map<string, number>();

        for (const [potName] of this.potConfigs) {
            // Generate a random percentage from 0 to 100
            const randomPercentage = (allPots ?? math.random()) * 100;
            pots.set(potName, randomPercentage);
        }

        return {
            baseItemId: this.item.id,
            pots,
            created: tick(),
        };
    }

    /**
     * Gets all scaled pot values for a unique item instance.
     *
     * @param instance The unique item instance.
     * @returns A map of pot names to their scaled values.
     */
    getScaledPots(instance: UniqueItemInstance): Map<string, number> {
        const scaledPots = new Map<string, number>();

        for (const [potName, config] of this.potConfigs) {
            let rawValue = instance.pots.get(potName);
            if (rawValue === undefined) {
                warn(`Pot ${potName} not found in unique item instance for ${instance.baseItemId}`);
                instance.pots.set(potName, 0);
                rawValue = 0;
            }
            let scaledValue = config.min + (rawValue / 100) * (config.max - config.min);
            if (config.integer) {
                scaledValue = math.floor(scaledValue);
            }
            scaledPots.set(potName, scaledValue);
        }

        return scaledPots;
    }

    /**
     * Formats a string with pot values from a unique item instance.
     * Uses scaled pot values based on the current pot configurations.
     *
     * @param str The string to format with pot placeholders (e.g., "%admirationBoost%").
     * @param instance The unique item instance to get pot values from.
     * @returns The formatted string.
     */
    formatWithPots(str: string, instance: UniqueItemInstance): string {
        const scaledPots = this.getScaledPots(instance);

        for (const [potName, config] of this.potConfigs) {
            const value = scaledPots.get(potName);
            if (value === undefined) continue;
            const placeholder = `%%${potName}%%`;
            let formatted = new OnoeNum(value).toString();
            const alpha = (value - config.min) / (config.max - config.min);
            formatted = formatRichText(formatted, this.MIN_COLOR.Lerp(this.MAX_COLOR, alpha));
            str = str.gsub(placeholder, formatted)[0];
        }
        return str;
    }
}
