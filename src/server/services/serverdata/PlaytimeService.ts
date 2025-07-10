//!native
//!optimize 2

/**
 * @fileoverview Player session and total playtime tracking system.
 * 
 * This service handles:
 * - Total playtime accumulation across all sessions
 * - Current session time tracking
 * - Longest session record keeping
 * - Real-time playtime updates to clients
 * - Persistent storage of playtime statistics
 * 
 * The service uses RunService.Heartbeat for accurate time tracking
 * and batches updates every second for performance optimization.
 * 
 * @since 1.0.0
 */

import { OnInit, Service } from "@flamework/core";
import { RunService } from "@rbxts/services";
import DataService from "server/services/serverdata/DataService";
import Packets from "shared/Packets";

/**
 * Service for tracking and managing player playtime statistics.
 * 
 * Monitors both current session duration and cumulative playtime across
 * all sessions, with automatic persistence and client synchronization.
 */
@Service()
export default class PlaytimeService implements OnInit {

    /**
     * Current session time in seconds.
     * Tracks how long the current play session has been active.
     */
    sessionTime = 0;

    /**
     * Initializes the PlaytimeService with data persistence.
     * 
     * @param dataService Service providing persistent empire data for playtime storage.
     */
    constructor(private dataService: DataService) {

    }

    // Playtime Management Methods

    /**
     * Gets the total accumulated playtime across all sessions.
     * 
     * @returns Total playtime in seconds.
     */
    getPlaytime() {
        return this.dataService.empireData.playtime;
    }

    /**
     * Sets the total accumulated playtime and updates clients.
     * 
     * @param value The new total playtime in seconds.
     */
    setPlaytime(value: number) {
        this.dataService.empireData.playtime = value;
        Packets.empirePlaytime.set(value);
    }

    // Service Lifecycle

    /**
     * Initializes the PlaytimeService and starts the time tracking system.
     * Sets up a heartbeat-based timer that updates playtime statistics every second.
     */
    onInit() {
        // Send initial longest session data to clients
        Packets.longestSessionTime.set(this.dataService.empireData.longestSession);

        // Start the playtime tracking system
        task.spawn(() => {
            let t = 0; // Time accumulator for batching updates

            // Use heartbeat for precise time tracking
            RunService.Heartbeat.Connect((dt) => {
                t += dt;

                // Update every second for performance optimization
                if (t > 1) {
                    // Update total playtime
                    const playtime = this.getPlaytime() + t;
                    this.setPlaytime(playtime);

                    // Update current session time
                    const st = this.sessionTime + t;
                    this.sessionTime = st;
                    Packets.sessionTime.set(st);

                    // Check and update longest session record
                    if (this.dataService.empireData.longestSession < st) {
                        this.dataService.empireData.longestSession = st;
                        Packets.longestSessionTime.set(st);
                    }

                    // Reset time accumulator
                    t = 0;
                }
            });
        });
    }
}