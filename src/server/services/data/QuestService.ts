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

import { OnInit, Service } from "@flamework/core";
import { AnalyticsService, Players } from "@rbxts/services";
import Quest, { Stage } from "server/Quest";
import ItemService from "server/services/item/ItemService";
import DialogueService from "server/services/npc/DialogueService";
import ChatHookService from "server/services/permissions/ChatHookService";
import DataService from "server/services/data/DataService";
import LevelService from "server/services/data/LevelService";
import { WAYPOINTS } from "shared/constants";
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
export default class QuestService implements OnInit {

    readonly CLEANUP_PER_STAGE = new Map<Stage, () => void>();

    constructor(private readonly chatHookService: ChatHookService,
        private readonly dataService: DataService,
        private readonly levelService: LevelService,
        private readonly itemService: ItemService,
        private readonly dialogueService: DialogueService) {

    }

    /**
     * Advances a quest to the next stage with validation.
     * Ensures stages are completed in order and handles quest completion.
     * 
     * @param quest The quest object to advance.
     * @param current The current stage number that should be completed.
     * @returns The new stage number, or undefined if advancement failed.
     *          Returns -1 if the quest is now completed.
     */
    completeStage(quest: Quest, current: number) {
        const stagePerQuest = this.dataService.empireData.quests;
        const currentStage = stagePerQuest.get(quest.id);

        // Skip if quest is already completed
        if (currentStage === -1) {
            return;
        }

        const stageSize = quest.stages.size();
        const newStage = (currentStage ?? 0) + 1;

        // Validate stage progression order
        if (newStage !== current + 1) {
            return;
        }

        // Determine next stage or completion
        const n = newStage > stageSize - 1 ? -1 : newStage;
        stagePerQuest.set(quest.id, n);
        Packets.stagePerQuest.set(stagePerQuest);
        return n;
    }

    /**
     * Checks and triggers the reachability of quest stages based on player level.
     * 
     * @param level The player level to check quest reachability (defaults to current level).
     */
    reachStages(level?: number) {
        if (level === undefined) {
            level = this.dataService.empireData.level;
        }
        const stagePerQuest = this.dataService.empireData.quests;
        if (stagePerQuest === undefined) {
            return;
        }

        for (const [id, quest] of Quest.QUEST_PER_ID) {
            // Skip quests above player level
            if (quest.level > level) {
                continue;
            }

            const current = stagePerQuest.get(id) ?? 0;

            // Handle already completed quests
            if (current === -1) {
                quest.completed = true;
                const completionDialogue = quest.completionDialogue;
                if (completionDialogue) {
                    this.dialogueService.addDialogue(completionDialogue);
                }
            }

            // Handle previous stages
            for (let i = 0; i < current; i++) {
                const stage = quest.stages[i];
                this.CLEANUP_PER_STAGE.get(stage)?.();
            }

            const stage = quest.stages[current];
            if (stage !== undefined) {
                const cleanup = stage.reach();
                this.CLEANUP_PER_STAGE.set(stage, () => {
                    cleanup();
                    this.CLEANUP_PER_STAGE.delete(stage);
                });
            }
        }
    }

    /**
     * Gives a quest item and notifies the player.
     * @param itemId The item ID.
     * @param amount The amount to give.
     */
    giveQuestItem(itemId: string, amount: number) {
        this.itemService.setItemAmount(itemId, this.itemService.getItemAmount(itemId) + amount);
        this.chatHookService.sendServerMessage(`[+${amount} ${Items.getItem(itemId)?.name}]`, "tag:hidden;color:255,170,255");
    }

    /**
     * Takes a quest item if available and notifies the player.
     * 
     * @param itemId The item ID.
     * @param amount The amount to take.
     * @returns True if successful, false otherwise.
     */
    takeQuestItem(itemId: string, amount: number) {
        const currentAmount = this.itemService.getItemAmount(itemId);
        if (currentAmount < amount)
            return false;
        this.itemService.setItemAmount(itemId, currentAmount - amount);
        this.chatHookService.sendServerMessage(`[-${amount} ${Items.getItem(itemId)?.name}]`, "tag:hidden;color:255,170,255");
        return true;
    }

    loadQuests() {
        const questInfos = Quest.load();
        for (const [_, quest] of Quest.QUEST_PER_ID) {
            quest.stages.forEach((stage, index) => {
                stage.onComplete((stage) => {
                    const newStage = this.completeStage(quest, index);
                    if (newStage === undefined) {
                        return;
                    }
                    this.CLEANUP_PER_STAGE.get(stage)?.();
                    print(`Completed stage ${index} in ${quest.id}, now in stage ${newStage}`);

                    // Log analytics for quest progression
                    const player = Players.GetPlayers()[0];
                    if (player !== undefined)
                        AnalyticsService.LogOnboardingFunnelStepEvent(player, index + 1, "Quest " + quest.name);

                    // Handle quest completion or next stage
                    if (newStage === -1) {
                        quest.complete();
                    }
                    this.reachStages();
                });
            });
        }
        // Send quest info to clients
        Packets.questInfo.set(questInfos);
        this.reachStages();
    }

    /**
     * Initializes the QuestService.
     * Sets up waypoints and synchronizes quest data with clients.
     */
    onInit() {
        // Skip quest initialization in sandbox mode
        if (Sandbox.getEnabled())
            return;

        // Configure waypoint objects for quest navigation
        for (const waypoint of WAYPOINTS.GetChildren()) {
            if (!waypoint.IsA("BasePart"))
                continue;

            // Make waypoints invisible and non-interactive
            waypoint.Transparency = 1;
            waypoint.CanCollide = false;
            waypoint.CanTouch = false;
            waypoint.CanQuery = false;
        }

        this.loadQuests();
        this.levelService.levelChanged.connect(() => this.reachStages());
    }
}