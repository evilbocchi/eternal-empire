//!optimize 2
//!native

/**
 * @fileoverviewg, navigation, and game speed effects.
 *
 * This service manages:
 * - NPC pathfinding and movement using Roblox's PathfindingService
 * - Waypoint following, jump actions, and stuck recovery
 * - Gravity and speed adjustments based on game speed
 * - Notifying placed items of speed changes
 *
 * @since 1.0.0
 */

import { getInstanceInfo, getRootPart, playSoundAtPart } from "@antivivi/vrldk";
import { OnInit, OnPhysics, OnStart, Service } from "@flamework/core";
import { PathfindingService, Players, RunService, TweenService, Workspace } from "@rbxts/services";
import { getNPCPosition, getWaypoint, PLACED_ITEMS_FOLDER } from "shared/constants";
import { getSound } from "shared/asset/GameAssets";
import GameSpeed from "shared/GameSpeed";
import Sandbox from "shared/Sandbox";

declare global {
    /** Function type for handling product purchases. */
    type ProductFunction = (receiptInfo: ReceiptInfo, player: Player) => Enum.ProductPurchaseDecision;
}

/** Previous game speed value for change detection. */
let oldSpeed = 1;

/**
 * Service that manages NPC pathfinding, navigation, and speed effects.
 */
@Service()
export default class NPCNavigationService implements OnInit, OnStart, OnPhysics {

    /** Map of active pathfinding operations for NPCs. */
    runningPathfinds = new Map<Humanoid, RBXScriptConnection>();

    /** Whether the service is in rendering mode. */
    isRendering = false;

    // Pathfinding Configuration

    /** Material costs for pathfinding calculations. Higher costs make NPCs avoid certain materials. */
    readonly PATHFINDING_COSTS = {
        Water: 20,
        SmoothPlastic: 10,
        Wood: 10,
        Plastic: 2
    };

    /** Default parameters for NPC pathfinding operations. */
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
    pathfind(
        humanoid: Humanoid,
        position: Vector3,
        endCallback: () => unknown,
        params: AgentParameters = this.PATHFINDING_PARAMS,
        iterations?: number
    ) {
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
                    playSoundAtPart(rootPart, getSound("Jump.mp3"));
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

    /**
     * Guides an NPC humanoid to a point, optionally requiring a player.
     * 
     * @param npcHumanoid The humanoid instance.
     * @param point The target CFrame.
     * @param callback Called when reached.
     * @param requiresPlayer If true, waits for player proximity.
     * @param agentParams Optional pathfinding parameters.
     */
    leadToPoint(
        npcHumanoid: Instance,
        point: CFrame,
        callback: () => unknown,
        requiresPlayer?: boolean,
        agentParams?: AgentParameters
    ) {
        if (!npcHumanoid.IsA("Humanoid"))
            throw npcHumanoid.Name + " is not a Humanoid";
        const cached = this.runningPathfinds.get(npcHumanoid);
        if (cached !== undefined)
            cached.Disconnect();
        npcHumanoid.RootPart!.Anchored = false;
        const tween = TweenService.Create(npcHumanoid.RootPart!, new TweenInfo(1), { CFrame: point });
        let toCall = false;
        this.pathfind(npcHumanoid, point.Position, () => {
            tween.Play();
            if (requiresPlayer === false) {
                toCall = true;
            }
        }, agentParams);
        const connection = RunService.Heartbeat.Connect(() => {
            const players = Players.GetPlayers();
            for (const player of players) {
                const playerRootPart = getRootPart(player);
                if (playerRootPart === undefined)
                    continue;
                if (point.Position.sub(playerRootPart.Position).Magnitude < 10) {
                    tween.Play();
                    toCall = true;
                    connection.Disconnect();
                    return;
                }
            }
        });
        task.spawn(() => {
            while (!toCall) {
                RunService.Heartbeat.Wait();
            }
            print("Reached point", npcHumanoid.Name, point.Position);
            if (callback !== undefined) {
                callback();
            }
        });
        this.runningPathfinds.set(npcHumanoid, connection);
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

    /**
     * Initializes the NPCNavigationService.
     */
    onInit() {
    }

    /**
     * Starts the NPCNavigationService.
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