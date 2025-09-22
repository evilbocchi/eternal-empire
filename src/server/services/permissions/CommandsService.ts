/**
 * @fileoverview Handles chat commands and permissions.
 *
 * This service handles:
 * - Registration and management of all chat commands in the game
 * - Permission-based command access control (levels 0-4)
 * - Player and empire management commands
 * - Moderation and administrative tools
 * - Game state manipulation and debugging utilities
 * - Server navigation and teleportation commands
 *
 * Commands are organized by permission levels:
 * - Level 0: Basic player commands (help, join, logs, voting)
 * - Level 1: Trusted player commands (block, invite, empire tools)
 * - Level 2: Moderator commands (kick, restrict, teleport)
 * - Level 3: Manager commands (ban, currency/item management)
 * - Level 4: Owner commands (admin tools, server management)
 *
 * The service integrates with multiple game systems including permissions,
 * currency, items, areas, quests, and player data management.
 *
 * @since 1.0.0
 */

import { OnInit, Service } from "@flamework/core";
import { Players, TextChatService } from "@rbxts/services";
import APIExposeService from "server/services/APIExposeService";
import Command, { CommandAPI } from "shared/commands/Command";
import { IS_CI } from "shared/Context";

declare global {
    type CommandAPI = APIExposeService["Server"] & {
        Command: CommandsService;
    };
}

/**
 * Service that provides comprehensive chat command functionality with permission-based access control.
 *
 * Manages the complete command system including registration, permission checking,
 * and integration with all major game systems for moderation and administration.
 */
@Service()
export default class CommandsService implements OnInit {
    constructor(private readonly apiExposeService: APIExposeService) {
        const server = this.apiExposeService.Server as CommandAPI;
        server.Command = this;
        for (const [key, value] of pairs(server)) {
            (CommandAPI as { [key: string]: unknown })[key] = value;
        }
    }

    /**
     * Registers a new chat command.
     *
     * @param command The command to register
     */
    registerCommand(command: Command) {
        if (IS_CI) return;

        const textChatCommand = new Instance("TextChatCommand");
        textChatCommand.PrimaryAlias = "/" + command.id;
        textChatCommand.SecondaryAlias = "/" + command.aliases[0] || "";
        textChatCommand.Name = command.id + "Command";
        textChatCommand.Triggered.Connect((o, u) => {
            const params = u.split(" ");
            params.remove(0);
            const p = Players.WaitForChild(o.Name) as Player;
            const pLevel = CommandAPI.Permissions.getPermissionLevel(p.UserId);
            if (pLevel < command.permissionLevel) {
                CommandAPI.ChatHook.sendPrivateMessage(p, "You do not have access to this command.", "color:255,43,43");
                return;
            }
            command.execute(p, ...params);
        });
        textChatCommand.Parent = TextChatService.WaitForChild("TextChatCommands");
    }

    /**
     * Finds players based on the given string.
     *
     * @param sender The player who initiated the command
     * @param str The string to search for
     * @returns An array of matching players
     */
    findPlayers(sender: Player, str: string) {
        switch (str) {
            case "me":
                return [sender];
            case "others":
                return Players.GetPlayers().filter((value) => value !== sender);
            case "all":
                return Players.GetPlayers();
            case undefined:
                return [];
            default:
                for (const player of Players.GetPlayers()) {
                    if (str.lower() === player.Name.lower().sub(1, str.size())) {
                        return [player];
                    }
                }
                break;
        }
        return [];
    }

    /**
     * Formats a player's name and ID for display.
     *
     * @param name The name of the player
     * @param id The ID of the player
     * @returns A formatted string containing the player's name and ID
     */
    fp(name: string, id: number) {
        return name + " (ID: " + id + ")";
    }

    /**
     * Obtain a player's user ID from their name or mention.
     *
     * @param p The player name or mention
     * @param useId Whether to use the ID directly
     * @returns The user ID of the player
     */
    id(p: string, useId: string) {
        p = p.gsub("@", "")[0];
        return useId === "true" ? tonumber(p) : Players.GetUserIdFromNameAsync(p);
    }

    /**
     * Initializes the CommandsService and registers all chat commands.
     *
     * Creates and registers commands organized by permission levels:
     * - Level 0: Basic player commands (help, join, logs, voting)
     * - Level 1: Trusted player commands (block, invite, empire management)
     * - Level 2: Moderator commands (kick, restrict, player management)
     * - Level 3: Manager commands (ban, currency/item management, admin tools)
     * - Level 4: Owner commands (server management, advanced debugging)
     *
     * Each command includes automatic permission checking and appropriate
     * error messages for unauthorized access attempts.
     */
    onInit() {
        Command.listAllCommands().forEach((command) => {
            this.registerCommand(command);
        });
    }
}
