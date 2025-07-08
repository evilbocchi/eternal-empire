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

    private uniqueInstances = new Map<string, UniqueItemInstance>();

    constructor() {

    }

    /**
     * Find the best unique item instance for a given base item ID based on its average pot.
     * 
     * @param baseItemId The ID of the base item to find the best unique instance for.
     * @returns The best unique item instance, or undefined if no instances found.
     */
    getBest(baseItemId: string) {
        // Find the best unique item instance for the given base item ID
        let bestUuid: string | undefined;
        let bestInstance: UniqueItemInstance | undefined;
        for (const [uuid, instance] of this.uniqueInstances) {
            if (instance.baseItemId === baseItemId) {
                let thisPots = 0;
                for (const [_, potValue] of instance.pots) {
                    thisPots += potValue;
                }

                let otherPots = 0;
                if (bestInstance) {
                    for (const [_, potValue] of bestInstance.pots) {
                        otherPots += potValue;
                    }
                }

                if (thisPots > otherPots) {
                    bestInstance = instance;
                    bestUuid = uuid;
                }
            }
        }
        return bestUuid;
    }


    onInit() {
        // Listen for unique item updates from server
        Packets.uniqueInstances.observe((uniqueInstances) => {
            this.uniqueInstances = uniqueInstances;
        });
    }
}