import { OnStart, Service } from "@flamework/core";
import { ContentProvider, MessagingService, Players, TextChatService } from "@rbxts/services";
import { Currency, DONATION_PRODUCTS } from "shared/constants";
import { Fletchette, RemoteSignal } from "shared/utils/fletchette";
import { playSoundAtPart } from "shared/utils/vrldk/BasePartUtils";
import { DonationService } from "./DonationService";
import { GameAssetService } from "./GameAssetService";
import { CurrencyService } from "./serverdata/CurrencyService";
import { DataService } from "./serverdata/DataService";
import { LeaderboardService } from "./LeaderboardService";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

declare global {
    interface FletchetteCanisters {
        PermissionsCanister: typeof PermissionsCanister;
    }
}

const PermissionsCanister = Fletchette.createCanister("PermissionsCanister", {
    systemMessageSent: new RemoteSignal<(channel: TextChannel, message: string, metadata?: string) => void>(),
    commandsGiven: new RemoteSignal<(commands: TextChatCommand[]) => void>(),
    donationGiven: new RemoteSignal<() => void>(),
});

type PermissionList = "banned" | "trusted" | "managers";

@Service()
export class PermissionsService implements OnStart {

    plrChannels = new Map<Player, TextChannel>();
    textChannels = TextChatService.WaitForChild("TextChannels") as Folder;
    rbxGeneral = this.textChannels.WaitForChild("RBXGeneral") as TextChannel;
    commands = TextChatService.WaitForChild("TextChatCommands");

    constructor(private dataService: DataService, private gameAssetService: GameAssetService, private donationService: DonationService, 
        private currencyService: CurrencyService, private leaderboardService: LeaderboardService) {

    }

    getList(list: PermissionList) {
        return this.dataService.empireProfile?.Data[list] ?? [];
    }

    setList(list: PermissionList, value: number[]) {
        if (this.dataService.empireProfile !== undefined) {
            this.dataService.empireProfile.Data[list] = value;
        }
    }

    add(list: PermissionList, userId: number) {
        const l = this.getList(list);
        if (l.includes(userId)) {
            return false;
        }
        l.push(userId);
        this.setList(list, l);
        return true;
    }

    remove(list: PermissionList, userId: number) {
        const l = this.getList(list);
        const n = new Array<number>();
        let removed = false;
        for (const b of l) {
            if (b !== userId) {
                n.push(b);
            }
            else {
                removed = true;
            }
        }
        this.setList(list, n);
        return removed;
    }

    getPermissionLevel(userId: number) {
        const data = this.dataService.empireProfile?.Data;
        if (data === undefined) {
            return -2;
        }
        else {
            const p = Players.GetPlayerByUserId(userId);
            if (p !== undefined && p.GetAttribute("Developer") === true) {
                return 4;
            }
        }
        if (data.owner === userId) {
            return 3;
        }
        else if (data.managers.includes(userId)) {
            return 2;
        }
        else if (data.trusted.includes(userId)) {
            return 1;
        }
        else if (data.banned.includes(userId)) {
            return 0;
        }
        return 0;
    }

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

    sendPrivateMessage(player: Player, message: string, metadata?: string) {
        const plrChannel = this.plrChannels.get(player);
        if (plrChannel !== undefined) {
            PermissionsCanister.systemMessageSent.fire(player, plrChannel, message, metadata);
        }
    }

    sendServerMessage(message: string, metadata?: string) {
        PermissionsCanister.systemMessageSent.fireAll(this.rbxGeneral, message, metadata);
    }

    fp(name: string, id: number) {
        return name + " (ID: " + id + ")";
    }

    id(p: string, useId: string) {
        return useId === "true" ? tonumber(p) : Players.GetUserIdFromNameAsync(p);
    }

