//!native
//!optimize 2

/**
 * @fileoverview Quest progression and stage management system.
 *
 * This service handles:
 * - Quest stage progression tracking
 * - Quest completion validation
 * - Quest data persistence and synchronization
 * - Waypoint management for quest navigation
 * - Integration with the sandbox mode
 *
 * Quest stages are tracked as numbers:
 * - 0 to N-1: Active stages (where N is the total number of stages)
 * - -1: Quest completed
 *
 * The service ensures proper stage progression order and prevents skipping.
 *
 * @since 1.0.0
 */

import { OnInit, OnStart, Service } from "@flamework/core";
import Quest from "server/quests/Quest";
import DataService from "server/services/data/DataService";
import ItemService from "server/services/item/ItemService";
import ChatHookService from "server/services/permissions/ChatHookService";
import { WAYPOINTS } from "shared/constants";
import { IS_CI } from "shared/Context";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";

/**
 * Service for managing quest progression and stage tracking.
 *
 * Handles the complete quest system including stage advancement,
 * completion validation, and waypoint management for navigation.
 */
@Service()
export default class QuestService implements OnStart {
    /** Exposed Quest class for command access */
    readonly Quest = Quest;

    constructor(
        private readonly chatHookService: ChatHookService,
        private readonly dataService: DataService,
        private readonly itemService: ItemService,
    ) {}

    /**
     * Gives a quest item and notifies the player.
     * @param itemId The item ID.
     * @param amount The amount to give.
     */
    giveQuestItem(itemId: string, amount: number) {
        this.itemService.giveItem(itemId, amount);
        this.chatHookService.sendServerMessage(
            `[+${amount} ${Items.getItem(itemId)?.name}]`,
            "tag:hidden;color:255,170,255",
        );
    }

    /**
     * Takes a quest item if available and notifies the player.
     *
     * @param itemId The item ID. Unique items are not accepted.
     * @param amount The amount to take.
     * @returns True if successful, false otherwise.
     */
    takeQuestItem(itemId: string, amount: number) {
        const currentAmount = this.itemService.getItemAmount(itemId);
        if (currentAmount < amount) return false;
        this.itemService.setItemAmount(itemId, currentAmount - amount);
        this.chatHookService.sendServerMessage(
            `[-${amount} ${Items.getItem(itemId)?.name}]`,
            "tag:hidden;color:255,170,255",
        );
        return true;
    }

    onStart() {
        if (!Sandbox.getEnabled() && !IS_CI) {
            // Configure waypoint objects for quest navigation
            for (const waypoint of WAYPOINTS.GetChildren()) {
                if (!waypoint.IsA("BasePart")) continue;

                // Make waypoints invisible and non-interactive
                waypoint.Transparency = 1;
                waypoint.CanCollide = false;
                waypoint.CanTouch = false;
                waypoint.CanQuery = false;
            }
        }

        // Monitor quest stage changes
        let lastStagesPerQuest = new Map<string, number>();
        while (task.wait(0.1)) {
            const stagesPerQuest = this.dataService.empireData.quests;
            let changed = false;
            for (const [questId, stage] of stagesPerQuest) {
                const last = lastStagesPerQuest.get(questId);
                if (last !== stage) {
                    changed = true;
                    break;
                }
            }
            if (!changed) {
                continue;
            }
            lastStagesPerQuest = table.clone(stagesPerQuest);
            Packets.stagePerQuest.set(stagesPerQuest);
        }
    }
}
