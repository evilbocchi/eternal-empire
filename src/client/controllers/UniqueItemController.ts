import { Controller, OnInit } from "@flamework/core";
import Packets from "shared/Packets";

/**
 * Controller for managing unique item data and formatted descriptions.
 * 
 * This service:
 * - Receives unique item instances from the server
 * - Stores formatted descriptions for unique items
 * - Provides utilities for checking if an item is unique
 * - Manages client-side unique item state
 */
@Controller()
export default class UniqueItemController implements OnInit {
    private uniqueItems = new Map<string, UniqueItemInstance>();
    private uniqueItemDescriptions = new Map<string, string>();

    constructor() {

    }

    /**
     * Gets a unique item instance by its UUID.
     * 
     * @param uuid The UUID of the unique item instance.
     * @returns The unique item instance, or undefined if not found.
     */
    getUniqueInstance(uuid: string): UniqueItemInstance | undefined {
        return this.uniqueItems.get(uuid);
    }

    /**
     * Gets the formatted description for a unique item instance.
     * 
     * @param uuid The UUID of the unique item instance.
     * @returns The formatted description, or undefined if not found.
     */
    getFormattedDescription(uuid: string): string | undefined {
        return this.uniqueItemDescriptions.get(uuid);
    }

    /**
     * Gets all unique item instances of a specific base item type.
     * 
     * @param baseItemId The ID of the base item.
     * @returns An array of tuples containing [UUID, UniqueItemInstance] for all instances of the base item.
     */
    getInstancesOfType(baseItemId: string): Array<[string, UniqueItemInstance]> {
        const instances: Array<[string, UniqueItemInstance]> = [];

        for (const [uuid, instance] of this.uniqueItems) {
            if (instance.baseItemId === baseItemId) {
                instances.push([uuid, instance]);
            }
        }

        return instances;
    }

    /**
     * Checks if there are any unique item instances of the specified base item type.
     * 
     * @param baseItemId The ID of the base item.
     * @returns True if there are unique instances, false otherwise.
     */
    hasUniqueInstancesOfType(baseItemId: string): boolean {
        for (const [_, instance] of this.uniqueItems) {
            if (instance.baseItemId === baseItemId) {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets the total count of unique items.
     * 
     * @returns The number of unique item instances.
     */
    getUniqueItemCount(): number {
        return this.uniqueItems.size();
    }

    /**
     * Gets all unique item UUIDs.
     * 
     * @returns An array of all unique item UUIDs.
     */
    getAllUniqueItemUUIDs(): string[] {
        const uuids: string[] = [];
        for (const [uuid] of this.uniqueItems) {
            uuids.push(uuid);
        }
        return uuids;
    }

    onInit() {
        // Listen for unique item updates from server
        Packets.uniqueItems.observe((uniqueItems) => {
            this.uniqueItems = uniqueItems;
        });

        Packets.uniqueItemDescriptions.observe((descriptions) => {
            this.uniqueItemDescriptions = descriptions;
        });
    }
}