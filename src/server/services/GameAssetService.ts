//!optimize 2
//!native

/**
 * @fileoverview GameAssetService - Central coordination service for game systems.
 * 
 * This is the main orchestrator service that handles:
 * - Physics collision group setup and management
 * - Quest system coordination and stage tracking
 * - NPC pathfinding and navigation
 * - Product purchase handling (Robux transactions)
 * - Game utility API for items and other systems
 * - Physics speed adjustments and gravity scaling
 * - Interactable object management
 * - Service integration and coordination
 * 
 * The service acts as a central hub that connects multiple game systems
 * and provides utilities for items, quests, and other game mechanics.
 * 
 * @since 1.0.0
 */

import Signal from "@antivivi/lemon-signal";
import { getInstanceInfo, getRootPart, playSoundAtPart } from "@antivivi/vrldk";
import { OnInit, OnPhysics, OnStart, Service } from "@flamework/core";
import { AnalyticsService, PathfindingService, Players, ProximityPromptService, ReplicatedStorage, RunService, TweenService, Workspace } from "@rbxts/services";
import Quest, { Stage } from "server/Quest";
import { DarkMatterService } from "server/services/boosts/DarkMatterService";
import { DialogueService } from "server/services/npc/DialogueService";
import { ResetService } from "server/services/ResetService";
import { RevenueService } from "server/services/RevenueService";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { EventService } from "server/services/serverdata/EventService";
import { ItemsService } from "server/services/serverdata/ItemsService";
import { LevelService } from "server/services/serverdata/LevelService";
import { PlaytimeService } from "server/services/serverdata/PlaytimeService";
import { QuestsService } from "server/services/serverdata/QuestsService";
import { SetupService } from "server/services/serverdata/SetupService";
import { UnlockedAreasService } from "server/services/serverdata/UnlockedAreasService";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import { getNPCPosition, getWaypoint, PLACED_ITEMS_FOLDER } from "shared/constants";
import { getSound } from "shared/GameAssets";
import GameSpeed from "shared/GameSpeed";
import InteractableObject from "shared/InteractableObject";
import ItemUtils from "shared/item/ItemUtils";
import Items from "shared/items/Items";
import NPC, { Dialogue, NPCAnimationType } from "shared/NPC";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";

declare global {
    /** Function type for handling product purchases. */
    type ProductFunction = (receiptInfo: ReceiptInfo, player: Player) => Enum.ProductPurchaseDecision;
}


/** Previous game speed value for change detection. */
let oldSpeed = 1;

/**
 * Central coordination service that manages core game systems and provides utilities.
 * 
 * Acts as the main orchestrator for quest management, physics interactions,
 * NPC pathfinding, product purchases, and inter-service communication.
 * Also provides the GameUtils API used throughout the game.
 */
@Service()
export class GameAssetService implements OnInit, OnStart, OnPhysics {

    // Event Signals

    /**
     * Signal fired when a quest stage is reached.
     * @param stage The quest stage that was reached.
     */
    stageReached = new Signal<(stage: Stage) => void>();

    /**
     * Signal fired when quest items are given to the player.
     * @param itemId The ID of the item that was given.
     * @param amount The amount of the item that was given.
     */
    questItemGiven = new Signal<(itemId: string, amount: number) => void>();

    /**
     * Signal fired when quest items are taken from the player.
     * @param itemId The ID of the item that was taken.
     * @param amount The amount of the item that was taken.
     */
    questItemTaken = new Signal<(itemId: string, amount: number) => void>();

    // State Management

    /**
     * Set of quest stages that have been loaded and initialized.
     */
    loadedStages = new Set<Stage>();

    /**
     * Map of active pathfinding operations for NPCs.
     */
    runningPathfinds = new Map<Humanoid, RBXScriptConnection>();

    /**
     * Whether the service is in rendering mode.
     */
    isRendering = false;

    // Pathfinding Configuration

    /**
     * Material costs for pathfinding calculations.
     * Higher costs make NPCs avoid certain materials.
     */
    readonly PATHFINDING_COSTS = {
        Water: 20,
        SmoothPlastic: 10,
        Wood: 10,
        Plastic: 2
    };

    /**
     * Default parameters for NPC pathfinding operations.
     */
    readonly PATHFINDING_PARAMS = {
        Costs: this.PATHFINDING_COSTS,
        WaypointSpacing: 6
    };

    constructor(private dataService: DataService,
        private itemsService: ItemsService,
        private currencyService: CurrencyService,
        private upgradeBoardService: UpgradeBoardService,
        private questsService: QuestsService,
        private levelService: LevelService,
        private unlockedAreasService: UnlockedAreasService,
        private revenueService: RevenueService,
        private dialogueService: DialogueService,
        private eventService: EventService,
        private setupService: SetupService,
        private resetService: ResetService,
        private playtimeService: PlaytimeService) {

    }

