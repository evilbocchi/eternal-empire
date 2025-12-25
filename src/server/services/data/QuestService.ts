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

import { simpleInterval } from "@antivivi/vrldk";
import { OnStart, Service } from "@flamework/core";
import Quest from "server/quests/Quest";
import DataService from "server/services/data/DataService";
import ItemService from "server/services/item/ItemService";
import ChatHookService from "server/services/permissions/ChatHookService";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

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
     * Gives a quest item using {@link ItemService.giveItem} and notifies the player.
     * @param item The item.
     * @param amount The amount to give.
     */
    giveQuestItem(item: Item, amount: number) {
        this.itemService.giveItem(item, amount);
        this.chatHookService.sendServerMessage(`[+${amount} ${item.name}]`, "tag:hidden;color:255,170,255");
    }

    /**
     * Takes a quest item if available and notifies the player.
     *
     * @param item The item. Unique items are not accepted.
     * @param amount The amount to take.
     * @returns True if successful, false otherwise.
     */
    takeQuestItem(item: Item, amount: number) {
        if (item.isA("Unique")) throw `Cannot take unique item '${item.id}' as a quest item.`;

        const currentAmount = this.dataService.empireData.items.inventory.get(item.id) ?? 0;
        if (currentAmount < amount) return false;

        this.dataService.empireData.items.inventory.set(item.id, currentAmount - amount);

        this.chatHookService.sendServerMessage(`[-${amount} ${item.name}]`, "tag:hidden;color:255,170,255");
        return true;
    }

    onStart() {
        // Monitor quest stage changes
        let lastStagesPerQuest = new Map<string, number>();
        const cleanup = simpleInterval(() => {
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
                return;
            }
            lastStagesPerQuest = table.clone(stagesPerQuest);
            Packets.stagePerQuest.set(stagesPerQuest);
        }, 0.1);
        eat(cleanup);
    }
}
