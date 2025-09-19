//!native
//!optimize 2

/**
 * @fileoverview Manages unlocking and locking of game areas for the current empire.
 *
 * This service provides:
 * - Checking if an area is unlocked
 * - Unlocking and locking areas
 * - Synchronizing area unlock state with the client and game world
 *
 * @since 1.0.0
 */

import { OnStart, Service } from "@flamework/core";
import DataService from "server/services/data/DataService";
import Packets from "shared/Packets";

/**
 * Service that manages unlocked areas for the current empire.
 */
@Service()
export default class UnlockedAreasService implements OnStart {
    private readonly UNLOCKED_AREAS: Set<AreaId>;

    constructor(private dataService: DataService) {
        this.UNLOCKED_AREAS = this.dataService.empireData.unlockedAreas;
    }

    /**
     * Unlocks a given area, updates state, and notifies clients.
     * @param area The area ID to unlock.
     */
    unlockArea(area: AreaId) {
        const areas = this.UNLOCKED_AREAS;
        areas.add(area);
        Packets.unlockedAreas.set(areas);
        Packets.areaUnlocked.toAllClients(area);
        return true;
    }

    /**
     * Locks a given area, updates state, and disables it in the world.
     * @param area The area ID to lock.
     */
    lockArea(area: AreaId) {
        const areas = this.UNLOCKED_AREAS;
        areas.delete(area);
        Packets.unlockedAreas.set(areas);
        return true;
    }

    onStart() {
        Packets.unlockedAreas.set(this.UNLOCKED_AREAS);
    }
}