    onStart() {
        const onPlayerAdded = (player: Player) => {
            if (this.dataService.empireProfile?.Data.banned.includes(player.UserId)) {
                player.Kick("You are banned from this empire.");
            }
            const plrChannel = new Instance("TextChannel");
            plrChannel.Name = player.Name;
            plrChannel.Parent = this.textChannels;
            plrChannel.AddUserAsync(player.UserId);
            plrChannel.SetAttribute("Color", Color3.fromRGB(82, 255, 105));
            player.SetAttribute("Developer", player.GetRankInGroup(10940445) > 1);
            this.plrChannels.set(player, plrChannel);
            this.sendPrivateMessage(player, "Your permission level is " + this.getPermissionLevel(player.UserId) + ". Type /help for a list of available commands.", "color:138,255,138");
        }
        Players.PlayerAdded.Connect((player) => onPlayerAdded(player));
        for (const player of Players.GetPlayers()) {
            onPlayerAdded(player);
        }

        const explosionSound = new Instance("Sound");
        explosionSound.SoundId = "rbxassetid://5801257793";
        const rocketSound = new Instance("Sound");
        rocketSound.SoundId = "rbxassetid://5801273676";
        task.spawn(() => ContentProvider.PreloadAsync([explosionSound, rocketSound]));
        this.createCommand("kick", "k", 
        "<player> : Kicks a player from the server.", 
        (o, p) => {
            const targets = this.findPlayers(o, p);
            if (targets.size() < 1) {
                this.sendPrivateMessage(o, "Could not find matching players " + p, "color:255,43,43");
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
                this.sendPrivateMessage(o, "Kicked player " + target.Name, "color:138,255,138");
                const explosion = new Instance("Explosion");
                explosion.ExplosionType = Enum.ExplosionType.NoCraters;
                explosion.DestroyJointRadiusPercent = 0;
                const h = target.Character?.FindFirstChildOfClass("Humanoid")
                if (h !== undefined && h.RootPart !== undefined) {
                    explosion.Position = h.RootPart.Position;
                    explosion.Parent = h.RootPart;
                    playSoundAtPart(h.RootPart, explosionSound);
                    h.TakeDamage(99999999);
                }
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
                    const success = this.add("banned", userId);
                    if (success) {
                        this.sendPrivateMessage(o, "Banned " + this.fp(p, userId), "color:138,255,138");
                    }
                    else {
                        this.sendPrivateMessage(o, this.fp(p, userId) + " is already banned", "color:255,43,43");
                    }
                    return;
                }
                this.sendPrivateMessage(o, "Could not find matching players " + p, "color:255,43,43");
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
                this.sendPrivateMessage(o, "Banned player " + target.Name, "color:138,255,138");
                const h = target.Character?.FindFirstChildOfClass("Humanoid")
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
                    playSoundAtPart(h.RootPart, rocketSound);
                }
                this.add("banned", target.UserId);
                task.delay(1, () => {
                    if (target !== undefined) {
                        target.Kick("You were banned by " + o.Name);
                    }
                });
            }
        }, 2);
        this.createCommand("unban", "ub", 
        "<player> <useId: boolean> : Unbans a player from the server.", 
        (o, p, useId) => {
            const userId = this.id(p, useId);
            if (userId !== undefined) {
                const success = this.remove("banned", userId);
                if (success) {
                    this.sendPrivateMessage(o, "Unbanned " + this.fp(p, userId), "color:138,255,138");
                }
                else {
                    this.sendPrivateMessage(o, this.fp(p, userId) + " is not banned", "color:255,43,43");
                }
            }
        }, 2);
        this.createCommand("trust", "t", 
        "<player> <useId: boolean> : Trusts a player, giving them a permission level of 1.",
        (o, p, useId) => {
            const userId = this.id(p, useId);
            if (userId !== undefined) {
                const success = this.add("trusted", userId);
                if (success) {
                    this.sendPrivateMessage(o, "Trusted " + this.fp(p, userId), "color:138,255,138");
                }
                else {
                    this.sendPrivateMessage(o, this.fp(p, userId) + " is already trusted", "color:255,43,43");
                }
            }
        }, 2);
        this.createCommand("manager", "man",
        "<player> <useId: boolean> : Appoints a player as a manager, giving them a permission level of 2.",
        (o, p, useId) => {
            const userId = this.id(p, useId);
            if (userId !== undefined) {
                const success = this.add("managers", userId);
                if (success) {
                    this.sendPrivateMessage(o, this.fp(p, userId) + " is now a manager", "color:138,255,138");
                }
                else {
                    this.sendPrivateMessage(o, this.fp(p, userId) + " is already a manager", "color:255,43,43");
                }
            }
        }, 3);
        this.createCommand("untrust", "ut", 
        "<player> <useId: boolean> : Untrusts a player, revoking both their trust and manager status.",
        (o, p, useId) => {
            const userId = this.id(p, useId);
            if (userId !== undefined) {
                const success1 = this.remove("trusted", userId);
                const success2 = this.remove("managers", userId);
                if (success1 || success2) {
                    this.sendPrivateMessage(o, "Untrusted " + this.fp(p, userId), "color:138,255,138");
                }
                else {
                    this.sendPrivateMessage(o, this.fp(p, userId) + " is not trusted/a manager", "color:255,43,43");
                }

            }
        }, 2);
        this.createCommand("help", "?", 
        ": Displays all available commands.",
        (o) => {
            this.sendPrivateMessage(o, "Your permission level is " + this.getPermissionLevel(o.UserId), "color:138,255,138");
            PermissionsCanister.commandsGiven.fire(o, this.commands.GetChildren().filter((command => command.IsA("TextChatCommand") && command.AutocompleteVisible)) as TextChatCommand[]);
        }, 0);

        this.createCommand("invite", "inv", 
        "<player> : Allows the specified player to join this empire.",
        (o, p, useId) => {
            const userId = this.id(p, useId);
            if (userId !== undefined && userId !== o.UserId) {
                const availableEmpires = this.dataService.getAvailableEmpires(userId);
                const empireId = this.dataService.getEmpireId();
                if (!availableEmpires.includes(empireId))
                    availableEmpires.push(empireId);
                this.dataService.setAvailableEmpires(userId, availableEmpires);
                this.dataService.unloadPlayerProfile(userId);
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
                const availableEmpires = this.dataService.getAvailableEmpires(userId);
                const empireId = this.dataService.getEmpireId();
                const nae = new Array<string>();
                let removed = false;
                for (const ei of availableEmpires) {
                    if (ei === empireId) {
                        removed = true;
                    }
                    else {
                        nae.push(ei);
                    }
                }
                this.dataService.setAvailableEmpires(userId, nae);
                this.dataService.unloadPlayerProfile(userId);
                if (removed === true) {
                    this.sendPrivateMessage(o, "Revoked " + this.fp(p, userId), "color:138,255,138");
                }
                else {
                    this.sendPrivateMessage(o, this.fp(p, userId) + " is not invited to the empire", "color:255,43,43");
                }
            }
        }, 1);

        this.createCommand("setdonation", "setdonate", 
        "<amount> : Set donation amount.",
        (o, a) => {
            this.donationService.setDonated(o, tonumber(a) ?? 0);
        }, 4);

        this.createCommand("updateleaderboards", "updatelbs", 
        "Refreshes leaderboard stats.",
        (o, a) => {
            this.leaderboardService.updateLeaderboards();
        }, 4);
    
        this.createCommand("economyset", "ecoset", 
        "<currency> <first> <second> : Set balance for a currency.",
        (_o, currency, first, second) => {
            this.currencyService.setCost(currency as Currency, new InfiniteMath([tonumber(first) ?? 0, tonumber(second) ?? 0]));
        }, 4);

        MessagingService.SubscribeAsync("Donation", (message) => {
            PermissionsCanister.donationGiven.fireAll();
            this.sendServerMessage("[GLOBAL]: " + message.Data, "tag:hidden;color:3,207,252");
        });
        
        for (const donationProduct of DONATION_PRODUCTS) {
            this.gameAssetService.setProductFunction(donationProduct.id, (_receipt, player) => {
                this.donationService.setDonated(player, this.donationService.getDonated(player) + donationProduct.amount);
                this.sendServerMessage("[SYSTEM]: " + player.Name + " JUST DONATED " + donationProduct.amount + " ROBUX!");
                if (donationProduct.amount >= 100) {
                    MessagingService.PublishAsync("Donation", player.Name + " JUST DONATED " + donationProduct.amount + " ROBUX!!!");
                }
                return Enum.ProductPurchaseDecision.PurchaseGranted;
            });
        }
    }
}