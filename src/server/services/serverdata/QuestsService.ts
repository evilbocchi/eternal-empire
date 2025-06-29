//!native
//!optimize 2

/**
 * @fileoverview QuestsService - Quest progression and stage management system.
 * 
 * This service handles:
 * - Quest stage progression tracking
 * - Quest completion validation
 * - Quest data persistence and synchronization
 * - Waypoint management for quest navigation
 * - Integration with the sandbox mode
 * 
 * Quest stages are tracked as numbers:
 * - 0 to N-1: Active stages (where N is the total number of stages)
 * - -1: Quest completed
 * 
 * The service ensures proper stage progression order and prevents skipping.
 * 
 * @since 1.0.0
 */

import { OnInit, Service } from "@flamework/core";
import Quest from "server/Quest";
import { DataService } from "server/services/serverdata/DataService";
import { WAYPOINTS } from "shared/constants";
import Sandbox from "shared/Sandbox";
import Packets from "shared/Packets";

/**
 * Service for managing quest progression and stage tracking.
 * 
 * Handles the complete quest system including stage advancement,
 * completion validation, and waypoint management for navigation.
 */
@Service()
export class QuestsService implements OnInit {

    /**
     * Initializes the QuestsService with data persistence.
     * 
     * @param dataService Service providing persistent empire data for quest storage.
     */
    constructor(private dataService: DataService) {

    }

    // Quest Management Methods

    /**
     * Updates the quest stage data and synchronizes with clients.
     * 
     * @param quests Map of quest IDs to their current stage numbers.
     */
    setStagePerQuest(quests: Map<string, number>) {
        this.dataService.empireData.quests = quests;
        Packets.quests.set(quests);
    }

    /**
     * Advances a quest to the next stage with validation.
     * Ensures stages are completed in order and handles quest completion.
     * 
     * @param quest The quest object to advance.
     * @param current The current stage number that should be completed.
     * @returns The new stage number, or undefined if advancement failed.
     *          Returns -1 if the quest is now completed.
     */
    completeStage(quest: Quest, current: number) {
        const stagePerQuest = this.dataService.empireData.quests;
        const currentStage = stagePerQuest.get(quest.id);

        // Skip if quest is already completed
        if (currentStage === -1) {
            return;
        }

        const stageSize = quest.stages.size();
        const newStage = (currentStage ?? 0) + 1;

        // Validate stage progression order
        if (newStage !== current + 1) {
            return;
        }

        // Determine next stage or completion
        const n = newStage > stageSize - 1 ? -1 : newStage;
        stagePerQuest.set(quest.id, n);
        this.setStagePerQuest(stagePerQuest);
        return n;
    }

    // Service Lifecycle

    /**
     * Initializes the QuestsService.
     * Sets up waypoints and synchronizes quest data with clients.
     */
    onInit() {
        // Skip waypoint setup in sandbox mode
        if (Sandbox.getEnabled())
            return;

        // Configure waypoint objects for quest navigation
        for (const waypoint of WAYPOINTS.GetChildren()) {
            if (!waypoint.IsA("BasePart"))
                continue;

            // Make waypoints invisible and non-interactive
            waypoint.Transparency = 1;
            waypoint.CanCollide = false;
            waypoint.CanTouch = false;
            waypoint.CanQuery = false;
        }

        // Send initial quest data to clients
        Packets.quests.set(this.dataService.empireData.quests);
    }
}