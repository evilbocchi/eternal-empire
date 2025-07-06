//!native
//!optimize 2

/**
 * @fileoverview AreaService - Manages game areas, player movement, teleportation, and area-specific functionality.
 * 
 * This service handles all aspects of the game's area system including:
 * - Area loading and initialization (grids, bounds, music, portals)
 * - Player area tracking and movement detection
 * - Portal teleportation mechanics with debouncing
 * - Droplet counting and synchronization across areas
 * - Grid size upgrades and dynamic resizing
 * - Catch area mechanics for player safety/respawning
 * - Music system integration with area-specific sound groups
 * - Leaderstat updates for area display
 * 
 * The service integrates with multiple other systems including upgrades, music, 
 * droplet management, and player data to provide a seamless area experience.
 * 
 * @since 1.0.0
 */

import { getAllInstanceInfo, isInside, playSoundAtPart } from "@antivivi/vrldk";
import { OnInit, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import LeaderstatsService from "server/services/LeaderstatsService";
import { OnPlayerJoined } from "server/services/ModdingService";
import NPCNavigationService from "server/services/npc/NPCNavigationService";
import DataService from "server/services/serverdata/DataService";
import NamedUpgradeService from "server/services/serverdata/NamedUpgradeService";
import Area, { AREAS } from "shared/Area";
import { MUSIC_GROUP } from "shared/constants";
import { getSound } from "shared/asset/GameAssets";
import { DROPLET_STORAGE } from "shared/item/Droplet";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";

/** Grid size upgrades that affect area building grids */
const GRID_SIZE_UPGRADES = NamedUpgrades.getUpgrades("GridSize");

/** Parameters for area collision detection using player hitbox */
const AREA_CHECK_PARAMS = new OverlapParams();
AREA_CHECK_PARAMS.CollisionGroup = "PlayerHitbox";

/**
 * This service orchestrates all area-related functionality in the game, from basic
 * player location tracking to complex systems like dynamic grid resizing, portal
 * teleportation, and droplet management.
 */
@Service()
export default class AreaService implements OnInit, OnPlayerJoined {

    /**
     * Maps area IDs to the number of droplets currently present in that area.
     */
    dropletCountPerArea = new Map<AreaId, number>();

    /** 
     * Stores bounding box information for each area to enable efficient player position checks.
     * Maps area ID to a tuple of [CFrame, Vector3] representing the area's bounds.
     * This is populated during area loading and used for real-time player tracking.
     */
    boundingBoxPerArea = new Map<AreaId, [CFrame, Vector3]>();

    constructor(
        private dataService: DataService,
        private leaderstatsService: LeaderstatsService,
        private namedUpgradeService: NamedUpgradeService,
        private npcNavigationService: NPCNavigationService,
    ) { }

    /**
     * Retrieves the current area ID for a player.
     * 
     * @param player The player to get the area for
     * @returns The area ID where the player is currently located
     */
    getArea(player: Player): AreaId {
        return player.GetAttribute("Area") as AreaId;
    }

    /**
     * Sets a player's current area and updates their leaderstat display.
     * 
     * This method handles both the internal area tracking (via player attributes)
     * and the visual display (via leaderstats) to ensure consistency across
     * all area-related systems.
     * 
     * @param player The player to set the area for
     * @param id The area ID to assign to the player
     */
    setArea(player: Player, id: AreaId) {
        // Update the visible leaderstat with the area's display name
        this.leaderstatsService.setLeaderstat(player, "Area", AREAS[id].name);
        // Store the area ID as a player attribute for internal tracking
        player.SetAttribute("Area", id);
    }

    /**
     * Loads and initializes a complete area with all its sub-systems.
     * 
     * This is the core area initialization method that sets up all area-specific
     * functionality including grid systems, music integration, portal mechanics,
     * upgrade board connections, and safety systems. It's called during server
     * startup for each area in the game.
     * 
     * @param id The unique identifier for the area being loaded
     * @param area The Area object containing all area configuration and components
     */
    loadArea(id: AreaId, area: Area) {
        // Configure the building grid for this area, setting up collision groups
        // and preserving original size for upgrade calculations
        const grid = area.getGrid();
        if (grid !== undefined) {
            grid.CollisionGroup = "Item"; // Allow items to interact with the grid
            grid.SetAttribute("OriginalSize", grid.Size); // Store for upgrade scaling
        }

        // Set up area-specific music groups and sound management
        const areaBounds = area.getAreaBounds();
        if (areaBounds !== undefined) {
            // Create dedicated sound group for this area's audio
            const areaSoundGroup = new Instance("SoundGroup");
            areaSoundGroup.Name = id;
            areaSoundGroup.Volume = 1;
            areaSoundGroup.Parent = MUSIC_GROUP;

            // Helper function to configure individual sound objects
            const loadSound = (sound: Instance) => {
                if (!sound.IsA("Sound"))
                    return;
                sound.SoundGroup = areaSoundGroup; // Assign to area's sound group
                sound.SetAttribute("OriginalVolume", sound.Volume); // Store original volume
            };

            // Process all sound objects in the area bounds
            areaBounds.GetChildren().forEach((group) => {
                group.Parent = areaSoundGroup;
                loadSound(group);
                // Process nested sound objects
                for (const child of group.GetChildren())
                    loadSound(child);
            });

            // Store bounding box for player tracking, then clean up the bounds object
            this.boundingBoxPerArea.set(id, [areaBounds.CFrame, areaBounds.Size]);
            areaBounds.Destroy();
        }

        // Initialize the area's board GUI and droplet systems
        this.loadBoardGui(id, area);

        // Connect to upgrade changes to dynamically resize the building grid
        this.namedUpgradeService.upgradesChanged.connect((data) => {
            if (grid === undefined)
                return;

            // Get the original grid size as baseline
            let size = grid.GetAttribute("OriginalSize") as Vector3 | undefined;
            if (size === undefined) {
                return;
            }

            // Apply all relevant grid size upgrades for this area
            GRID_SIZE_UPGRADES.forEach((upgrade, upgradeId) => {
                if (upgrade.area === id)
                    size = upgrade.apply(size!, data.get(upgradeId));
            });

            // Update the grid size if it has changed
            if (grid.Size !== size) {
                grid.Size = size;
            }
        });

        // Trigger initial upgrade application (hacky but functional)
        this.namedUpgradeService.upgradesChanged.fire(this.dataService.empireData.upgrades);

        // Configure all portals in this area for teleportation mechanics
        const instances = area.areaFolder.GetChildren();
        for (const instance of instances) {
            if (instance.Name === "Portal") {
                const frame = instance.WaitForChild("Frame") as BasePart;
                const originalPos = frame.Position;
                let debounce = 0; // Prevent rapid teleportation spam

                // Helper function to show/hide portal based on unlock status
                const updatePosition = (unlocked: boolean) =>
                    frame.Position = unlocked ? originalPos : new Vector3(0, -1000, 0);

                // Get unlock status and set initial position
                const unlocked = AREAS[(instance.WaitForChild("Destination") as ObjectValue).Value!.Name as AreaId].unlocked;
                updatePosition(unlocked.Value);

                // React to unlock status changes
                unlocked.Changed.Connect((value) => updatePosition(value));

                // Handle portal teleportation when touched
                frame.Touched.Connect((otherPart) => {
                    const character = otherPart.Parent as Model;
                    if (character === undefined)
                        return;

                    const player = Players.GetPlayerFromCharacter(character);
                    if (player === undefined)
                        return;

                    const humanoid = character.FindFirstChildOfClass("Humanoid");
                    if (humanoid === undefined)
                        return;

                    const rootPart = humanoid.RootPart;
                    // Debounce check to prevent spam teleportation
                    if (rootPart === undefined || tick() - debounce < 0.2) {
                        return;
                    }

                    // Play teleportation sound effect
                    (rootPart.FindFirstChild("TeleportSound") as Sound | undefined)?.Play();

                    // Execute the teleportation
                    character.PivotTo((instance.WaitForChild("TpPart") as BasePart).CFrame);
                    debounce = tick();

                    // Mark player as having used a portal (for tracking/achievements)
                    player.SetAttribute("UsedPortal", true);
                });
            }
        }

        // Set up catch areas to prevent players from falling into the void
        const catchArea = area.getCatchArea();
        if (catchArea !== undefined) {
            catchArea.CanTouch = true;
            catchArea.Touched.Connect((o) => {
                const player = Players.GetPlayerFromCharacter(o.Parent);
                if (player === undefined || player.Character === undefined)
                    return;

                const humanoid = player.Character.FindFirstChildOfClass("Humanoid");
                if (humanoid === undefined)
                    return;

                const rootPart = humanoid.RootPart;
                if (rootPart === undefined)
                    return;

                const spawnLocation = area.getSpawnLocation();
                if (spawnLocation === undefined) {
                    // No safe spawn location - eliminate the player
                    humanoid.TakeDamage(999);
                    return;
                }

                // Teleport player back to safety with effects
                rootPart.CFrame = spawnLocation.CFrame;
                Packets.camShake.fire(player); // Visual feedback
                playSoundAtPart(rootPart, getSound("Splash.mp3")); // Audio feedback
            });
        }
    }

    /**
     * Propagates droplet count changes to all clients and updates internal tracking.
     * 
     * This method ensures that all players receive real-time updates about droplet
     * counts in each area, which is crucial for UI display and area limit enforcement.
     * It includes a safety check to prevent unnecessary network traffic during server startup.
     * 
     * @param id The area ID where the droplet count changed
     * @param newCount The new droplet count for the area
     */
    propagateDropletCountChange(id: AreaId, newCount: number) {
        this.dropletCountPerArea.set(id, newCount);

        // Prevent network spam during server initialization
        if (os.clock() < 6) { // don't propagate changes too early after server start
            return;
        }

        // Broadcast the change to all connected clients
        Packets.dropletCountChanged.fireAll(id, newCount);
    }

    /**
     * Initializes droplet tracking and management systems for a specific area.
     * 
     * This method sets up real-time droplet counting, automatic synchronization,
     * and periodic recalibration to prevent desynchronization issues. It handles
     * both droplet creation and destruction events while maintaining accurate counts.
     * 
     * @param id The area ID to set up droplet tracking for
     * @param area The Area object containing droplet limit configuration
     */
    loadBoardGui(id: AreaId, area: Area) {
        const dropletCountPerArea = this.dropletCountPerArea;

        // Initialize droplet count for this area
        dropletCountPerArea.set(id, 0);

        // React to droplet limit changes in the area configuration
        area.dropletLimit.Changed.Connect(() =>
            this.propagateDropletCountChange(id, dropletCountPerArea.get(id)!)
        );

        // Monitor droplet creation and track them by area
        DROPLET_STORAGE.ChildAdded.Connect((d) => {
            const info = getAllInstanceInfo(d);

            // Only count non-incinerated droplets in this specific area
            if (info.Incinerated !== true && info.Area === id) {
                const newCurrent = dropletCountPerArea.get(id)! + 1;
                this.propagateDropletCountChange(id, newCurrent);
                dropletCountPerArea.set(id, newCurrent);

                // Set up cleanup tracking when the droplet is destroyed
                d.Destroying.Once(() => {
                    const newCurrent = dropletCountPerArea.get(id)! - 1;
                    this.propagateDropletCountChange(id, newCurrent);
                    dropletCountPerArea.set(id, newCurrent);
                });
            }
        });

        // Prevent desynchronization by periodically recounting all droplets
        task.spawn(() => {
            while (task.wait(5)) { // Check every 5 seconds
                let i = 0;

                // Manual recount of all droplets in this area
                for (const d of DROPLET_STORAGE.GetChildren()) {
                    const info = getAllInstanceInfo(d);
                    if (info.Incinerated !== true && info.Area === id) {
                        ++i;
                    }
                }

                // Update the count with the recalibrated value
                this.propagateDropletCountChange(id, i);
            }
        });
    }

    /**
     * Handles player joining events and sets up area tracking systems.
     * 
     * This method initializes all player-specific area functionality including
     * character collision group setup, teleportation sound preparation, and
     * real-time position tracking for area detection. It ensures that players
     * are properly integrated into the area system from the moment they join.
     * 
     * @param player The player who just joined the game
     */
    onPlayerJoined(player: Player) {
        /**
         * Sets up character-specific area functionality when a player spawns.
         * 
         * @param character - The player's character model (may be undefined)
         */
        const onCharacterAdded = (character: Model | undefined) => {
            if (character === undefined)
                return;

            const rootPart = character.WaitForChild("HumanoidRootPart") as BasePart;

            // Configure collision groups for proper interaction with area systems
            for (const part of character.GetChildren()) {
                if (part.IsA("BasePart")) {
                    // Root part uses PlayerHitbox for area detection, other parts use Player group
                    part.CollisionGroup = part === rootPart ? "PlayerHitbox" : "Player";
                }
            }

            // Clone teleportation sound to the character for portal usage
            getSound("Teleport.mp3").Clone().Parent = rootPart;
        };

        // Set up character handling for current and future character spawns
        player.CharacterAdded.Connect((character) => onCharacterAdded(character));
        onCharacterAdded(player.Character);

        // Continuously monitor player position to detect area changes
        task.spawn(() => {
            while (task.wait(0.1)) { // Check every 100ms for responsive area detection
                const character = player.Character;
                if (character === undefined)
                    continue;

                const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
                if (rootPart === undefined)
                    continue;

                const position = rootPart.Position;

                // Check against all area bounding boxes to find current area
                for (const [id, [cframe, size]] of this.boundingBoxPerArea) {
                    if (isInside(position, cframe, size)) {
                        const cached = this.getArea(player);

                        // Only update if the area has actually changed
                        if (cached !== id) {
                            this.setArea(player, id);
                        }
                        break; // Found the area, no need to check others
                    }
                }
            }
        });
    }

    /**
     * Initializes the AreaService and sets up all game areas and teleportation systems.
     * 
     * This method is called during server startup and handles:
     * - Loading and initializing all areas in the game
     * - Setting up the area teleportation packet handler
     * - Configuring safety checks for teleportation requests
     */
    onInit() {
        // Load all areas defined in the AREAS configuration
        for (const [id, area] of pairs(AREAS)) {
            this.loadArea(id, area);
        }

        // Handle client requests for area teleportation
        Packets.tpToArea.onInvoke((player, areaId) => {
            const character = player.Character;
            const area = AREAS[areaId];
            const spawnLocation = area.getSpawnLocation();

            // Validate teleportation request with multiple safety checks
            if (character === undefined ||
                area.unlocked.Value === false ||
                spawnLocation === undefined) {
                return false; // Teleportation denied
            }

            // Execute the teleportation
            character.PivotTo(spawnLocation.CFrame);
            return true; // Teleportation successful
        });
    }
}