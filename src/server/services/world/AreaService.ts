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

import { OnStart, Service } from "@flamework/core";
import DataService from "server/services/data/DataService";
import NamedUpgradeService from "server/services/data/NamedUpgradeService";
import LeaderstatsService from "server/services/leaderboard/LeaderstatsService";
import NamedUpgrades from "shared/namedupgrade/NamedUpgrades";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";

/** Grid size upgrades that affect area building grids */
const GRID_SIZE_UPGRADES = NamedUpgrades.getUpgrades("GridSize");

/**
 * This service orchestrates all area-related functionality in the game, from basic
 * player location tracking to complex systems like dynamic grid resizing, portal
 * teleportation, and droplet management.
 */
@Service()
export default class AreaService implements OnStart {
    /**
     * Maps area IDs to the number of droplets currently present in that area.
     */
    readonly DROPLET_COUNT_PER_AREA = new Map<AreaId, number>();

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

    onStart() {
        const onUpgradesChanged = (data: Map<string, number>) => {
            for (const [id, area] of pairs(AREAS)) {
                const gridWorldNode = area.gridWorldNode;
                if (gridWorldNode === undefined) continue;
                const grid = gridWorldNode?.getInstance();
                if (grid === undefined) continue;

                // Calculate the new grid size based on applied upgrades
                let size = gridWorldNode.originalSize;
                if (size === undefined) continue;
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
