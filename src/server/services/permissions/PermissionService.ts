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

import { OnStart, Service } from "@flamework/core";
import { Players, TeleportService } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import { OnPlayerAdded } from "server/services/ModdingService";
import ChatHookService from "server/services/permissions/ChatHookService";
import { IS_EDIT, IS_SINGLE_SERVER, IS_STUDIO } from "shared/Context";
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
export default class PermissionService implements OnStart, OnPlayerAdded {
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
     * @param ignoreTest Whether to ignore test server status (default false)
     * @returns Permission level (-2 banned, -1 restricted, 0 normal, 1 trusted, 2 manager, 3 owner, 4 developer/testing)
     */
    getPermissionLevel(userId: number, ignoreTest?: boolean) {
        const data = this.dataService.empireData;
        const placeId = game.PlaceId;
        if ((placeId === 16438564807 || placeId === 77876177882408 || IS_STUDIO) && ignoreTest !== true) {
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
     * Checks if the sender has a lower permission level than the target.
     * @param sender The player sending the command (undefined if from console)
     * @param target The target user's ID
     * @param disallowEqual Whether to return false if levels are equal (default false)
     * @returns True if sender has lower permission level, false otherwise
     */
    isLowerLevel(sender: Player | undefined, target: number, disallowEqual = false) {
        if (sender === undefined) {
            return false;
        }
        const permLevelA = this.getPermissionLevel(sender.UserId);
        const permLevelB = this.getPermissionLevel(target);
        if (disallowEqual) {
            return permLevelA < permLevelB;
        } else {
            return permLevelA <= permLevelB;
        }
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
        const permLevel = Packets.permLevel.get(player);
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
            Packets.permLevel.setFor(target, permLevel);
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

        if (!IS_EDIT) {
            const isDev = player.GetRankInGroup(10940445) > 252;
            player.SetAttribute("Developer", isDev);

            if (this.dataService.empireData.banned.includes(player.UserId) && !isDev) {
                player.Kick("You are banned from this empire.");
                return;
            }
        }

        const permLevel = this.updatePermissionLevel(player.UserId);

        this.chatHookService.sendPrivateMessage(
            player,
            `Your permission level is ${permLevel}. Type /help for a list of available commands.`,
            "color:138,255,138",
        );
    }

    onStart() {
        Packets.permLevels.set(this.dataService.empireData.permLevels);
    }
}