    // NPC Pathfinding Methods

    /**
     * Makes an NPC navigate to a specific position using Roblox pathfinding.
     * Handles waypoint following, jump actions, and failure recovery.
     * 
     * @param humanoid The NPC's humanoid to move.
     * @param position The target position to navigate to.
     * @param endCallback Function called when navigation completes.
     * @param params Pathfinding parameters (defaults to PATHFINDING_PARAMS).
     * @param iterations Number of retry attempts remaining.
     * @returns Connection object for the pathfinding operation.
     */
    pathfind(humanoid: Humanoid, position: Vector3, endCallback: () => unknown, params: AgentParameters = this.PATHFINDING_PARAMS, iterations?: number) {
        if (iterations !== undefined && iterations <= 0) {
            return;
        }
        const rootPart = humanoid.RootPart!;
        params.Costs = this.PATHFINDING_COSTS;
        const path = PathfindingService.CreatePath(params);
        path.ComputeAsync(rootPart.Position, position);
        const waypoints = path.GetWaypoints();
        let i = 0;
        let newPos: Vector3 | undefined;

        const doNextWaypoint = () => {
            ++i;
            const nextWaypoint = waypoints[i];
            if (nextWaypoint !== undefined) {
                // Handle jump waypoints
                if (nextWaypoint.Action === Enum.PathWaypointAction.Jump) {
                    humanoid.Jump = true;
                    playSoundAtPart(rootPart, getSound("Jump"));
                }
                newPos = nextWaypoint.Position;
                humanoid.MoveTo(newPos);
            }
            else {
                // Navigation complete
                connection.Disconnect();
                endCallback();
            }
        };

        let t = 0;
        const connection = RunService.Heartbeat.Connect((dt) => {
            if (newPos === undefined)
                return;
            t += dt;
            const dist = rootPart.Position.sub(newPos).mul(new Vector3(1, 0, 1)).Magnitude;

            // Check if close enough to waypoint
            if (dist < humanoid.WalkSpeed * 0.1875) { // allow more leeway for higher speeds
                t = 0;
                newPos = undefined;
                doNextWaypoint();
            }
            // Teleport if stuck for too long
            else if (t > 0.35 * dist) {
                t = 0;
                rootPart.CFrame = new CFrame(newPos);
            }
        });

        // Retry with adjusted position if no path found
        if (waypoints.isEmpty()) {
            warn("No path found");
            this.pathfind(humanoid, position.add(new Vector3(0, 1, 0)), endCallback, params, iterations === undefined ? 2 : iterations - 1);
            return;
        }

        doNextWaypoint();
        return connection;
    }

    // Quest Management Methods

    /**
     * Handles quest completion logic and rewards.
     * 
     * @param quest The quest that was completed.
     */
    onQuestComplete(quest: Quest) {
        const completionDialogue = quest.completionDialogue;
        if (completionDialogue !== undefined && completionDialogue.npc !== undefined) {
            this.dialogueService.addDialogue(completionDialogue.npc, completionDialogue);
        }
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
                                const newStage = this.questsService.completeStage(quest, index);
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
                this.itemsService.setItemAmount(item, this.itemsService.getItemAmount(item) + amount);
            }
        }

        this.onQuestComplete(quest);
    }


    // Lifecycle Methods

    /**
     * Handles physics updates, particularly game speed changes.
     * Updates gravity and notifies items when speed changes.
     */
    onPhysics() {
        if (GameSpeed.speed !== oldSpeed) {
            oldSpeed = GameSpeed.speed;
            Workspace.Gravity = 196.2 * oldSpeed;
            print("Changed gravity");

            // Update all placed items with new speed
            for (const model of PLACED_ITEMS_FOLDER.GetChildren()) {
                getInstanceInfo(model, "UpdateSpeed")?.();
            }
        }
    }

    /**
     * Initializes the GameAssetService.
     * Sets up interaction handlers, quest system, and product purchase processing.
     */
    onInit() {
        // Initialize quest system (skip in sandbox mode)
        if (!Sandbox.getEnabled()) {
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
                    stages: new Array()
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

            // Load available quests and set up level change handler
            this.loadAvailableQuests();
            this.levelService.levelChanged.connect(() => this.loadAvailableQuests());
        }
    }

    /**
     * Starts the GameAssetService.
     * Performs initial pathfinding setup and validation.
     */
    onStart() {
        // Skip pathfinding setup in sandbox mode
        if (Sandbox.getEnabled())
            return;

        // Test pathfinding functionality
        const path = PathfindingService.CreatePath();
        path.ComputeAsync(getNPCPosition("Freddy")!, getWaypoint("AHelpingHand2").Position); // load it
        if (path.GetWaypoints().isEmpty()) {
            warn("Pathfinding is not working.");
        }
    }
}