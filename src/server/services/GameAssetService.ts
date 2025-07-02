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
import { getInstanceInfo, playSoundAtPart } from "@antivivi/vrldk";
import { OnInit, OnPhysics, OnStart, Service } from "@flamework/core";
import { AnalyticsService, PathfindingService, Players, ReplicatedStorage, RunService, Workspace } from "@rbxts/services";
import Quest, { Stage } from "server/Quest";
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
 * Also provides the GameAPI API used throughout the game.
 */
@Service()
export class GameAssetService implements OnInit, OnStart, OnPhysics {

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

    constructor() {

    }

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


    onInit() {
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