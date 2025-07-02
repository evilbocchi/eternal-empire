/**
 * @fileoverview DonationService - Tracks and updates player donation stats.
 *
 * This service provides:
 * - Getting and setting the amount a player has donated
 * - Firing signals when donation amounts change
 * - Synchronizing donation stats with leaderboards
 *
 * @since 1.0.0
 */

import Signal from "@antivivi/lemon-signal";
import { OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import LeaderstatsService from "server/services/LeaderstatsService";
import DataService from "server/services/serverdata/DataService";

/**
 * Service that manages player donation stats and leaderboard updates.
 */
@Service()
export class DonationService implements OnStart {
    /** Signal fired when a player's donation amount changes. */
    donatedChanged = new Signal<(player: Player, amount: number) => void>();

    constructor(private leaderstatsService: LeaderstatsService, private dataService: DataService) {
    }

    /**
     * Gets the amount a player has donated.
     * 
     * @param player The player to check.
     */
    getDonated(player: Player) {
        return this.dataService.loadPlayerProfile(player.UserId, true)?.Data.donated ?? 0;
    }

    /**
     * Sets the amount a player has donated and fires the change signal.
     * 
     * @param player The player to update.
     * @param donated The new donation amount.
     */
    setDonated(player: Player, donated: number) {
        const playerProfile = this.dataService.loadPlayerProfile(player.UserId);
        if (playerProfile !== undefined) {
            playerProfile.Data.donated = donated;
            this.donatedChanged.fire(player, donated);
        }
    }

    /**
     * Initializes the service, syncing donation stats with leaderboards and connecting signals.
     */
    onStart() {
        const update = (player: Player, donated: number) => {
            this.leaderstatsService.setLeaderstat(player, "Donated", donated);
        };
        this.donatedChanged.connect((player, donated) => update(player, donated));
        Players.PlayerAdded.Connect((player) => update(player, this.getDonated(player)));
        for (const player of Players.GetPlayers()) {
            update(player, this.getDonated(player));
        }
    }
}