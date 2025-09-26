/**
 * @fileoverview Manages system and private chat messaging for players.
 *
 * This service:
 * - Sends private and server system messages
 * - Creates and manages private chat channels for players
 * - Integrates with shared chat packet system
 *
 * @since 1.0.0
 */

import { Service } from "@flamework/core";
import { OnPlayerAdded } from "server/services/ModdingService";
import { getTextChannels } from "shared/constants";
import { IS_EDIT } from "shared/Context";
import Packets from "shared/Packets";

/**
 * Service for sending system and private chat messages to players.
 */
@Service()
export default class ChatHookService implements OnPlayerAdded {
    readonly plrChannels = new Map<Player, TextChannel>();

    /**
     * Sends a private system message to a player.
     *
     * @param player Target player
     * @param message Message text
     * @param metadata Optional message metadata
     */
    sendPrivateMessage(player: Player | undefined, message: string, metadata?: string) {
        if (IS_EDIT) {
            print(message);
            return;
        }
        if (player === undefined) return;

        const plrChannel = this.plrChannels.get(player) ?? this.createChannel(player);
        Packets.systemMessageSent.toClient(player, plrChannel.Name, message, metadata ?? "");
    }

    /**
     * Sends a system message to the server's general chat.
     *
     * @param message Message text
     * @param metadata Optional message metadata
     */
    sendServerMessage(message: string, metadata?: string) {
        if (IS_EDIT) return;

        const rbxGeneral = getTextChannels().WaitForChild("RBXGeneral") as TextChannel;
        Packets.systemMessageSent.toAllClients(rbxGeneral.Name, message, metadata ?? "");
    }

    /**
     * Creates a private channel for a player.
     * This is called when a player joins the game to set up their private chat channel.
     *
     * @param player Player to create the channel for
     * @return The created TextChannel instance
     */
    createChannel(player: Player) {
        const plrChannel = new Instance("TextChannel");
        plrChannel.Name = player.Name;
        plrChannel.Parent = getTextChannels();
        plrChannel.AddUserAsync(player.UserId);
        plrChannel.SetAttribute("Color", Color3.fromRGB(82, 255, 105));
        this.plrChannels.set(player, plrChannel);
        return plrChannel;
    }

    onPlayerAdded(player: Player) {
        if (!IS_EDIT) {
            this.createChannel(player);
        }
    }
}
