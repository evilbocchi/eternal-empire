//!native
//!optimize 2

/**
 * @fileoverview Client controller responsible for managing inventory data and integration.
 *
 * Simplified to work with React inventory window component:
 * - Provides utility methods for item placement
 * - Manages inventory state integration
 * - Handles build controller coordination
 * - No longer manages GUI directly (React handles UI)
 *
 * @since 1.0.0
 */

import { Controller, OnInit, OnStart } from "@flamework/core";
import AdaptiveTabController from "client/controllers/core/AdaptiveTabController";
import UIController from "client/controllers/core/UIController";
import BuildController from "client/controllers/gameplay/BuildController";
import TooltipController from "client/controllers/interface/TooltipController";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

/**
 * Controller responsible for managing inventory data and integration with build system.
 *
 * Simplified for React integration - no longer manages GUI directly.
 */
@Controller()
export default class InventoryController implements OnInit, OnStart {

    constructor(
        private uiController: UIController, 
        private adaptiveTabController: AdaptiveTabController, 
        private buildController: BuildController, 
        private tooltipController: TooltipController
    ) {
    }

    /**
     * Find the best unique item instance for a given base item ID based on its average pot.
     *
     * @param baseItemId The ID of the base item to find the best unique instance for.
     * @returns The best unique item instance UUID, or undefined if no instances found.
     */
    getBest(baseItemId: string) {
        // Find the best unique item instance for the given base item ID
        let bestUuid: string | undefined;
        let bestInstance: UniqueItemInstance | undefined;
        const uniqueInstances = Packets.uniqueInstances.get();
        if (uniqueInstances === undefined) {
            return undefined;
        }
        for (const [uuid, instance] of uniqueInstances) {
            if (instance.placed)
                continue; // Skip placed instances
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

    /**
     * Handles item placement when clicked in inventory.
     * Used by React inventory component.
     */
    handleItemClick(item: Item): boolean {
        const isPlaceable = item.placeableAreas.size() > 0 || item.bounds !== undefined;
        const level = Packets.level.get() ?? 0;
        
        if (this.buildController.getRestricted() === true || 
            isPlaceable === false || 
            (item.levelReq !== undefined && item.levelReq > level)) {
            playSound("Error.mp3");
            return false;
        }

        this.adaptiveTabController.hideAdaptiveTab();
        playSound("MenuClick.mp3");
        
        let bestUuid: string | undefined;
        if (Items.uniqueItems.has(item)) {
            bestUuid = this.getBest(item.id);
        }

        this.buildController.mainSelect(this.buildController.addPlacingModel(item, bestUuid));
        return true;
    }

    /**
     * Gets the build controller for React component integration.
     */
    getBuildController(): BuildController {
        return this.buildController;
    }

    /**
     * Initializes the InventoryController.
     * Note: No longer loads GUI elements as React handles the UI.
     */
    onInit() {
        // React handles the UI now, so this is simplified
    }

    /**
     * Starts the InventoryController.
     * Note: React components handle inventory state observation directly.
     */
    onStart() {
        // React components handle state observation directly
        // This controller now just provides utility methods
    }
}