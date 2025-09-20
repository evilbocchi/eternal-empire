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

import { getAllInstanceInfo } from "@antivivi/vrldk";
import { OnInit, OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import NamedUpgradeService from "server/services/data/NamedUpgradeService";
import LeaderstatsService from "server/services/leaderboard/LeaderstatsService";
import { playSound } from "shared/asset/GameAssets";
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
export default class AreaService implements OnInit, OnStart {
    /**
     * Maps area IDs to the number of droplets currently present in that area.
     */
    readonly dropletCountPerArea = new Map<AreaId, number>();

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
        // Initialize droplet systems
        this.loadDropletTracking(area);
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

    onInit() {
        // Load all areas defined in the AREAS configuration
        for (const [id, area] of pairs(AREAS)) {
            this.loadArea(id, area);
        }
    }

    onStart() {
        const onUpgradesChanged = (data: Map<string, number>) => {
            for (const [id, area] of pairs(AREAS)) {
                const gridWorldNode = area.gridWorldNode;
                if (gridWorldNode === undefined) continue;
                const grid = gridWorldNode?.getInstance();
                if (grid === undefined) continue;

                // Calculate the new grid size based on applied upgrades
                let size = gridWorldNode.originalSize;
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
