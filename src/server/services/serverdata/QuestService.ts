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

import Signal from "@antivivi/lemon-signal";
import { OnInit, Service } from "@flamework/core";
import { AnalyticsService, Players, ReplicatedStorage } from "@rbxts/services";
import Quest, { Stage } from "server/Quest";
import DialogueService from "server/services/npc/DialogueService";
import ChatHookService from "server/services/permissions/ChatHookService";
import DataService from "server/services/serverdata/DataService";
import ItemService from "server/services/item/ItemService";
import LevelService from "server/services/serverdata/LevelService";
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

    /**
     * Signal fired when a quest stage is reached.
     * @param stage The quest stage that was reached.
     */
    readonly stageReached = new Signal<(stage: Stage) => void>();

    /**
     * Set of quest stages that have been loaded and initialized.
     */
    readonly loadedStages = new Set<Stage>();

    constructor(private readonly chatHookService: ChatHookService,
        private readonly dataService: DataService,
        private readonly levelService: LevelService,
        private readonly itemService: ItemService,
        private readonly dialogueService: DialogueService) {

    }

    /**
     * Checks if a quest is completed.
     * 
     * @param questId The quest ID.
     * @return True if the quest is completed, false otherwise.
     */
    isQuestCompleted(questId: string) {
        return this.dataService.empireData.quests.get(questId) === -1;
    }


    /**
     * Updates the quest stage data and synchronizes with clients.
     * 
     * @param quests Map of quest IDs to their current stage numbers.
     */
    setStagePerQuest(quests: Map<string, number>) {
        this.dataService.empireData.quests = quests;
        Packets.stagePerQuest.set(quests);
    }

    /**
     * Registers a callback for when a quest stage is reached.
     * 
     * @param stage The quest stage.
     * @param callback The function to call.
     */
    onStageReached(stage: Stage, callback: () => void) {
        return this.stageReached.connect((s) => {
            if (stage === s) {
                callback();
            }
        });
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
        this.setStagePerQuest(stagePerQuest);
        return n;
    }

    /**
     * Loads and initializes all available quests based on player level.
     * Sets up quest stages and handles progression tracking.
     * 
     * @param level The player level to check quest availability (defaults to current level).
     */
    loadAvailableQuests(level?: number) {
        if (level === undefined) {
            level = this.dataService.empireData.level;
        }
        const stagePerQuest = this.dataService.empireData.quests;
        if (stagePerQuest === undefined) {
            return;
        }

        // Process all available quests
        for (const [id, quest] of Quest.init()) {
            // Skip quests above player level
            if (quest.level > level) {
                continue;
            }

            const current = stagePerQuest.get(id) ?? 0;
            quest.loaded = true;

            // Initialize all quest stages
            quest.stages.forEach((stage, index) => {
                task.spawn(() => {
                    const reached = new Set<Stage>();

                    // Load stage if not already loaded
                    if (!this.loadedStages.has(stage)) {
                        const load = stage.load;
                        if (load !== undefined) {
                            this.loadedStages.add(stage);
                            const rem = load(stage);

                            // Set up stage completion handler
                            const connection = stage.completed.connect(() => {
                                const newStage = this.completeStage(quest, index);
                                if (newStage === undefined) {
                                    return;
                                }
                                rem();
                                print(`Completed stage ${index} in ${quest.id}, now in stage ${newStage}`);

                                // Log analytics for quest progression
                                const player = Players.GetPlayers()[0];
                                if (player !== undefined)
                                    AnalyticsService.LogOnboardingFunnelStepEvent(player, index + 1, "Quest " + quest.name);

                                // Handle quest completion or next stage
                                if (newStage === -1) {
                                    this.completeQuest(quest);
                                }
                                else {
                                    const nextStage = quest.stages[newStage];
                                    this.stageReached.fire(nextStage);
                                    reached.add(nextStage);
                                }

                                // Clean up
                                this.loadedStages.delete(stage);
                                connection.disconnect();
                            });
                        }
                    }

                    // Fire signal for current stage
                    if (current === index && !reached.has(stage)) {
                        print(`Reached stage ${index} in ${quest.id}`);
                        this.stageReached.fire(stage);
                    }
                });
            });

            // Handle already completed quests
            if (current === -1) {
                this.onQuestComplete(quest);
            }
        }
    }

    /**
     * Completes a quest and distributes rewards.
     * 
     * @param quest The quest to complete.
     */
    completeQuest(quest: Quest) {
        Packets.questCompleted.fireAll(quest.id);
        const reward = quest.reward;

        // Award experience points
        if (reward.xp !== undefined) {
            const originalXp = this.levelService.getXp();
            if (originalXp === undefined) {
                warn("No original xp, not rewarding");
            }
            else {
                this.levelService.setXp(originalXp + reward.xp);
            }
        }

        // Award items
        if (reward.items !== undefined) {
            for (const [item, amount] of reward.items) {
                this.itemService.setItemAmount(item, this.itemService.getItemAmount(item) + amount);
            }
        }

        this.onQuestComplete(quest);
    }

    /**
     * Handles quest completion logic and rewards.
     * 
     * @param quest The quest that was completed.
     */
    onQuestComplete(quest: Quest) {
        const completionDialogue = quest.completionDialogue;
        if (completionDialogue !== undefined && completionDialogue.npc !== undefined) {
            this.dialogueService.addDialogue(completionDialogue);
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

        // Load available quests and set up level change handler
        this.loadAvailableQuests();
        this.levelService.levelChanged.connect(() => this.loadAvailableQuests());

        const questInfos = new Map<string, QuestInfo>();

        // Process all quests and create client info
        Quest.init().forEach((quest, questId) => {
            quest.initialized.fire();

            const questInfo: QuestInfo = {
                name: quest.name ?? questId,
                colorR: quest.color.R,
                colorG: quest.color.G,
                colorB: quest.color.B,
                level: quest.level,
                length: quest.length,
                reward: quest.reward,
                order: quest.order,
                stages: [],
            };

            // Set up stage position tracking
            quest.stages.forEach((stage, index) => {
                const onPositionChanged = (position?: Vector3) => ReplicatedStorage.SetAttribute(`${questId}${index}`, position);
                onPositionChanged(stage.position);
                stage.positionChanged.connect((position) => onPositionChanged(position));
                questInfo.stages.push({ description: stage.description! });
            });

            questInfos.set(questId, questInfo);
        });

        // Send quest info to clients
        Packets.questInfo.set(questInfos);
        // Send quest progress to clients
        Packets.stagePerQuest.set(this.dataService.empireData.quests);
    }
}