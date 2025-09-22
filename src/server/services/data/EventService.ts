//!native
//!optimize 2

/**
 * @fileoverview Event completion tracking system.
 *
 * This service handles:
 * - Tracking completion status of game events
 * - Providing signals for event completion changes
 * - Managing event completion listeners
 * - Persistent storage of completed events
 *
 * Events are typically used for:
 * - Tutorial progress tracking
 * - Achievement unlocking
 * - Feature gating based on progress
 * - One-time migrations and fixes
 *
 * @since 1.0.0
 */

import Signal from "@antivivi/lemon-signal";
import { Service } from "@flamework/core";
import DataService from "server/services/data/DataService";
import eat from "shared/hamster/eat";

/**
 * Service for tracking and managing completion status of game events.
 *
 * Events are persistent flags used throughout the game to track progress,
 * achievements, tutorial completion, and other one-time occurrences.
 * The service provides both immediate status checking and reactive listening.
 */
@Service()
export default class EventService {
    /**
     * Signal fired when an event's completion status changes.
     * @param event The name of the event that changed.
     * @param isCompleted The new completion status of the event.
     */
    eventCompleted = new Signal<(event: string, isCompleted: boolean) => void>();

    /**
     * Initializes the EventService with data persistence.
     *
     * @param dataService Service providing persistent empire data for event storage.
     */
    constructor(private dataService: DataService) {}

    // Event Management Methods

    /**
     * Sets the completion status of an event and notifies listeners.
     *
     * @param event The name of the event to modify.
     * @param isCompleted Whether the event should be marked as completed.
     * @returns Whether the operation was successful (false if trying to remove non-existent event).
     */
    setEventCompleted(event: string, isCompleted: boolean) {
        const completedEvents = this.dataService.empireData.completedEvents;
        let success = true;

        // Add or remove event from completed set
        if (isCompleted === true) completedEvents.add(event);
        else success = completedEvents.delete(event);

        // Notify listeners if the operation was successful
        if (success === true) this.eventCompleted.fire(event, isCompleted);
        return success;
    }

    /**
     * Checks if a specific event has been completed.
     *
     * @param event The name of the event to check.
     * @returns True if the event has been completed, false otherwise.
     */
    isEventCompleted(event: string) {
        return this.dataService.empireData.completedEvents.has(event) === true;
    }

    /**
     * Adds a listener for completion status changes of a specific event.
     * If the event is already completed, the callback is immediately invoked.
     *
     * @param event The name of the event to listen for.
     * @param callback Function to call when the event's status changes.
     * @returns Connection object that can be used to disconnect the listener.
     */
    addCompletionListener(event: string, callback: (isCompleted: boolean) => void) {
        // Immediately notify if event is already completed
        if (this.isEventCompleted(event)) callback(true);

        // Set up listener for future changes
        const connection = this.eventCompleted.connect((e, isCompleted) => {
            if (event === e) callback(isCompleted);
        });
        eat(connection, "disconnect");
        return connection;
    }
}
