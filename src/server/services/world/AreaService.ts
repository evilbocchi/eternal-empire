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
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";

/**
 * This service orchestrates all area-related functionality in the game, from basic
 * player location tracking to complex systems like dynamic grid resizing, portal
 * teleportation, and droplet management.
 */
@Service()
export default class AreaService implements OnStart {
    constructor(private dataService: DataService) {}

    onStart() {
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
