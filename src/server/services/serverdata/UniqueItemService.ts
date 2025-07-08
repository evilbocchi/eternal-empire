import { OnInit, Service } from "@flamework/core";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import UUID from "shared/utils/UUID";
import DataService from "./DataService";

/**
 * Service for managing unique item instances, including creation, retrieval, and validation.
 * 
 * Handles the lifecycle of unique items from generation to storage and provides
 * utilities for working with unique item instances and their pots.
 */
@Service()
export default class UniqueItemService implements OnInit {

    constructor(
        private readonly dataService: DataService
    ) { }

    onInit() {
        // Service initialization if needed
    }

    /**
     * Creates a new unique item instance from the given base item.
     * 
     * @param baseItemId The ID of the base item to create a unique instance from.
     * @returns The UUID of the created unique item instance, or undefined if the item doesn't support unique instances.
     */
    createUniqueInstance(baseItemId: string): string | undefined {
        const baseItem = Items.getItem(baseItemId);
        if (!baseItem) {
            warn(`Base item with ID ${baseItemId} not found`);
            return undefined;
        }

        const uniqueTrait = baseItem.findTrait("UniqueItem");
        if (!uniqueTrait) {
            warn(`Item ${baseItemId} does not support unique instances`);
            return undefined;
        }

        const empireData = this.dataService.empireData;
        return uniqueTrait.createInstance(empireData.items.uniqueItems);
    }

    /**
     * Gets a unique item instance by its UUID.
     * 
     * @param uuid The UUID of the unique item instance.
     * @returns The unique item instance, or undefined if not found.
     */
    getUniqueInstance(uuid: string): UniqueItemInstance | undefined {
        return this.dataService.empireData.items.uniqueItems.get(uuid);
    }

    /**
     * Gets the base item for a unique item instance.
     * 
     * @param uuid The UUID of the unique item instance.
     * @returns The base item, or undefined if the instance or item is not found.
     */
    getBaseItem(uuid: string): Item | undefined {
        const instance = this.getUniqueInstance(uuid);
        if (!instance) {
            return undefined;
        }

        return Items.getItem(instance.baseItemId);
    }

    /**
     * Gets all unique item instances of a specific base item type.
     * 
     * @param baseItemId The ID of the base item.
     * @returns An array of tuples containing [UUID, UniqueItemInstance] for all instances of the base item.
     */
    getInstancesOfType(baseItemId: string): Array<[string, UniqueItemInstance]> {
        const instances: Array<[string, UniqueItemInstance]> = [];
        const uniqueItems = this.dataService.empireData.items.uniqueItems;

        for (const [uuid, instance] of uniqueItems) {
            if (instance.baseItemId === baseItemId) {
                instances.push([uuid, instance]);
            }
        }

        return instances;
    }

    /**
     * Deletes a unique item instance.
     * 
     * @param uuid The UUID of the unique item instance to delete.
     * @returns True if the instance was deleted, false if it didn't exist.
     */
    deleteUniqueInstance(uuid: string): boolean {
        const uniqueItems = this.dataService.empireData.items.uniqueItems;
        if (uniqueItems.has(uuid)) {
            uniqueItems.delete(uuid);
            return true;
        }
        return false;
    }

    /**
     * Validates a unique item instance and its pots.
     * 
     * @param uuid The UUID of the unique item instance.
     * @returns True if the instance is valid, false otherwise.
     */
    validateInstance(uuid: string): boolean {
        if (!UUID.isValid(uuid)) {
            return false;
        }

        const instance = this.getUniqueInstance(uuid);
        if (!instance) {
            return false;
        }

        const baseItem = this.getBaseItem(uuid);
        if (!baseItem) {
            return false;
        }

        const uniqueTrait = baseItem.findTrait("UniqueItem");
        if (!uniqueTrait) {
            return false;
        }

        // Validate that all pots exist in the configuration
        const potConfigs = uniqueTrait.getPotConfigs();
        for (const [potName, rawValue] of instance.pots) {
            if (!potConfigs.has(potName)) {
                warn(`Invalid pot ${potName} found in unique item instance ${uuid}`);
                return false;
            }

            // Validate that raw value is within 0-100 range
            if (rawValue < 0 || rawValue > 100) {
                warn(`Raw pot value ${rawValue} for ${potName} is outside 0-100 range in instance ${uuid}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Gets a formatted description for a unique item instance.
     * 
     * @param uuid The UUID of the unique item instance.
     * @returns The formatted description with pot values, or undefined if the instance is not found.
     */
    getFormattedDescription(uuid: string): string | undefined {
        const instance = this.getUniqueInstance(uuid);
        const baseItem = this.getBaseItem(uuid);

        if (!instance || !baseItem) {
            return undefined;
        }

        const uniqueTrait = baseItem.findTrait("UniqueItem");
        if (!uniqueTrait) {
            return undefined;
        }

        return uniqueTrait.formatWithPots(baseItem.description, instance);
    }

    /**
     * Gets the scaled pot values for a unique item instance.
     * 
     * @param uuid The UUID of the unique item instance.
     * @returns A map of scaled pot values, or undefined if the instance is not found.
     */
    getScaledPots(uuid: string): Map<string, number> | undefined {
        const instance = this.getUniqueInstance(uuid);
        const baseItem = this.getBaseItem(uuid);

        if (!instance || !baseItem) {
            return undefined;
        }

        const uniqueTrait = baseItem.findTrait("UniqueItem");
        if (!uniqueTrait) {
            return undefined;
        }

        return uniqueTrait.getScaledPots(instance);
    }

    /**
     * Gets a specific scaled pot value for a unique item instance.
     * 
     * @param uuid The UUID of the unique item instance.
     * @param potName The name of the pot to get.
     * @returns The scaled pot value, or undefined if not found.
     */
    getScaledPot(uuid: string, potName: string): number | undefined {
        const scaledPots = this.getScaledPots(uuid);
        if (!scaledPots) {
            return undefined;
        }

        return scaledPots.get(potName);
    }

    /**
     * Gets the total count of unique items in the empire.
     * 
     * @returns The number of unique item instances.
     */
    getUniqueItemCount(): number {
        return this.dataService.empireData.items.uniqueItems.size();
    }
}