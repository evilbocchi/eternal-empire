/**
 * @fileoverviewol.
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

import { OnoeNum } from "@antivivi/serikanum";
import { playSoundAtPart, spawnExplosion } from "@antivivi/vrldk";
import { OnInit, Service } from "@flamework/core";
import { Debris, Lighting, Players, ReplicatedStorage, RunService, ServerStorage, TeleportService, TextChatService, Workspace } from "@rbxts/services";
import Quest from "server/Quest";
import BombsService from "server/services/boosts/BombsService";
import { DonationService } from "server/services/DonationService";
import ItemService from "server/services/item/ItemService";
import { LeaderboardService } from "server/services/leaderboard/LeaderboardService";
import ChatHookService from "server/services/permissions/ChatHookService";
import PermissionsService from "server/services/permissions/PermissionsService";
import ResetService from "server/services/ResetService";
import CurrencyService from "server/services/serverdata/CurrencyService";
import DataService from "server/services/serverdata/DataService";
import LevelService from "server/services/serverdata/LevelService";
import NamedUpgradeService from "server/services/serverdata/NamedUpgradeService";
import PlaytimeService from "server/services/serverdata/PlaytimeService";
import QuestService from "server/services/serverdata/QuestService";
import SetupService from "server/services/serverdata/SetupService";
import AreaService from "server/services/world/AreaService";
import ChestService from "server/services/world/ChestService";
import UnlockedAreasService from "server/services/world/UnlockedAreasService";
import { AREAS } from "shared/Area";
import { ASSETS, getSound } from "shared/asset/GameAssets";
import { IS_SINGLE_SERVER } from "shared/constants";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import GameSpeed from "shared/GameSpeed";
import { DROPLET_STORAGE } from "shared/item/Droplet";
import Dropper from "shared/item/traits/dropper/Dropper";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";

/**
 * Service that provides comprehensive chat command functionality with permission-based access control.
 * 
 * Manages the complete command system including registration, permission checking,
 * and integration with all major game systems for moderation and administration.
 */
@Service()
export default class CommandsService implements OnInit {

    /** Reference to the TextChatCommands container for command registration. */
    commands = TextChatService.WaitForChild("TextChatCommands");

    /**
     * Initializes the CommandsService with all required game service dependencies.
     * 
     * @param dataService Empire and player data management
     * @param gameAssetService Game utilities and asset management
     * @param donationService Player donation tracking
     * @param currencyService Currency management and transactions
     * @param leaderboardService Leaderboard management and updates
     * @param namedUpgradeService Upgrade purchase and management
     * @param itemService Item inventory and placement management
     * @param playtimeService Playtime tracking and statistics
     * @param areaService Area management and teleportation
     * @param levelService Level and experience management
     * @param questService Quest progression tracking
     * @param unlockedAreasService Area unlock management
     * @param resetService Game reset and prestige functionality
     * @param bombsService Bomb effects and management
     * @param setupService Item setup saving and loading
     * @param chestService Chest management and loot
     * @param permissionService Permission checking and messaging
     */
    constructor(
        private dataService: DataService,
        private chatHookService: ChatHookService,
        private donationService: DonationService,
        private currencyService: CurrencyService,
        private leaderboardService: LeaderboardService,
        private namedUpgradeService: NamedUpgradeService,
        private itemService: ItemService,
        private playtimeService: PlaytimeService,
        private areaService: AreaService,
        private levelService: LevelService,
        private questService: QuestService,
        private unlockedAreasService: UnlockedAreasService,
        private resetService: ResetService,
        private bombsService: BombsService,
        private setupService: SetupService,
        private chestService: ChestService,
        private permissionService: PermissionsService,
    ) { }

    /**
     * Gets the permission level for a user.
     * @param userId The user ID to check.
     * @returns The permission level (0-4).
     */
    private getPermissionLevel(userId: number) {
        return this.permissionService.getPermissionLevel(userId);
    }

    /**
     * Sends a private message to a specific player.
     * @param player The player to send the message to.
     * @param message The message content.
     * @param color Optional color formatting for the message.
     */
    private sendPrivateMessage(player: Player, message: string, color?: string) {
        return this.chatHookService.sendPrivateMessage(player, message, color);
    }

    /**
     * Sends a server-wide message to all players.
     * @param message The message content.
     * @param color Optional color formatting for the message.
     */
    private sendServerMessage(message: string, color?: string) {
        return this.chatHookService.sendServerMessage(message, color);
    }

    /**
     * Updates the permission level for a user.
     * @param userId The user ID to update.
     */
    private updatePermissionLevel(userId: number) {
        return this.permissionService.updatePermissionLevel(userId);
    }

    /**
     * Finds players matching a string (e.g. "me", "all", or by name).
     * @param sender Command sender
     * @param str Player selector string
     * @returns Array of matching players
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
     * Formats a name and user ID for display.
     * @param name Player name
     * @param id User ID
     */
    fp(name: string, id: number) {
        return name + " (ID: " + id + ")";
    }

