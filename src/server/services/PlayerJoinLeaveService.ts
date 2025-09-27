/**
 * @fileoverview Manages join/leave chat messages for players.
 *
 * This service sends chat messages to the server when players join or leave,
 * providing a welcoming experience and notifying other players of activity.
 *
 * @since 1.0.0
 */

import { OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import ChatHookService from "server/services/permissions/ChatHookService";
import { OnPlayerAdded } from "server/services/ModdingService";
import { IS_EDIT } from "shared/Context";
import eat from "shared/hamster/eat";

/**
 * Service that handles player join and leave chat messages.
 */
@Service()
export default class PlayerJoinLeaveService implements OnStart, OnPlayerAdded {
    constructor(private chatHookService: ChatHookService) {}

    /**
     * Handles when a player joins the server.
     * @param player The player who joined
     */
    onPlayerAdded(player: Player): void {
        if (IS_EDIT) return;

        // Send join message to server chat
        this.chatHookService.sendServerMessage(
            `${player.DisplayName} (@${player.Name}) joined the empire!`,
            "color:100,255,100", // Light green color
        );
    }

    /**
     * Initializes the PlayerJoinLeaveService and sets up leave message handling.
     */
    onStart(): void {
        if (IS_EDIT) return;

        // Handle player leaving
        const playerLeavingConnection = Players.PlayerRemoving.Connect((player) => {
            this.chatHookService.sendServerMessage(
                `${player.DisplayName} (@${player.Name}) left the empire.`,
                "color:255,150,150", // Light red color
            );
        });

        eat(playerLeavingConnection, "Disconnect");
    }
}
