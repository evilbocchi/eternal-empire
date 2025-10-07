/**
 * @fileoverview Manages grabbable items scattered throughout the world.
 *
 * This service handles:
 * - Finding and initializing ProximityPrompts tagged as "Grabbable"
 * - Visual representation of grabbable items (replacing placeholder parts with actual item models)
 * - Tracking item collection status using event completion system
 * - Giving collected items to players and showing reward notifications
 * - Cleaning up grabbed items to prevent duplicate collection
 *
 * Grabbable items are typically placed in the world as collectibles that players can
 * interact with once. They use the event system to ensure each item can only be
 * collected once per server session.
 *
 * @since 1.0.0
 */

import { OnInit, Service } from "@flamework/core";
import { CollectionService, Workspace } from "@rbxts/services";
import EventService from "server/services/data/EventService";
import ItemService from "server/services/item/ItemService";
import { IS_EDIT } from "shared/Context";
import eat from "shared/hamster/eat";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import CustomProximityPrompt from "shared/world/CustomProximityPrompt";

/**
 * Service that manages grabbable items throughout the world.
 *
 * Handles the initialization, visual setup, and collection mechanics for
 * items that players can find and collect in the game world. Each grabbable
 * item can only be collected once and is tracked via the event system.
 */
@Service()
export default class GrabbableService implements OnInit {
    constructor(
        private readonly eventService: EventService,
        private readonly itemService: ItemService,
    ) {}

    onInit() {
        for (const proximityPrompt of CollectionService.GetTagged("Grabbable")) {
            // Validate that the tagged object is actually a ProximityPrompt
            if (!proximityPrompt.IsA("ProximityPrompt")) continue;

            const parent = proximityPrompt.Parent;
            if (parent === undefined) continue;

            // Ensure the prompt has a valid BasePart parent
            if (!parent.IsA("BasePart")) {
                warn("ProximityPrompt parent is not a BasePart");
                continue;
            }

            // Get the item data using the parent's name as the item ID
            const itemId = parent.Name;
            const item = Items.getItem(itemId);
            if (item === undefined) {
                warn(`Item with ID ${itemId} not found`);
                continue;
            }

            // Replace cyan placeholder parts (0, 255, 255) with actual item models
            let model: Model | undefined;
            if (parent.Color === Color3.fromRGB(0, 255, 255) && parent.Transparency === 0.5) {
                model = item.MODEL?.Clone();
                if (model) {
                    model.PivotTo(parent.CFrame);
                    model.Parent = Workspace;
                    eat(model, "Destroy");
                }
                // Hide the placeholder part
                if (!IS_EDIT) parent.Transparency = 1;
            }

            // Check if this item has already been collected
            const eventId = itemId + "_grabbed";
            if (this.eventService.isEventCompleted(eventId)) {
                if (!IS_EDIT) {
                    proximityPrompt.Parent?.Destroy();
                }
                model?.Destroy();
                continue;
            }

            // Set up collection event handler
            const cleanup = CustomProximityPrompt.onTrigger(proximityPrompt, () => {
                // Double-check that the item hasn't been collected since initialization
                if (this.eventService.isEventCompleted(eventId)) {
                    return;
                }

                // Mark the item as collected and give it to the player
                this.eventService.setEventCompleted(eventId, true);
                this.itemService.giveItem(itemId, 1);
                Packets.showLoot.toAllClients([{ id: itemId, amount: 1 }]);

                // Remove the grabbable object from the world
                if (!IS_EDIT) {
                    proximityPrompt.Parent?.Destroy();
                }
                model?.Destroy();
            });
            eat(cleanup);
        }
    }
}