    /**
     * Resolves a player name or ID string to a user ID.
     * @param p Name or ID string
     * @param useId Whether to treat as user ID
     */
    id(p: string, useId: string) {
        p = p.gsub("@", "")[0];
        return useId === "true" ? tonumber(p) : Players.GetUserIdFromNameAsync(p);
    }

    /**
     * Registers a new chat command with permission checks.
     * @param primary Primary command alias
     * @param secondary Secondary command alias
     * @param description Command description
     * @param callback Command handler
     * @param permLevel Minimum permission level required
     */
    createCommand(primary: string, secondary: string, description: string, callback: (sender: Player, ...parmas: string[]) => void, permLevel: number) {
        const command = new Instance("TextChatCommand");
        command.PrimaryAlias = "/" + primary;
        command.SecondaryAlias = "/" + secondary;
        command.Name = primary + "Command";
        command.SetAttribute("Description", description);
        command.Triggered.Connect((o, u) => {
            const params = u.split(" ");
            params.remove(0);
            const p = Players.WaitForChild(o.Name) as Player;
            const pLevel = this.getPermissionLevel(p.UserId);
            if (pLevel < permLevel) {
                this.sendPrivateMessage(p, "You do not have access to this command.", "color:255,43,43");
                return;
            }
            callback(p, ...params);
        });
        if (permLevel > 3) {
            command.AutocompleteVisible = false;
        }
        command.SetAttribute("PermissionLevel", permLevel);
        command.Parent = this.commands;
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
        // PERM LEVEL 0

        this.createCommand("help", "?",
            "Displays all available commands.",
            (o) => {
                this.sendPrivateMessage(o, `Your permission level is ${this.getPermissionLevel(o.UserId)}`, "color:138,255,138");
                Packets.tabOpened.fire(o, "Commands");
            }, 0);

        this.createCommand("join", "j",
            "<accesscode> : Joins an empire given an access code.",
            (o, accessCode) => {
                if (IS_SINGLE_SERVER) {
                    return;
                }
                const [ac, id] = accessCode.split("|");
                TeleportService.TeleportToPrivateServer(game.PlaceId, ac, [o], undefined, id);
            }, 0);

        this.createCommand("logs", "log",
            "Open the log window, where activities from every player are recorded.",
            (o) => {
                Packets.tabOpened.fire(o, "Logs");
            }, 0);

        this.createCommand("voterestrict", "vr",
            "<player> : Vote to restrict a player.",
            (o, p) => {
                const targets = this.findPlayers(o, p);
                if (targets.size() < 1) {
                    this.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
                    return;
                }
                const data = this.dataService.empireData;
                const playerCount = Players.GetPlayers().filter((player) => (player.GetAttribute("PermissionLevel") as number ?? 0) > -1).size();
                for (const target of targets) {
                    const userId = target.UserId;
                    if (this.getPermissionLevel(userId) >= 1) {
                        this.sendPrivateMessage(o, "You can't vote to restrict a trusted player", "color:255,43,43");
                        continue;
                    }
                    if (o.FindFirstChild(userId) !== undefined) {
                        this.sendPrivateMessage(o, "You have already voted to restrict this player", "color:255,43,43");
                        continue;
                    }
                    const votes = (target.GetAttribute("Votes") as number ?? 0) + 1;
                    target.SetAttribute("Votes", votes);
                    if (votes === 0) {
                        this.sendServerMessage(`A vote has started to restrict player ${target.Name}. Type /vr ${target.Name} to vote to restrict them too.`, "color:138,255,138");
                    }
                    const requirement = math.round(playerCount * 2 / 3);
                    this.sendServerMessage(`${votes}/${requirement} votes needed.`, "color:138,255,138");
                    const voteToken = new Instance("NumberValue");
                    voteToken.Value = tick();
                    voteToken.Name = tostring(userId);
                    voteToken.Parent = o;
                    Debris.AddItem(voteToken, 60);
                    task.delay(60, () => {
                        if (target === undefined) {
                            return;
                        }
                        target.SetAttribute("Votes", target.GetAttribute("Votes") as number - 1);
                        if (target.GetAttribute("RestrictionTime") as number ?? 0 < tick()) {
                            this.sendPrivateMessage(o, `Your vote to restrict ${target.Name} has worn off.`, "color:138,255,138");
                        }
                    });
                    this.sendPrivateMessage(o, `Voted to restrict ${target.Name}. Your vote will wear off after 60 seconds.`, "color:138,255,138");
                    if (votes >= requirement) {
                        this.sendServerMessage(`${target.Name} has been restricted for 20 minutes.`, "color:138,255,138");
                        data.restricted.set(userId, tick() + 1200);
                        task.delay(1201, () => {
                            const t = data.restricted.get(userId);
                            if (t === undefined || tick() - t > 0) {
                                data.restricted.delete(userId);
                                this.updatePermissionLevel(userId);
                            }
                        });
                        this.updatePermissionLevel(userId);
                    }
                }
            }, 0);

        this.createCommand("walkspeed", "ws",
            "<amount> : Sets your walk speed to the specified amount. If higher than the limit, it will be capped to the maximum allowed speed.",
            (o, amount) => {
                let walkspeed = tonumber(amount) ?? 0;
                if (walkspeed < 0) {
                    this.sendPrivateMessage(o, "Walk speed cannot be negative.", "color:255,43,43");
                    return;
                }
                const maxWalkSpeed = Workspace.GetAttribute("WalkSpeed") as number ?? 16;
                if (walkspeed > maxWalkSpeed) {
                    this.sendPrivateMessage(o, `Walk speed capped at ${maxWalkSpeed}.`, "color:255,43,43");
                }
                walkspeed = math.min(walkspeed, maxWalkSpeed);
                const humanoid = o.Character?.FindFirstChildOfClass("Humanoid");
                if (humanoid === undefined) {
                    return;
                }
                humanoid.WalkSpeed = walkspeed;
                this.sendPrivateMessage(o, `Walk speed set to ${walkspeed}.`, "color:138,255,138");
            }, 0);


        // PERM LEVEL 1

        this.createCommand("block", "ignore",
            "<player> <useid: boolean> : Stop listening to the specified player's global chats. This affects the entire server.",
            (_o, p, useId) => {
                const userId = this.id(p, useId);
                if (userId !== undefined) {
                    this.dataService.empireData.blocking.add(userId);
                    this.sendServerMessage("Ignoring " + this.fp(p, userId), "color:138,255,138");
                }
            }, 1);

        this.createCommand("empireid", "ei",
            "View the empire ID for this empire. Only useful for diagnostics.",
            (o) => {
                const id = this.dataService.empireId;
                this.sendPrivateMessage(o, "The empire ID is: " + id);
                Packets.codeReceived.fire(o, id);
            }, 1);

        this.createCommand("invite", "inv",
            "<player> : Allows the specified player to join this empire.",
            (o, p, useId) => {
                const userId = this.id(p, useId);
                const isStudio = RunService.IsStudio();
                if (userId !== undefined && (userId !== o.UserId || isStudio)) {
                    if (!isStudio && (game.PrivateServerOwnerId !== 0 || game.PrivateServerId === "")) {
                        this.sendPrivateMessage(o, "You cannot use /invite in this server.", "color:255,43,43");
                        return;
                    }
                    this.dataService.addAvailableEmpire(userId, this.dataService.empireId);
                    this.sendPrivateMessage(o, "Invited " + this.fp(p, userId), "color:138,255,138");
                }
            }, 1);

        this.createCommand("revoke", "rv",
            "<player> : Removes the player's access to join the empire.",
            (o, p, useId) => {
                const userId = this.id(p, useId);
                if (userId !== undefined) {
                    if (this.getPermissionLevel(userId) >= this.getPermissionLevel(o.UserId)) {
                        this.sendPrivateMessage(o, "You can't revoke someone with an equal/higher permission level.", "color:255,43,43");
                        return;
                    }
                    const empireId = this.dataService.empireId;
                    this.dataService.removeAvailableEmpire(userId, empireId);
                    this.sendPrivateMessage(o, `Revoked ${this.fp(p, userId)}`, "color:138,255,138");
                }
            }, 1);

        this.createCommand("accesscode", "ac",
            "View the access code for this empire. Anyone with the access code is able to join this empire. Only available for private empires.",
            (o) => {
                if (RunService.IsStudio() || (game.PrivateServerOwnerId === 0 && game.PrivateServerId !== "")) {
                    const code = this.permissionService.getAccessCode();
                    this.sendPrivateMessage(o, "The server access code is: " + code);
                    Packets.codeReceived.fire(o, code);
                }
                else {
                    this.sendPrivateMessage(o, "You cannot use this command on this server", "color:255,43,43");
                }
            }, 1);

        this.createCommand("joinlink", "jl",
            "Gets a URL in which players can use to join this empire. Utilises the empire's access code. Only available for private empires.",
            (o) => {
                if (RunService.IsStudio() || (game.PrivateServerOwnerId === 0 && game.PrivateServerId !== "")) {
                    const joinLink = "https://www.roblox.com/games/start?placeId=" + game.PlaceId + "&launchData=" + this.permissionService.getAccessCode();
                    this.sendPrivateMessage(o, "Join link: " + joinLink);
                    Packets.codeReceived.fire(o, joinLink);
                }
                else {
                    this.sendPrivateMessage(o, "You cannot use this command on this server", "color:255,43,43");
                }
            }, 1);

        this.createCommand("unplaceall", "ua",
            "Unplace all items in the area you are currently in.",
            (o) => {
                const placedItems = this.dataService.empireData.items.worldPlaced;
                const toRemove = new Array<string>();
                const area = Sandbox.getEnabled() ? undefined : this.areaService.getArea(o);
                for (const [id, placedItem] of placedItems)
                    if (area === undefined || placedItem.area === area)
                        toRemove.push(id);

                this.itemService.unplaceItems(o, toRemove);
                this.sendPrivateMessage(o, `Unplaced all items in ${area === undefined ? "all" : AREAS[area].name}`, "color:138,255,138");
            }, 1);

        this.createCommand("kill", "unalive",
            "<player> : Kills a player's character.",
            (o, p) => {
                const targets = this.findPlayers(o, p);
                if (targets.size() < 1) {
                    this.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
                    return;
                }
                for (const target of targets) {
                    const humanoid = target.Character?.FindFirstChildOfClass("Humanoid");
                    if (humanoid !== undefined)
                        humanoid.TakeDamage(humanoid.Health + 1);
                }
                this.sendPrivateMessage(o, `Killed players`, "color:138,255,138");
            }, 1);



        // PERM LEVEL 2

        this.createCommand("restrict", "r",
            "<player> <multiplier> : Restricts a player, removing their access to build and purchase permissions. Pass a multiplier to multiply the default 5 minute duration.",
            (o, p, m) => {
                const targets = this.findPlayers(o, p);
                if (targets.size() < 1) {
                    this.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
                    return;
                }
                const data = this.dataService.empireData;
                const duration = 5 * (m === undefined ? 1 : (tonumber(m) ?? 1));
                for (const target of targets) {
                    if (target === o) {
                        this.sendPrivateMessage(o, "You can't restrict yourself.", "color:255,43,43");
                        continue;
                    }
                    const userId = target.UserId;
                    if (this.getPermissionLevel(userId) >= this.getPermissionLevel(o.UserId)) {
                        this.sendPrivateMessage(o, "You can't restrict someone with an equal/higher permission level.", "color:255,43,43");
                        continue;
                    }
                    this.sendPrivateMessage(o, `Restricted player ${target.Name}`, "color:138,255,138");
                    const restrictionTime = tick() + (duration * 60);
                    target.SetAttribute("RestrictionTime", restrictionTime);
                    data.restricted.set(userId, restrictionTime);
                    task.delay(duration * 60, () => {
                        data.restricted.delete(userId);
                        this.updatePermissionLevel(userId);
                    });
                    this.updatePermissionLevel(userId);
                }
            }, 2);

        this.createCommand("unrestrict", "ur",
            "<player> : Unrestricts a player.",
            (o, p, m) => {
                const targets = this.findPlayers(o, p);
                if (targets.size() < 1) {
                    this.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
                    return;
                }
                const data = this.dataService.empireData;
                for (const target of targets) {
                    const userId = target.UserId;
                    if (data.restricted.delete(userId)) {
                        this.sendPrivateMessage(o, `Unrestricted player ${target.Name}`, "color:138,255,138");
                        this.updatePermissionLevel(userId);
                    }
                    else {
                        this.sendPrivateMessage(o, `${target.Name} is not restricted`, "color:255,43,43");
                    }
                }
            }, 2);

        const kaboom = (player: Player) => {
            const h = player.Character?.FindFirstChildOfClass("Humanoid");
            if (h !== undefined && h.RootPart !== undefined) {
                spawnExplosion(h.RootPart.Position);
                playSoundAtPart(h.RootPart, getSound("Explosion.mp3"));
                h.TakeDamage(99999999);
            }
        };

        this.createCommand("kick", "k",
            "<player> : Kicks a player from the server.",
            (o, p) => {
                const targets = this.findPlayers(o, p);
                if (targets.size() < 1) {
                    this.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
                    return;
                }
                for (const target of targets) {
                    if (target === o) {
                        this.sendPrivateMessage(o, "You can't kick yourself.", "color:255,43,43");
                        continue;
                    }
                    if (this.getPermissionLevel(target.UserId) >= this.getPermissionLevel(o.UserId)) {
                        this.sendPrivateMessage(o, "You can't kick someone with an equal/higher permission level.", "color:255,43,43");
                        continue;
                    }
                    this.sendPrivateMessage(o, `Kicked player ${target.Name}`, "color:138,255,138");
                    kaboom(target);
                    task.delay(1, () => {
                        if (target !== undefined) {
                            target.Kick("You were kicked by " + o.Name);
                        }
                    });
                }
            }, 2);

        this.createCommand("ban", "b",
            "<player> <useId: boolean> : Bans a player from the server.",
            (o, p, useId) => {
                const targets = this.findPlayers(o, p);
                if (targets.size() < 1) {
                    const userId = useId === "true" ? tonumber(p) : Players.GetUserIdFromNameAsync(p);
                    if (userId !== undefined) {
                        if (this.getPermissionLevel(userId) >= this.getPermissionLevel(o.UserId)) {
                            this.sendPrivateMessage(o, "You can't ban someone with an equal/higher permission level.", "color:255,43,43");
                            return;
                        }
                        const success = this.permissionService.add("banned", userId);
                        if (success) {
                            this.sendPrivateMessage(o, `Banned ${this.fp(p, userId)}`, "color:138,255,138");
                        }
                        else {
                            this.sendPrivateMessage(o, `${this.fp(p, userId)} is already banned`, "color:255,43,43");
                        }
                        return;
                    }
                    this.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
                    return;
                }
                for (const target of targets) {
                    if (target === o) {
                        this.sendPrivateMessage(o, "You can't ban yourself.", "color:255,43,43");
                        continue;
                    }
                    if (this.getPermissionLevel(target.UserId) >= this.getPermissionLevel(o.UserId)) {
                        this.sendPrivateMessage(o, "You can't ban someone with an equal/higher permission level.", "color:255,43,43");
                        continue;
                    }
                    this.sendPrivateMessage(o, `Banned player ${target.Name}`, "color:138,255,138");
                    const h = target.Character?.FindFirstChildOfClass("Humanoid");
                    if (h !== undefined && h.RootPart !== undefined) {
                        const smoke = new Instance("Smoke");
                        smoke.Size = 5;
                        smoke.TimeScale = 20;
                        smoke.Parent = h.RootPart;
                        const attachment = h.RootPart.FindFirstChild("LVAttachment") as Attachment ?? new Instance("Attachment", h.RootPart);
                        attachment.Name = "LVAttachment";
                        const vector = new Vector3(0, 300, 0);
                        const linearVelocity = new Instance("LinearVelocity");
                        linearVelocity.MaxForce = vector.Magnitude * 20000;
                        linearVelocity.VectorVelocity = vector;
                        linearVelocity.Attachment0 = attachment;
                        linearVelocity.Parent = attachment;
                        playSoundAtPart(h.RootPart, getSound("Rocket.mp3"));
                    }
                    this.permissionService.add("banned", target.UserId);
                    task.delay(1, () => {
                        if (target !== undefined) {
                            target.Kick(`You were banned by ${o.Name}`);
                        }
                    });
                }
            }, 2);

        this.createCommand("unban", "ub",
            "<player> <useId: boolean> : Unbans a player from the server.",
            (o, p, useId) => {
                const userId = this.id(p, useId);
                if (userId !== undefined) {
                    const success = this.permissionService.remove("banned", userId);
                    if (success) {
                        this.sendPrivateMessage(o, `Unbanned ${this.fp(p, userId)}`, "color:138,255,138");
                    }
                    else {
                        this.sendPrivateMessage(o, `${this.fp(p, userId)} is not banned`, "color:255,43,43");
                    }
                }
            }, 2);

        this.createCommand("trust", "t",
            "<player> <useId: boolean> : Trusts a player, giving them a permission level of 1.",
            (o, p, useId) => {
                const userId = this.id(p, useId);
                if (userId !== undefined) {
                    const success = this.permissionService.add("trusted", userId);
                    if (success) {
                        this.sendPrivateMessage(o, `Trusted ${this.fp(p, userId)}`, "color:138,255,138");
                    }
                    else {
                        this.sendPrivateMessage(o, `${this.fp(p, userId)} is already trusted`, "color:255,43,43");
                    }
                    this.updatePermissionLevel(userId);
                }
            }, 2);

        this.createCommand("untrust", "ut",
            "<player> <useId: boolean> : Untrusts a player, revoking both their trust and manager status.",
            (o, p, useId) => {
                const userId = this.id(p, useId);
                if (userId !== undefined) {
                    const success1 = this.permissionService.remove("trusted", userId);
                    const success2 = this.permissionService.remove("managers", userId);
                    if (success1 || success2) {
                        this.sendPrivateMessage(o, `Untrusted ${this.fp(p, userId)}`, "color:138,255,138");
                    }
                    else {
                        this.sendPrivateMessage(o, `${this.fp(p, userId)} is not trusted/a manager`, "color:255,43,43");
                    }
                    this.updatePermissionLevel(userId);
                }
            }, 2);

        this.createCommand("globalchat", "g",
            "Toggle on/off global chat.",
            () => {
                const empireData = this.dataService.empireData;
                const newSetting = !empireData.globalChat;
                empireData.globalChat = newSetting;
                this.sendServerMessage(`Global chat has been turned ${newSetting === true ? "on" : "off"}`);
            }, 2);

        this.createCommand("toggleparticles", "tglp",
            "Toggle particles emitted by newly placed items on or off.",
            () => {
                const empireData = this.dataService.empireData;
                const newSetting = !empireData.particlesEnabled;
                empireData.particlesEnabled = newSetting;
                this.itemService.refreshEffects();
                this.sendServerMessage(`Particles for newly placed items have been ${newSetting === true ? "enabled" : "disabled"}`);
            }, 2);

        this.createCommand("teleport", "tp",
            "<teleporter> <to> : Teleport players to a target player.",
            (o, p, t) => {
                const teleporters = this.findPlayers(o, p);
                const targets = this.findPlayers(o, t);
                const size = targets.size();
                if (size === 0) {
                    this.sendPrivateMessage(o, `No target called ${t} found`, "color:255,43,43");
                    return;
                }
                else if (size > 1) {
                    this.sendPrivateMessage(o, `Too many targets specified: ${t}`, "color:255,43,43");
                    return;
                }
                const target = targets[0];
                const destination = target.Character?.GetPivot();
                if (destination === undefined)
                    return;
                for (const teleporter of teleporters) {
                    if (this.getPermissionLevel(teleporter.UserId) > this.getPermissionLevel(o.UserId)) {
                        this.sendPrivateMessage(o, `You cannot teleport a player with a permission level higher than your own`, "color:255,43,43");
                        continue;
                    }
                    teleporter.Character?.PivotTo(destination);
                }
                this.sendPrivateMessage(o, `Teleported ${p} to ${t}`, "color:138,255,138");
            }, 2);

        this.createCommand("cleardroplets", "cd",
            "Delete ALL droplets in ALL areas.",
            (_o) => {
                for (const droplet of DROPLET_STORAGE.GetChildren())
                    if (droplet.IsA("BasePart"))
                        droplet.Destroy();
                this.sendServerMessage("Deleted all droplets");
            }, 2);


        // PERM LEVEL 3

        this.createCommand("manager", "man",
            "<player> <useId: boolean> : Appoints a player as a manager, giving them a permission level of 2.",
            (o, p, useId) => {
                const userId = this.id(p, useId);
                if (userId !== undefined) {
                    const success = this.permissionService.add("managers", userId);
                    if (success) {
                        this.sendPrivateMessage(o, `${this.fp(p, userId)} is now a manager`, "color:138,255,138");
                    }
                    else {
                        this.sendPrivateMessage(o, `${this.fp(p, userId)} is already a manager`, "color:255,43,43");
                    }
                    this.updatePermissionLevel(userId);
                }
            }, 3);

        const setPermLevel = (o: Player, perm: keyof (typeof this.dataService.empireData.permLevels), level: string) => {
            const lvl = tonumber(level);
            if (lvl === undefined) {
                this.sendPrivateMessage(o, `${level} is not a valid permission level`, "color:255,43,43");
                return;
            }
            else if (lvl > this.getPermissionLevel(o.UserId)) {
                this.sendPrivateMessage(o, `You cannot set a permission level higher than your own`, "color:255,43,43");
                return;
            }
            this.dataService.empireData.permLevels[perm] = math.min(3, lvl);
            Packets.permLevels.set(this.dataService.empireData.permLevels);
            this.sendServerMessage(`Permission level ${lvl} set for permission ${perm}`, "color:138,255,138");
        };
        this.createCommand("setbuildlvl", "bl",
            "<permlevel> : Sets the minimum permission level required to build.",
            (o, level) => setPermLevel(o, "build", level), 3);

        this.createCommand("setpurchaselevel", "pl",
            "<permlevel> : Sets the minimum permission level required to purchase items.",
            (o, level) => setPermLevel(o, "purchase", level), 3);

        this.createCommand("setresetlevel", "rl",
            "<permlevel> : Sets the minimum permission level required to reset.",
            (o, level) => setPermLevel(o, "reset", level), 3);

        // PERM LEVEL 4

        this.createCommand("sword", "sw",
            "Shank",
            (o) => {
                ASSETS.ClassicSword.Clone().Parent = o.FindFirstChildOfClass("Backpack");
            }, 4);

        this.createCommand("devwalkspeed", "dws",
            "<player> <amount> : Speeed.",
            (o, p, a) => {
                const walkspeed = tonumber(a) ?? 0;
                const players = this.findPlayers(o, p);
                for (const player of players) {
                    const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
                    if (humanoid !== undefined) {
                        humanoid.WalkSpeed = walkspeed;
                    }
                }
            }, 4);

        this.createCommand("setdonation", "setdonate",
            "<amount> : Set donation amount.",
            (o, a) => {
                this.donationService.setDonated(o, tonumber(a) ?? 0);
            }, 4);

        this.createCommand("updateleaderboards", "updatelbs",
            "Refreshes leaderboard stats.",
            () => {
                this.leaderboardService.debug = true;
                this.leaderboardService.updateLeaderboards();
                this.leaderboardService.debug = false;
            }, 4);

        this.createCommand("clearmostcurrencies", "cmc",
            "Clears all most currencies and leaderboard data of the server.",
            () => {
                this.dataService.empireData.mostCurrencies.clear();
                this.leaderboardService.updateLeaderboards();
            }, 4);

        this.createCommand("economyset", "ecoset",
            "<currency> <first> <second> : Set balance for a currency. You can type _ as a replacement for spaces.",
            (_o, currency, first, second) => {
                const amount = second === undefined ? new OnoeNum(tonumber(first) ?? 0) : OnoeNum.fromSerika(tonumber(first) ?? 0, tonumber(second) ?? 0);

                if (currency === "all") {
                    for (const [c, _] of pairs(CURRENCY_DETAILS)) {
                        this.currencyService.set(c as Currency, amount);
                        this.dataService.empireData.mostCurrencies.set(c as Currency, amount);
                    }
                    return;
                }

                currency = currency.gsub("_", " ")[0];
                if (CURRENCY_DETAILS[currency as Currency] === undefined)
                    return;
                this.currencyService.set(currency as Currency, amount);
                this.dataService.empireData.mostCurrencies.set(currency as Currency, amount);
            }, 4);

        this.createCommand("upgradeset", "upgset",
            "<upgrade> <amount> : Set the quantity for an upgrade.",
            (_o, upgrade, amount) => {
                this.namedUpgradeService.setUpgradeAmount(upgrade, tonumber(amount) ?? 0);
            }, 4);

        this.createCommand("itemset", "iset",
            "<item> <amount> : Set the quantity for an item.",
            (_o, item, amount) => {
                const a = tonumber(amount) ?? 0;
                const giveItem = (id: string) => {
                    this.itemService.setItemAmount(id, a);
                    this.itemService.setBoughtAmount(id, a);
                };
                if (item === "all") {
                    for (const [id, _] of Items.itemsPerId) {
                        giveItem(id);
                    }
                    return;
                }
                giveItem(item);
            }, 4);

        this.createCommand("itemall", "ia",
            "Give 99 of all items into the inventory and place 1 of each item. Should only be done in sandbox.",
            (_o) => {
                // spawn all item models
                for (const [id, item] of Items.itemsPerId) {
                    this.itemService.setBoughtAmount(id, 0);
                    this.itemService.setItemAmount(id, 99);

                    const primaryPart = item.MODEL?.PrimaryPart;
                    if (primaryPart === undefined)
                        continue;

                    this.itemService.serverPlace(id, primaryPart.Position, 0);
                }
            }, 4);

        this.createCommand("uniqueitem", "ui",
            "<item> <pot> : Give a unique item to the player. Specify pot value (0-100) to set a specific value for all pots.",
            (_o, item, pot) => {
                this.itemService.createUniqueInstance(item, tonumber(pot));
            }, 4);

        this.createCommand("chestopen", "chop",
            "<id> <amount> : Open a chest by its ID. Specify amount to roll a specific amount of times.",
            (_o, id, amount) => {
                this.chestService.openChest(id, tonumber(amount) ?? 5);
            }, 4);

        this.createCommand("levelset", "lset",
            "<amount> : Set the empire's level.",
            (_o, amount) => {
                const a = tonumber(amount) ?? 0;
                this.levelService.setLevel(a);
            }, 4);

        this.createCommand("xpset", "xset",
            "<amount> : Set the empire's XP.",
            (_o, amount) => {
                const a = tonumber(amount) ?? 0;
                this.levelService.setXp(a);
            }, 4);

        this.createCommand("stageset", "sset",
            "<quest> <stage> : Set the stage number for the quest.",
            (_o, questId, amount) => {
                const stagePerQuest = this.dataService.empireData.quests;
                if (stagePerQuest === undefined) {
                    return;
                }
                stagePerQuest.set(questId, tonumber(amount) ?? 0);
                this.questService.setStagePerQuest(stagePerQuest);
                this.questService.loadAvailableQuests();
            }, 4);

        this.createCommand("completequest", "cq",
            "<quest> : Complete a quest.",
            (_o, questId) => {
                const quest = Quest.getQuest(questId);
                if (quest === undefined) {
                    return;
                }
                this.questService.completeQuest(quest);
            }, 4);

        this.createCommand("unlockarea", "ula",
            "<area> : Unlock an area.",
            (_o, area) => {
                this.unlockedAreasService.unlockArea(area as AreaId);
            }, 4);

        this.createCommand("lockarea", "la",
            "<area> : Lock an area.",
            (_o, area) => {
                this.unlockedAreasService.lockArea(area as AreaId);
            }, 4);

        this.createCommand("colorstrictset", "csset",
            "<id> : Set the color for color strict items.",
            (_o, item) => ReplicatedStorage.SetAttribute("ColorStrictColor", tonumber(item) ?? 0), 4);

        this.createCommand("printdata", "pd",
            "Print game data to console.",
            (_o) => print(this.dataService.empireData), 4);

        this.createCommand("resetdata", "wipedata",
            "Reset all data like no progress was ever made.",
            () => {
                const attempts = (Workspace.GetAttribute("ResetAttempts") as number | undefined ?? 0) + 1;
                Workspace.SetAttribute("ResetAttempts", attempts);
                if (attempts === 1)
                    this.sendServerMessage("Are you sure you want to reset your data? Type /resetdata again to confirm.");
                else if (attempts === 2)
                    this.sendServerMessage("Yeah, but are you REALLY sure? Like, REALLY REALLY sure? You can't recover this data once it's gone.");
                else if (attempts === 3)
                    this.sendServerMessage("I'm saying that you gain nothing in return for doing this. Literally nothing.");
                else if (attempts === 4)
                    this.sendServerMessage("...");
                else if (attempts === 5)
                    this.sendServerMessage(".....");
                else if (attempts === 6)
                    this.sendServerMessage("If you say so. Type /resetdata 3 more times to confirm.");
                else if (attempts === 7)
                    this.sendServerMessage("Type /resetdata 2 more times to confirm.");
                else if (attempts === 8)
                    this.sendServerMessage("Type /resetdata 1 more time to confirm.");
                else if (attempts === 9) {
                    this.sendServerMessage("You have confirmed the data reset.");
                    task.delay(2, () => this.sendServerMessage("This world will cease to exist in 5 seconds."));
                    task.delay(4, () => this.sendServerMessage("Goodbye"));
                    task.delay(7, () => {
                        const players = Players.GetPlayers();
                        for (const player of players)
                            player.Kick("This world has collapsed.");
                    });
                }

            }, 4);

        this.createCommand("trueresetdata", "truewipedata",
            "Reset all data like no progress was ever made.",
            (_o) => {
                this.itemService.setPlacedItems(new Map());
                this.dataService.empireData.items.bought.clear();
                this.dataService.empireData.items.inventory.clear();
                this.dataService.empireData.items.inventory.set("ClassLowerNegativeShop", 1);
                this.itemService.fullUpdatePlacedItemsModels();
                this.currencyService.setAll(new Map());
                this.namedUpgradeService.setAmountPerUpgrade(new Map());
                this.playtimeService.setPlaytime(0);
                this.levelService.setLevel(1);
                this.levelService.setXp(0);
                this.questService.setStagePerQuest(new Map());
                this.sendServerMessage("True reset complete. The shop is in your inventory.");
            }, 4);

        this.createCommand("countparts", "getpartcount",
            "Get the part count of the current world.",
            () => {
                let i = 0;
                for (const part of Workspace.GetDescendants())
                    if (part.IsA("BasePart"))
                        i++;
                this.sendServerMessage("Part count: " + i);
            }, 4);

        this.createCommand("gamespeed", "gs",
            "Set how fast the game runs. Default is 1.",
            (_player, newSpeed) => {
                const speed = tonumber(newSpeed) ?? 1;
                this.sendServerMessage(`Changed speed to ${speed}. Old speed: ${GameSpeed.speed}`);
                GameSpeed.speed = speed;
            }, 4);

        this.createCommand("luckychance", "lc",
            "<chance> : Set the lucky droplet chance. 1000 = 1/1000 chance, 1 = every droplet is lucky, 0 = disabled.",
            (_player, newChance) => {
                const chance = tonumber(newChance) ?? 1000;
                if (chance < 0) {
                    this.sendServerMessage("Lucky droplet chance cannot be negative. Use 0 to disable.");
                    return;
                }
                this.sendServerMessage(`Changed lucky droplet chance to 1/${chance === 0 ? "disabled" : chance}. Old chance: 1/${Dropper.luckyChance === 0 ? "disabled" : Dropper.luckyChance}`);
                Dropper.luckyChance = chance;
            }, 4);

        this.createCommand("unduplicate", "undupe",
            "Unduplicate all items in the world.",
            (_player) => {
                this.dataService.dupeCheck(this.dataService.empireData.items);
                this.itemService.fullUpdatePlacedItemsModels();
            }, 4);

        this.createCommand("timeofday", "time",
            "<hours> : Set the hours after midnight",
            (_o, hours) => {
                Lighting.ClockTime = tonumber(hours) ?? 0;
            }, 4);

        this.createCommand("fling", "woosh",
            "<player> : Weeeeee",
            (o, p) => {
                const targets = this.findPlayers(o, p);
                if (targets.size() < 1) {
                    this.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
                    return;
                }
                const rng = new Random();
                for (const target of targets) {
                    const humanoid = target.Character?.FindFirstChildOfClass("Humanoid");
                    if (humanoid === undefined)
                        continue;
                    const rootPart = humanoid.RootPart!;
                    rootPart.PivotTo(rootPart.GetPivot().add(Vector3.yAxis));
                    rootPart.AssemblyLinearVelocity = rng.NextUnitVector().mul(5000);
                    rootPart.AssemblyAngularVelocity = rng.NextUnitVector().mul(5000);
                }
                this.sendPrivateMessage(o, `Flung players`, "color:138,255,138");
            }, 4);


        this.createCommand("zombies", "apocalypse",
            "Brains",
            (_o) => {
                const asset = ServerStorage.WaitForChild("Fun").WaitForChild("Zombie") as Model;
                for (let i = 0; i < 15; i++) {
                    for (const [_, area] of pairs(AREAS)) {
                        const spawnLocation = area.getSpawnLocation();
                        if (spawnLocation === undefined)
                            continue;
                        const zombie = asset.Clone();
                        const humanoid = zombie.FindFirstChildOfClass("Humanoid");
                        if (humanoid !== undefined)
                            humanoid.WalkSpeed = math.random(14, 26);
                        zombie.PivotTo(spawnLocation.CFrame.add(new Vector3(math.random(-45, 45), 0, math.random(-45, 45))));
                        zombie.Parent = Workspace;
                    }
                }
            }, 4);

        this.createCommand("testing", "test",
            "Enable/disable testing mode.",
            () => {
                const newSetting = !this.dataService.testing;
                this.dataService.testing = newSetting;
                this.sendServerMessage(`Testing mode has been turned ${newSetting === true ? "on" : "off"}`);
            }, 4);

        this.createCommand("markplaceableeverywhere", "mpe",
            "Make the specified item placeable everywhere.",
            (_player, itemId) => {
                Packets.modifyGame.fireAll("markplaceableeverywhere");
                Items.getItem(itemId)?.placeableEverywhere();
            }, 4);
    }
}