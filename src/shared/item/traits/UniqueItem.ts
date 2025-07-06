import Item from "shared/item/Item";
import ItemTrait from "shared/item/traits/ItemTrait";
import UUID from "shared/utils/UUID";

declare global {
    interface ItemTraits {
        UniqueItem: UniqueItem;
    }
}

/**
 * Trait for items that can be generated as unique instances with randomized pots.
 * 
 * Unique items have randomly generated stats (called "pots") that vary between instances
 * of the same item type. For example, an "Admirer" unique item might boost Admiration
 * from 5% to 100% depending on its pot value.
 */
export default class UniqueItem extends ItemTrait {
    
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
     * item.trait(UniqueItem)
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
     * 
     * @returns A unique item instance with generated pots.
     */
    generateInstance(): UniqueItemInstance {
        const pots = new Map<string, number>();
        
        for (const [potName, config] of this.potConfigs) {
            const randomValue = config.min + math.random() * (config.max - config.min);
            const finalValue = config.integer ? math.floor(randomValue) : randomValue;
            pots.set(potName, finalValue);
        }

        return {
            baseItemId: this.item.id,
            pots,
            created: tick()
        };
    }

    /**
     * Creates a new unique item instance and returns its UUID.
     * This is a convenience method that generates the instance and stores it.
     * 
     * @param storage The storage map to add the instance to.
     * @returns The UUID of the created unique item instance.
     */
    createInstance(storage: Map<string, UniqueItemInstance>): string {
        const uuid = UUID.generate();
        const instance = this.generateInstance();
        storage.set(uuid, instance);
        return uuid;
    }

    /**
     * Formats a string with pot values from a unique item instance.
     * 
     * @param str The string to format with pot placeholders (e.g., "%admirationBoost%").
     * @param instance The unique item instance to get pot values from.
     * @returns The formatted string.
     */
    static formatWithPots(str: string, instance: UniqueItemInstance): string {
        let formatted = str;
        for (const [potName, value] of instance.pots) {
            const placeholder = `%${potName}%`;
            const formattedValue = typeIs(value, "number") ? 
                (value % 1 === 0 ? tostring(value) : string.format("%.2f", value)) : 
                tostring(value);
            formatted = formatted.gsub(placeholder, formattedValue)[0];
        }
        return formatted;
    }
}