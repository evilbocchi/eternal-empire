import { OnInit, Service } from "@flamework/core";
import { HttpService } from "@rbxts/services";
import DataService from "server/services/serverdata/DataService";
import Item from "shared/item/Item";
import Items from "shared/items/Items";


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
     * @param allPots Optional parameter to specify a fixed value for all pots (0-100).
     * @returns The UUID of the created unique item instance, or undefined if the item doesn't support unique instances.
     */
    createUniqueInstance(baseItemId: string, allPots?: number): string | undefined {
        const baseItem = Items.getItem(baseItemId);
        if (!baseItem) {
            warn(`Base item with ID ${baseItemId} not found.`);
            return undefined;
        }

        const uniqueTrait = baseItem.findTrait("Unique");
        if (!uniqueTrait) {
            warn(`Item ${baseItemId} does not support unique instances.`);
            return undefined;
        }

        const instance = uniqueTrait.generateInstance(allPots);
        const uuid = HttpService.GenerateGUID(false);
        this.dataService.empireData.items.uniqueInstances.set(uuid, instance);
        return uuid;
    }

    /**
     * Gets all unique item instances of a specific base item type.
     * 
     * @param baseItemId The ID of the base item.
     * @returns An array of tuples containing [UUID, UniqueItemInstance] for all instances of the base item.
     */
    getInstancesOfType(baseItemId: string): Array<[string, UniqueItemInstance]> {
        const instances: Array<[string, UniqueItemInstance]> = [];
        const uniqueItems = this.dataService.empireData.items.uniqueInstances;

        for (const [uuid, instance] of uniqueItems) {
            if (instance.baseItemId === baseItemId) {
                instances.push([uuid, instance]);
            }
        }

        return instances;
    }
}