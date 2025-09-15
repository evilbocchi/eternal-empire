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

import { OnInit, Service } from "@flamework/core";
import DataService from "server/services/data/DataService";
import { AREAS } from "shared/world/Area";
import Packets from "shared/Packets";

/**
 * Service that manages unlocked areas for the current empire.
 */
@Service()
export default class UnlockedAreasService implements OnInit {
    constructor(private dataService: DataService) {}

    /**
     * Checks if a given area is unlocked.
     * @param area The area ID to check.
     */
    isAreaUnlocked(area: AreaId) {
        const areas = this.dataService.empireData.unlockedAreas;
        return areas.has(area);
    }

    /**
     * Unlocks a given area, updates state, and notifies clients.
     * @param area The area ID to unlock.
     */
    unlockArea(area: AreaId) {
        const areas = this.dataService.empireData.unlockedAreas;
        areas.add(area);
        AREAS[area].unlocked.Value = true;
        Packets.areaUnlocked.toAllClients(area);
        return true;
    }

    /**
     * Locks a given area, updates state, and disables it in the world.
     * @param area The area ID to lock.
     */
    lockArea(area: AreaId) {
        const areas = this.dataService.empireData.unlockedAreas;
        areas.delete(area);
        this.dataService.empireData.unlockedAreas = areas;
        AREAS[area].unlocked.Value = false;
        return true;
    }

    /**
     * Initializes the service, synchronizing unlocked area states with the world.
     */
    onInit() {
        const unlockedAreas = this.dataService.empireData.unlockedAreas;
        for (const [id, area] of pairs(AREAS)) {
            area.unlocked.Value = unlockedAreas.has(id);
        }
    }
}
