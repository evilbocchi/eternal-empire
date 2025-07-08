import { OnoeNum } from "@antivivi/serikanum";
import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import UUID from "shared/utils/UUID";

declare global {
    interface ItemTraits {
        Unique: Unique;
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

    constructor(item: Item) {
        super(item);
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
            integer
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
            created: tick()
        };
    }

    /**
     * Scales a raw pot percentage value to the actual value based on the pot configuration.
     * 
     * @param potName The name of the pot.
     * @param rawValue The raw percentage value (0-100).
     * @returns The scaled value according to the pot configuration.
     */
    scalePotValue(potName: string, rawValue: number): number {
        const config = this.potConfigs.get(potName);
        if (!config) {
            warn(`Pot configuration for '${potName}' not found`);
            return rawValue;
        }

        // Scale from 0-100 percentage to min-max range
        const scaledValue = config.min + (rawValue / 100) * (config.max - config.min);
        return config.integer ? math.floor(scaledValue) : scaledValue;
    }

    /**
     * Gets all scaled pot values for a unique item instance.
     * 
     * @param instance The unique item instance.
     * @returns A map of pot names to their scaled values.
     */
    getScaledPots(instance: UniqueItemInstance): Map<string, number> {
        const scaledPots = new Map<string, number>();

        for (const [potName, rawValue] of instance.pots) {
            const scaledValue = this.scalePotValue(potName, rawValue);
            scaledPots.set(potName, scaledValue);
        }

        return scaledPots;
    }

    /**
     * Creates a new unique item instance and returns its UUID.
     * This is a convenience method that generates the instance and stores it.
     * 
     * @param storage The storage map to add the instance to.
     * @param allPots Optional parameter to specify a fixed value for all pots (0-100).
     * @returns The UUID of the created unique item instance.
     */
    createInstance(storage: Map<string, UniqueItemInstance>, allPots?: number): string {
        const uuid = UUID.generate();
        const instance = this.generateInstance(allPots);
        storage.set(uuid, instance);
        return uuid;
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
        let formatted = str;
        const scaledPots = this.getScaledPots(instance);

        for (const [potName, value] of scaledPots) {
            const placeholder = `%%${potName}%%`;
            const formattedValue = new OnoeNum(value).toString();
            formatted = formatted.gsub(placeholder, formattedValue)[0];
        }
        return formatted;
    }
}