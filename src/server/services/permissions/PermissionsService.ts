/**
 * @fileoverview Manages player permissions, moderation, and command handling.
 *
 * This service is responsible for:
 * - Managing permission levels (banned, trusted, managers, owner, etc.)
 * - Handling player moderation (ban, kick, restrict, trust, etc.)
 * - Registering and processing chat commands with permission checks
 * - Integrating with other services for data, items, upgrades, and more
 * - Broadcasting server and private messages
 * - Handling global chat and related features
 *
 * Acts as the central authority for all permission and moderation logic in the game.
 *
 * @since 1.0.0
 */

import { OnInit, Service } from "@flamework/core";
import { MessagingService, Players, TeleportService, TextService } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import { OnPlayerAdded } from "server/services/ModdingService";
import ChatHookService from "server/services/permissions/ChatHookService";
import { getNameFromUserId } from "shared/constants";
import { IS_SINGLE_SERVER } from "shared/Context";
import Packets from "shared/Packets";

declare global {
    interface Assets {
        ClassicSword: Tool;
    }

    /**
     * Represents the keys for each permission to manage an empire.
     */
    type PermissionKey = keyof EmpireData["permLevels"];
}

type PermissionList = "banned" | "trusted" | "managers";

/**
 * Service for managing player permissions, moderation, and command registration.
 *
 * Handles permission lists, player moderation actions, command creation, and logging.
 * Integrates with other services for data, items, upgrades, and messaging.
 */
@Service()
export default class PermissionsService implements OnInit, OnPlayerAdded {
    /**
     * Constructs the PermissionsService with all required dependencies.
     */
    constructor(
        private dataService: DataService,
        private chatHookService: ChatHookService,
    ) {}

    /**
     * Gets the list of user IDs for a given permission type.
     * @param list Permission list type
     */
    getList(list: PermissionList) {
        return this.dataService.empireData[list] ?? [];
    }

    /**
     * Sets the list of user IDs for a given permission type.
     * @param list Permission list type
     * @param value Array of user IDs
     */
    setList(list: PermissionList, value: number[]) {
        this.dataService.empireData[list] = value;
    }

    /**
     * Adds a user ID to a permission list.
     * @param list Permission list type
     * @param userId User ID to add
     * @returns True if added, false if already present
     */
    add(list: PermissionList, userId: number) {
        const l = this.getList(list);
        if (l.includes(userId)) {
            return false;
        }
        l.push(userId);
        this.setList(list, l);
        return true;
    }

    /**
     * Removes a user ID from a permission list.
     * @param list Permission list type
     * @param userId User ID to remove
     * @returns True if removed, false if not present
     */
    remove(list: PermissionList, userId: number) {
        const l = this.getList(list);
        const n = new Array<number>();
        let removed = false;
        for (const b of l) {
            if (b !== userId) {
                n.push(b);
            } else {
                removed = true;
            }
        }
        this.setList(list, n);
        return removed;
    }

    /**
     * Gets the permission level for a user.
     * @param userId User ID
     * @returns Permission level (-2 banned, -1 restricted, 0 normal, 1 trusted, 2 manager, 3 owner, 4 developer/testing)
     */
    getPermissionLevel(userId: number) {
        const data = this.dataService.empireData;
        if (game.PlaceId === 16438564807) {
            return 4;
        } else {
            const p = Players.GetPlayerByUserId(userId);
            if (p !== undefined && p.GetAttribute("Developer") === true) {
                return 4;
            }
        }
        const restrictedTime = data.restricted.get(userId);
        if (restrictedTime !== undefined) {
            if (restrictedTime > tick()) {
                return -1;
            } else {
                data.restricted.delete(userId);
            }
        }
        if (data.owner === userId) {
            return 3;
        } else if (data.managers.includes(userId)) {
            return 2;
        } else if (data.trusted.includes(userId)) {
            return 1;
        } else if (data.banned.includes(userId)) {
            return -2;
        }
        return 0;
    }

    /**
     * Checks if a player has the required permission level for an action.
     *
     * @param player The player to check permissions for.
     * @param action The action requiring permission.
     * @returns Whether the player has sufficient permissions.
     */
    checkPermLevel(player: Player, action: PermissionKey) {
        const minimumPerm = this.dataService.empireData.permLevels[action];
        const permLevel = player.GetAttribute("PermissionLevel") as number;
        if (permLevel === undefined || permLevel < minimumPerm) {
            return false;
        }
        return true;
    }

    /**
     * Updates the permission level attribute for a user.
     * @param userId User ID
     * @returns New permission level
     */
    updatePermissionLevel(userId: number) {
        const target = Players.GetPlayerByUserId(userId);
        const permLevel = this.getPermissionLevel(userId);
        if (target !== undefined) {
            target.SetAttribute("PermissionLevel", permLevel);
        }
        return permLevel;
    }

    /**
     * Gets the current access code for the empire.
     * @returns Access code string
     */
    getAccessCode() {
        return this.dataService.empireData.accessCode + "|" + this.dataService.empireId;
    }

    /**
     * Handles logic when a player joins the server.
     * @param player Player who joined
     */
    onPlayerAdded(player: Player) {
        const joinData = player.GetJoinData();
        if (joinData.LaunchData !== undefined && !IS_SINGLE_SERVER) {
            const [ac, id] = joinData.LaunchData.split("|");
            if (id !== undefined && id !== this.dataService.empireId) {
                TeleportService.TeleportToPrivateServer(game.PlaceId, ac, [player], undefined, id);
            }
        }
        if (this.dataService.empireData.banned.includes(player.UserId)) {
            player.Kick("You are banned from this empire.");
        }
        player.SetAttribute("Developer", player.GetRankInGroup(10940445) > 252);
        const permLevel = this.updatePermissionLevel(player.UserId);
        this.chatHookService.sendPrivateMessage(
            player,
            `Your permission level is ${permLevel}. Type /help for a list of available commands.`,
            "color:138,255,138",
        );
        let counter = 0;
        player.Chatted.Connect((message) => {
            if (this.dataService.empireData.globalChat === true && message.sub(1, 1) !== "/") {
                ++counter;
                task.delay(5, () => --counter);
                if (counter > 5) {
                    return;
                }
                task.spawn(() => {
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
    }

    /**
     * Initializes the PermissionsService, setting up messaging subscriptions.
     */
    onInit() {
        MessagingService.SubscribeAsync("GlobalChat", (message) => {
            if (this.dataService.empireData.globalChat !== true) return;
            const data = message.Data as { player: number; message: string };
            if (this.dataService.empireData.blocking.has(data.player)) return;
            for (const player of Players.GetPlayers()) {
                if (player.UserId === data.player) {
                    return;
                }
            }
            const name = getNameFromUserId(data.player);
            this.chatHookService.sendServerMessage(`${name}:  ${data.message}`, "tag:hidden;color:180,180,180;");
        });
        Packets.permLevels.set(this.dataService.empireData.permLevels);
    }
}
