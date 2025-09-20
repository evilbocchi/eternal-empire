//!native
//!optimize 2

/**
 * @fileoverviewspecific functionality.
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

import { getAllInstanceInfo, isInside } from "@antivivi/vrldk";
import { OnInit, OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import NamedUpgradeService from "server/services/data/NamedUpgradeService";
import LeaderstatsService from "server/services/leaderboard/LeaderstatsService";
import { OnPlayerJoined } from "server/services/ModdingService";
import { getSound, playSound } from "shared/asset/GameAssets";
import { MUSIC_GROUP } from "shared/constants";
import { DROPLET_STORAGE } from "shared/item/Droplet";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";
import Area, { AREAS } from "shared/world/Area";

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
export default class AreaService implements OnInit, OnStart, OnPlayerJoined {
    readonly ORIGINAL_SIZE_PER_AREA = new Map<AreaId, Vector3>();

    /**
     * Maps area IDs to the number of droplets currently present in that area.
     */
    readonly dropletCountPerArea = new Map<AreaId, number>();

    /**
     * Stores bounding box information for each area to enable efficient player position checks.
     * Maps area ID to a tuple of [CFrame, Vector3] representing the area's bounds.
     * This is populated during area loading and used for real-time player tracking.
     */
    readonly boundingBoxPerArea = new Map<AreaId, [CFrame, Vector3]>();

    constructor(
        private dataService: DataService,
        private leaderstatsService: LeaderstatsService,
        private namedUpgradeService: NamedUpgradeService,
    ) {}

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
        this.leaderstatsService.setLeaderstat(player, "Area", AREAS[id].name);
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
        const grid = area.gridWorldNode?.getInstance();
        if (grid !== undefined) {
            grid.CollisionGroup = "BuildGrid";
            this.ORIGINAL_SIZE_PER_AREA.set(id, grid.Size); // Store for upgrade scaling
        }

        // Set up area-specific music groups and sound management
        const areaBounds = area.areaBoundsWorldNode?.getInstance();
        if (areaBounds !== undefined) {
            // Create dedicated sound group for this area's audio
            const areaSoundGroup = new Instance("SoundGroup");
            areaSoundGroup.Name = id;
            areaSoundGroup.Volume = 1;
            areaSoundGroup.Parent = MUSIC_GROUP;

            // Helper function to configure individual sound objects
            const loadSound = (sound: Instance) => {
                if (!sound.IsA("Sound")) return;
                sound.SoundGroup = areaSoundGroup; // Assign to area's sound group
                sound.SetAttribute("OriginalVolume", sound.Volume); // Store original volume
            };

            // Process all sound objects in the area bounds
            areaBounds.GetChildren().forEach((group) => {
                group.Parent = areaSoundGroup;
                loadSound(group);
                // Process nested sound objects
                for (const child of group.GetChildren()) loadSound(child);
            });

            // Store bounding box for player tracking, then clean up the bounds object
            this.boundingBoxPerArea.set(id, [areaBounds.CFrame, areaBounds.Size]);
            areaBounds.Destroy();
        }

        // Initialize droplet systems
        this.loadDropletTracking(area);

        // Set up catch areas to prevent players from falling into the void
        const catchArea = area.catchAreaWorldNode?.getInstance();
        if (catchArea !== undefined) {
            catchArea.CanTouch = true;
            catchArea.Touched.Connect((o) => {
                const player = Players.GetPlayerFromCharacter(o.Parent);
                if (player === undefined || player.Character === undefined) return;

                const humanoid = player.Character.FindFirstChildOfClass("Humanoid");
                if (humanoid === undefined) return;

                const rootPart = humanoid.RootPart;
                if (rootPart === undefined) return;

                const spawnLocation = area.spawnLocationWorldNode?.getInstance();
                if (spawnLocation === undefined) {
                    // No safe spawn location - eliminate the player
                    humanoid.TakeDamage(999);
                    return;
                }

                // Teleport player back to safety with effects
                rootPart.CFrame = spawnLocation.CFrame;
                Packets.shakeCamera.toClient(player, "Bump"); // Visual feedback
                playSound("Splash.mp3", rootPart); // Audio feedback
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
     * @param area The area where the droplet count changed
     * @param newCount The new droplet count for the area
     */
    propagateDropletCountChange(area: Area, newCount: number) {
        this.dropletCountPerArea.set(area.id, newCount);

        // Prevent network spam during server initialization
        if (os.clock() < 10) {
            return;
        }

        // Broadcast the change to all connected clients
        Packets.dropletCountChanged.toAllClients(area.id, newCount, area.getDropletLimit());
    }

    /**
     * Initializes droplet tracking and management systems for a specific area.
     *
     * This method sets up real-time droplet counting, automatic synchronization,
     * and periodic recalibration to prevent desynchronization issues. It handles
     * both droplet creation and destruction events while maintaining accurate counts.
     *
     * @param area The Area object to set up droplet tracking for
     */
    loadDropletTracking(area: Area) {
        const id = area.id;
        const dropletCountPerArea = this.dropletCountPerArea;
        dropletCountPerArea.set(id, 0);

        // Monitor droplet creation and track them by area
        DROPLET_STORAGE.ChildAdded.Connect((d) => {
            const info = getAllInstanceInfo(d);

            // Only count non-incinerated droplets in this specific area
            if (info.Incinerated !== true && info.Area === id) {
                const newCurrent = dropletCountPerArea.get(id)! + 1;
                this.propagateDropletCountChange(area, newCurrent);
                dropletCountPerArea.set(id, newCurrent);

                // Set up cleanup tracking when the droplet is destroyed
                d.Destroying.Once(() => {
                    const newCurrent = dropletCountPerArea.get(id)! - 1;
                    this.propagateDropletCountChange(area, newCurrent);
                    dropletCountPerArea.set(id, newCurrent);
                });
            }
        });

        // Prevent desynchronization by periodically recounting all droplets
        const resynchronize = () => {
            // Check every 5 seconds
            let i = 0;

            // Manual recount of all droplets in this area
            for (const d of DROPLET_STORAGE.GetChildren()) {
                const info = getAllInstanceInfo(d);
                if (info.Incinerated !== true && info.Area === id) {
                    ++i;
                }
            }

            this.propagateDropletCountChange(area, i);
            task.delay(5, resynchronize);
        };
        task.spawn(resynchronize);
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
        const onCharacterAdded = (character: Model | undefined) => {
            if (character === undefined) return;

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
        player.CharacterAdded.Connect((character) => onCharacterAdded(character));
        onCharacterAdded(player.Character);

        // Continuously monitor player position to detect area changes
        const checkAreaChange = () => {
            task.delay(0.1, checkAreaChange);

            const character = player.Character;
            if (character === undefined) return;

            const rootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
            if (rootPart === undefined) return;

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
        };
        task.spawn(checkAreaChange);
    }

    onInit() {
        // Load all areas defined in the AREAS configuration
        for (const [id, area] of pairs(AREAS)) {
            this.loadArea(id, area);
        }
    }

    onStart() {
        const onUpgradesChanged = (data: Map<string, number>) => {
            for (const [id, area] of pairs(AREAS)) {
                const grid = area.gridWorldNode?.getInstance();
                if (grid === undefined) continue;

                // Get the original grid size as baseline
                let size = this.ORIGINAL_SIZE_PER_AREA.get(id);
                if (size === undefined) continue;

                // Apply all relevant grid size upgrades for this area
                GRID_SIZE_UPGRADES.forEach((upgrade, upgradeId) => {
                    if (upgrade.area === id) size = upgrade.apply(size!, data.get(upgradeId));
                });

                // Update the grid size if it has changed
                if (grid.Size !== size) {
                    grid.Size = size;
                }
            }
        };

        this.namedUpgradeService.upgradesChanged.connect(onUpgradesChanged);
        onUpgradesChanged(this.dataService.empireData.upgrades);

        Packets.tpToArea.fromClient((player, areaId) => {
            const character = player.Character;
            const area = AREAS[areaId];
            const spawnLocation = area.spawnLocationWorldNode?.getInstance();

            if (
                character === undefined ||
                !this.dataService.empireData.unlockedAreas.has(areaId) ||
                spawnLocation === undefined
            ) {
                return false;
            }

            character.PivotTo(spawnLocation.CFrame);
            return true;
        });
    }
}
