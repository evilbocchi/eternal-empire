//!native
//!optimize 2

/**
 * @fileoverview Client controller responsible for managing player inventory data.
 *
 * Handles:
 * - Tracking inventory items and unique instances
 * - Finding best unique item instances for items
 * - Coordinating with build controller for item placement
 *
 * This controller focuses purely on data management and business logic.
 * UI rendering is handled by React components.
 *
 * @since 1.0.0
 */

import { Controller } from "@flamework/core";
import BuildController from "client/controllers/gameplay/BuildController";
import { playSound } from "shared/asset/GameAssets";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import { getBestUniqueInstances } from "client/ui/components/inventory/InventoryWindow";

/**
 * Controller responsible for managing player inventory data and business logic.
 *
 * Provides data access methods for React components and handles item placement logic.
 */
@Controller()
export default class InventoryController {
    constructor(private buildController: BuildController) {}

    /**
     * Handle item activation for placement in the game world.
     * This method encapsulates the business logic for item placement.
     *
     * @param item The item to activate/place
     * @returns True if the item was successfully activated, false otherwise
     */
    activateItem(item: Item): boolean {
        const isPlaceable = item.placeableAreas.size() > 0 || item.bounds !== undefined;
        const level = Packets.level.get() ?? 0;

        // Check restrictions
        if (
            this.buildController.getRestricted() === true ||
            isPlaceable === false ||
            (item.levelReq !== undefined && item.levelReq > level)
        ) {
            playSound("Error.mp3");
            return false;
        }

        playSound("MenuClick.mp3");

        // Find best unique instance if applicable
        let bestUuid: string | undefined;
        if (Items.uniqueItems.has(item)) {
            bestUuid = getBestUniqueInstances(Packets.uniqueInstances.get() ?? new Map()).get(item.id);
        }

        // Add placing model and select it
        this.buildController.mainSelect(this.buildController.addPlacingModel(item, bestUuid));

        return true;
    }
}
