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

import { OnStart, Service } from "@flamework/core";
import { MessagingService, Players, TextChatService, TextService } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import { OnPlayerAdded } from "server/services/ModdingService";
import { RobotoSlab } from "shared/asset/GameFonts";
import { getNameFromUserId, getTextChannels } from "shared/constants";
import { IS_EDIT, IS_STUDIO } from "shared/Context";
import eat from "shared/hamster/eat";
import Packets from "shared/Packets";

/**
 * Service for sending system and private chat messages to players.
 */
@Service()
export default class ChatHookService implements OnStart, OnPlayerAdded {
    readonly GLOBAL_CHANNEL = (() => {
        if (IS_EDIT) return undefined;
        const globalChatChannel = new Instance("TextChannel");
        globalChatChannel.Name = "Global";
        globalChatChannel.Parent = getTextChannels();
        return globalChatChannel;
    })();

    constructor(private dataService: DataService) {}

    /**
     * Sends a private system message to a player.
     *
     * @param player Target player
     * @param message Message text
     * @param metadata Optional message metadata
     */
    sendPrivateMessage(player: Player | undefined, message: string, metadata?: string, channel?: TextChannel) {
        if (IS_EDIT) {
            print(message);
            return;
        }
        if (player === undefined) return;
        channel ??= getTextChannels().WaitForChild("RBXGeneral") as TextChannel;
        Packets.systemMessageSent.toClient(player, channel.Name, message, metadata ?? "");
    }

    /**
     * Sends a system message to the server's general chat.
     *
     * @param message Message text
     * @param metadata Optional message metadata
     */
    sendServerMessage(message: string, metadata?: string, channel?: TextChannel) {
        if (IS_EDIT) {
            print(message);
            return;
        }

        channel ??= getTextChannels().WaitForChild("RBXGeneral") as TextChannel;
        Packets.systemMessageSent.toAllClients(channel.Name, message, metadata ?? "");
    }

    onPlayerAdded(player: Player): void {
        if (IS_EDIT) return;

        this.GLOBAL_CHANNEL?.AddUserAsync(player.UserId);
    }

    onStart() {
        const chatWindowConfiguration = TextChatService.FindFirstChildOfClass("ChatWindowConfiguration");
        if (chatWindowConfiguration) {
            chatWindowConfiguration.FontFace = RobotoSlab;
        }
        const chatInputBarConfiguration = TextChatService.FindFirstChildOfClass("ChatInputBarConfiguration");
        if (chatInputBarConfiguration) {
            chatInputBarConfiguration.FontFace = RobotoSlab;
        }
        const channelTabsConfiguration = TextChatService.FindFirstChildOfClass("ChannelTabsConfiguration");
        if (channelTabsConfiguration) {
            channelTabsConfiguration.FontFace = RobotoSlab;
            channelTabsConfiguration.Enabled = true;
        }
        const bubbleChatConfiguration = TextChatService.FindFirstChildOfClass("BubbleChatConfiguration");
        if (bubbleChatConfiguration) {
            bubbleChatConfiguration.FontFace = RobotoSlab;
        }

        // TODO: Check if global chat works
        if (!IS_EDIT) {
            const connection = MessagingService.SubscribeAsync("GlobalChat", (message) => {
                if (this.dataService.empireData.globalChat !== true) return;
                const data = message.Data as { player: number; message: string };
                if (this.dataService.empireData.blocking.has(data.player)) return;
                for (const player of Players.GetPlayers()) {
                    if (player.UserId === data.player) {
                        return;
                    }
                }
                const name = getNameFromUserId(data.player);
                this.sendServerMessage(
                    `${name}:  ${data.message}`,
                    "tag:hidden;color:180,180,180;",
                    this.GLOBAL_CHANNEL,
                );
            });

            let counter = 0;
            const globalMessageConnection = Packets.sendGlobalMessage.fromClient((player, message) => {
                if (this.dataService.empireData.globalChat === true && message.sub(1, 1) !== "/") {
                    ++counter;
                    task.delay(5, () => --counter);
                    if (counter > 5) {
                        return;
                    }
                    task.spawn(() => {
                        if (IS_STUDIO) {
                            print(`[Global] ${player.Name}: ${message}`);
                        }
                        MessagingService.PublishAsync("GlobalChat", {
                            player: player.UserId,
                            message: TextService.FilterStringAsync(
                                message,
                                player.UserId,
                            ).GetNonChatStringForBroadcastAsync(),
                        });
                    });
                }
            });

            eat(connection, "Disconnect");
            eat(globalMessageConnection, "Disconnect");
        }
    }
}
