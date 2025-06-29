//!native
//!optimize 2

/**
 * @fileoverview BadgesService - Awards badges to players when they join the game.
 *
 * This service listens for player join events and grants a specific badge
 * using Roblox's BadgeService API.
 *
 * @since 1.0.0
 */

import { Service } from "@flamework/core";
import { BadgeService } from "@rbxts/services";
import { OnPlayerJoined } from "server/services/ModdingService";

/**
 * Service that handles awarding badges to players upon joining.
 */
@Service()
export class BadgesService implements OnPlayerJoined {
    /**
     * Called when a player joins the game. Awards a badge to the player.
     *
     * @param player The player who joined.
     */
    onPlayerJoined(player: Player) {
        BadgeService.AwardBadge(player.UserId, 3498765777753358);
    }
}