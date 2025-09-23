/**
 * @fileoverview Monitors leaderboard position changes and sends Discord webhook notifications.
 *
 * This service handles:
 * - Periodically checking empire's position on all leaderboards
 * - Tracking position changes in empire data
 * - Sending Discord webhook notifications when position changes and empire is in top 100
 * - Supporting multiple leaderboard types (TimePlayed, currencies, Donated)
 *
 * @since 1.0.0
 */

import { simpleInterval } from "@antivivi/vrldk";
import { OnStart, Service } from "@flamework/core";
import { CollectionService, DataStoreService, HttpService } from "@rbxts/services";
import { $env } from "rbxts-transform-env";
import DataService from "server/services/data/DataService";
import { IS_EDIT } from "shared/Context";
import Sandbox from "shared/Sandbox";
import { getNameFromUserId } from "shared/constants";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import eat from "shared/hamster/eat";

/**
 * Service that monitors leaderboard position changes and sends webhook notifications.
 */
@Service()
export default class LeaderboardChangeService implements OnStart {
    /** OrderedDataStore for total time leaderboard. */
    private totalTimeStore = DataStoreService.GetOrderedDataStore("TotalTime");

    /** OrderedDataStore for donations leaderboard. */
    private donatedStore = DataStoreService.GetOrderedDataStore("Donated");

    /** Map of leaderboard names to their corresponding DataStores. */
    private leaderboardStores = new Map<string, OrderedDataStore>();

    /** List of banned user IDs (excluded from leaderboards). */
    private banned = [1900444407];

    constructor(private dataService: DataService) {
        // Initialize currency leaderboard stores
        this.leaderboardStores.set("TimePlayed", this.totalTimeStore);
        this.leaderboardStores.set("Donated", this.donatedStore);

        for (const lb of CollectionService.GetTagged("Leaderboard")) {
            const currency = lb.Name as Currency;
            if (CURRENCY_DETAILS[currency] === undefined) continue;
            this.leaderboardStores.set(currency, DataStoreService.GetOrderedDataStore(lb.Name));
        }
    }

    /**
     * Gets the position of the current empire in a specific leaderboard.
     *
     * @param leaderboardName The name of the leaderboard to check.
     * @param store The OrderedDataStore for this leaderboard.
     * @returns The position (1-based) or 0 if not in top 100.
     */
    private getEmpirePosition(leaderboardName: string, store: OrderedDataStore): number {
        const empireName = this.dataService.empireData.name;

        try {
            const data = store.GetSortedAsync(false, 100);
            const entries = data.GetCurrentPage();

            for (let i = 0; i < entries.size(); i++) {
                const entry = entries[i];
                if (leaderboardName === "Donated") {
                    // For donated leaderboard, convert user ID to name
                    const name = getNameFromUserId(tonumber(entry.key) ?? 0);
                    if (name === empireName) {
                        return i + 1;
                    }
                } else {
                    // For other leaderboards, compare names directly
                    if (entry.key === empireName) {
                        return i + 1;
                    }
                }
            }
        } catch (error) {
            warn(`Failed to get leaderboard position for ${leaderboardName}: ${error}`);
        }

        return 0; // Not in top 100 or error occurred
    }

    /**
     * Checks all leaderboard positions and updates stored positions.
     * Sends webhook notifications for any changes where empire is in top 100.
     */
    private checkLeaderboardPositions() {
        const empireData = this.dataService.empireData;

        // Skip if empire owner is banned
        if (this.banned.includes(empireData.owner)) {
            return;
        }

        const previousPositions = new Map<string, number>();
        for (const [key, value] of empireData.leaderboardPositions) {
            previousPositions.set(key, value);
        }
        const currentPositions = new Map<string, number>();

        // Check all leaderboards
        for (const [leaderboardName, store] of this.leaderboardStores) {
            const currentPosition = this.getEmpirePosition(leaderboardName, store);
            const previousPosition = previousPositions.get(leaderboardName) ?? 0;

            currentPositions.set(leaderboardName, currentPosition);

            // Check if position changed and empire is in top 100
            if (currentPosition !== previousPosition && currentPosition > 0 && currentPosition <= 100) {
                this.sendWebhookNotification(leaderboardName, previousPosition, currentPosition);
            }
        }

        // Update stored positions
        empireData.leaderboardPositions = currentPositions;
    }

    /**
     * Sends a Discord webhook notification about leaderboard position change.
     *
     * @param leaderboardName The name of the leaderboard.
     * @param previousPosition The previous position (0 if not in top 100).
     * @param currentPosition The current position.
     */
    private sendWebhookNotification(leaderboardName: string, previousPosition: number, currentPosition: number) {
        const webhookUrl = $env.string("LEADERBOARD_WEBHOOK");
        if (webhookUrl === undefined) {
            warn("LEADERBOARD_WEBHOOK is not set, skipping Discord notification.");
            return;
        }

        const empireData = this.dataService.empireData;
        const empireName = empireData.name;
        const ownerName = getNameFromUserId(empireData.owner);

        // Determine position change direction and emoji
        let changeText: string;
        let changeEmoji: string;
        let embedColor: number;

        if (previousPosition === 0) {
            changeText = `entered the leaderboard at position **#${currentPosition}**`;
            changeEmoji = "📈";
            embedColor = 0x00ff00; // Green
        } else if (currentPosition < previousPosition) {
            changeText = `moved up from **#${previousPosition}** to **#${currentPosition}**`;
            changeEmoji = "⬆️";
            embedColor = 0x00ff00; // Green
        } else {
            changeText = `moved down from **#${previousPosition}** to **#${currentPosition}**`;
            changeEmoji = "⬇️";
            embedColor = 0xff6600; // Orange
        }

        // Create the webhook message
        const embed = {
            title: `${changeEmoji} Leaderboard Position Change`,
            description: `**${empireName}** (${ownerName}) ${changeText} on the **${leaderboardName}** leaderboard!`,
            color: embedColor,
            timestamp: os.date("!%Y-%m-%dT%H:%M:%SZ"),
            fields: [
                {
                    name: "Empire",
                    value: empireName,
                    inline: true,
                },
                {
                    name: "Owner",
                    value: ownerName,
                    inline: true,
                },
                {
                    name: "Leaderboard",
                    value: leaderboardName,
                    inline: true,
                },
                {
                    name: "Previous Position",
                    value: previousPosition === 0 ? "Not in top 100" : `#${previousPosition}`,
                    inline: true,
                },
                {
                    name: "Current Position",
                    value: `#${currentPosition}`,
                    inline: true,
                },
            ],
        };

        try {
            HttpService.PostAsync(
                webhookUrl,
                HttpService.JSONEncode({
                    embeds: [embed],
                }),
                Enum.HttpContentType.ApplicationJson,
            );

            print(
                `Leaderboard change notification sent for ${empireName}: ${leaderboardName} ${previousPosition} -> ${currentPosition}`,
            );
        } catch (error) {
            warn(`Failed to send webhook notification: ${error}`);
        }
    }

    /**
     * Starts the leaderboard monitoring loop.
     */
    onStart() {
        if (Sandbox.getEnabled() || IS_EDIT) {
            return;
        }

        // Start the monitoring loop with 60-second intervals
        task.spawn(() => {
            // Initial check after a short delay to let other services initialize
            task.wait(10);
            this.checkLeaderboardPositions();

            // Regular checks every 60 seconds
            eat(simpleInterval(() => this.checkLeaderboardPositions(), 60));
        });
    }
}
