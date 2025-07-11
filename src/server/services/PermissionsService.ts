import { OnStart, Service } from "@flamework/core";
import { ContentProvider, Debris, MarketplaceService, MessagingService, Players, ReplicatedStorage, RunService, TeleportService, TextChatService } from "@rbxts/services";
import Price from "shared/Price";
import Quest from "shared/Quest";
import { AREAS, BOMBS_PRODUCTS, DONATION_PRODUCTS, Log, UI_ASSETS } from "shared/constants";
import { Fletchette, RemoteFunc, RemoteProperty, RemoteSignal } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { playSoundAtPart } from "shared/utils/vrldk/BasePartUtils";
import { AreaService } from "./AreaService";
import { BombsService } from "./BombsService";
import { DonationService } from "./DonationService";
import { GameAssetService } from "./GameAssetService";
import { LeaderboardService } from "./LeaderboardService";
import { ResetService } from "./ResetService";
import { CurrencyService } from "./serverdata/CurrencyService";
import { DataService } from "./serverdata/DataService";
import { ItemsService } from "./serverdata/ItemsService";
import { LevelService } from "./serverdata/LevelService";
import { PlaytimeService } from "./serverdata/PlaytimeService";
import { QuestsService } from "./serverdata/QuestsService";
import { UnlockedAreasService } from "./serverdata/UnlockedAreasService";
import { UpgradeBoardService } from "./serverdata/UpgradeBoardService";

declare global {
    interface FletchetteCanisters {
        PermissionsCanister: typeof PermissionsCanister;
    }
}

const PermissionsCanister = Fletchette.createCanister("PermissionsCanister", {
    permLevels: new RemoteProperty<{[key: string]: number}>({}),
    getLogs: new RemoteFunc<() => Log[]>(),
    logAdded: new RemoteSignal<(log: Log) => void>(),
    systemMessageSent: new RemoteSignal<(channel: TextChannel, message: string, metadata?: string) => void>(),
    codeReceived: new RemoteSignal<(code: string) => void>(),
    tabOpened: new RemoteSignal<(tab: string) => void>(),
    donationGiven: new RemoteSignal<() => void>(),
    promptDonation: new RemoteSignal<(donationId: number) => void>(),
});

type PermissionList = "banned" | "trusted" | "managers";

@Service()
export class PermissionsService implements OnStart {

    plrChannels = new Map<Player, TextChannel>();
    textChannels = TextChatService.WaitForChild("TextChannels") as Folder;
    rbxGeneral = this.textChannels.WaitForChild("RBXGeneral") as TextChannel;
    commands = TextChatService.WaitForChild("TextChatCommands");

    constructor(private dataService: DataService, private gameAssetService: GameAssetService, private donationService: DonationService, 
        private currencyService: CurrencyService, private leaderboardService: LeaderboardService, private upgradeBoardService: UpgradeBoardService,
        private itemsService: ItemsService, private playtimeService: PlaytimeService, private areaService: AreaService, private levelService: LevelService,
        private questsService: QuestsService, private unlockedAreasService: UnlockedAreasService, private resetService: ResetService, 
        private bombsService: BombsService) {

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
            return -4;
        }
        if (game.PlaceId === 16438564807) {
            return 4;
        }
        else {
            const p = Players.GetPlayerByUserId(userId);
            if (p !== undefined && p.GetAttribute("Developer") === true) {
                return 4;
            }
        }
        const restrictedTime = data.restricted.get(userId);
        if (restrictedTime !== undefined) {
            if (restrictedTime > tick()) {
                return -1;
            }
            else {
                data.restricted.delete(userId);
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
            return -2;
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
        p = p.gsub("@", "")[0];
        return useId === "true" ? tonumber(p) : Players.GetUserIdFromNameAsync(p);
    }

    updatePermissionLevel(userId: number) {
        const target = Players.GetPlayerByUserId(userId);
        const permLevel = this.getPermissionLevel(userId);
        if (target !== undefined) {
            target.SetAttribute("PermissionLevel", permLevel);
        }
        return permLevel;
    }
    
    log(log: Log) {
        const profile = this.dataService.empireProfile;
        if (profile === undefined) {
            return;
        }
        profile.Data.logs = profile.Data.logs.filter((value) => tick() - value.time < 604800);
        profile.Data.logs.push(log);
        PermissionsCanister.logAdded.fireAll(log);
    }

    onStart() {
        const onPlayerAdded = (player: Player) => {
            const joinData = player.GetJoinData();
            if (joinData.LaunchData !== undefined && joinData.LaunchData !== this.dataService.empireProfile?.Data.accessCode) {
                TeleportService.TeleportToPrivateServer(15783753029, joinData.LaunchData, [player]);
            }
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
            const permLevel = this.updatePermissionLevel(player.UserId);
            this.sendPrivateMessage(player, `Your permission level is ${permLevel}. Type /help for a list of available commands.`, "color:138,255,138");
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

        MessagingService.SubscribeAsync("Donation", (message) => {
            PermissionsCanister.donationGiven.fireAll();
            this.sendServerMessage("[GLOBAL]: " + message.Data, "tag:hidden;color:3,207,252");
        });

        PermissionsCanister.promptDonation.connect((p, dp) => MarketplaceService.PromptProductPurchase(p, dp));
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
        for (const [currency, bombProduct] of pairs(BOMBS_PRODUCTS)) {
            this.gameAssetService.setProductFunction(bombProduct, () => {
                this.currencyService.incrementCost(currency + " Bombs" as Currency, new InfiniteMath(4));
                return Enum.ProductPurchaseDecision.PurchaseGranted;
            });
        }
        if (this.dataService.empireProfile !== undefined) {
            PermissionsCanister.permLevels.set(this.dataService.empireProfile.Data.permLevels);
        }
        this.dataService.empireProfileLoaded.connect((profile) => {
            PermissionsCanister.permLevels.set(profile.Data.permLevels);
        });
        PermissionsCanister.getLogs.onInvoke(() => this.dataService.empireProfile?.Data.logs);
        this.itemsService.itemsBought.connect((player, items) => this.log({
            time: tick(),
            type: "Purchase",
            player: player.UserId,
            items: items.map((item) => item.id),
        }));
        this.bombsService.bombUsed.connect((player, bombType) => this.log({
            time: tick(),
            type: "Bomb",
            player: player.UserId,
            currency: bombType,
            amount: 1
        }));
        this.gameAssetService.itemPlaced.connect((player, placedItem) => this.log({
            time: tick(),
            type: "Place",
            player: player.UserId,
            item: placedItem.item,
            x: placedItem.posX,
            y: placedItem.posY,
            z: placedItem.posZ,
        }));
        this.gameAssetService.itemsUnplaced.connect((player, placedItems) => {
            const time = tick();
            let i = 0;
            for (const placedItem of placedItems) {
                this.log({
                    time: time + (++i / 1000), // not a hack i swear
                    type: "Unplace",
                    player: player.UserId,
                    item: placedItem.item,
                    x: placedItem.posX,
                    y: placedItem.posY,
                    z: placedItem.posZ,
                });
            }
        });
        this.upgradeBoardService.upgradeBought.connect((player, upgrade, to) => this.log({
            time: tick(),
            type: "Upgrade",
            player: player.UserId,
            upgrade: upgrade,
            amount: to,
        }));
        this.levelService.respected.connect((player) => this.log({
            time: tick(),
            type: "Respec",
            player: player.UserId
        }));
        this.resetService.reset.connect((player, layer, amount, currency) => {
            const color = Price.DETAILS_PER_CURRENCY[currency].color;
            this.sendServerMessage(`${player.Name} performed a ${layer} for ${Price.getFormatted(currency, amount)}`, `color:${color.R*255},${color.G*255},${color.B*255}`);
            this.log({
                time: tick(),
                type: "Reset",
                layer: layer,
                player: player.UserId,
                infAmount: amount,
                currency: currency
            });
        });
        this.gameAssetService.setupSaved.connect((player, area) => this.log({
            time: tick(),
            type: "SetupSave",
            player: player.UserId,
            area: area
        }));
        this.gameAssetService.setupLoaded.connect((player, area) => this.log({
            time: tick(),
            type: "SetupLoad",
            player: player.UserId,
            area: area
        }));

        //
        // Commands
        //

        // PERM LEVEL 0

        this.createCommand("help", "?", 
        "Displays all available commands.",
        (o) => {
            this.sendPrivateMessage(o, `Your permission level is ${this.getPermissionLevel(o.UserId)}`, "color:138,255,138");
            PermissionsCanister.tabOpened.fire(o, "Commands");
        }, 0);

        this.createCommand("join", "j", 
        "<accesscode> : Joins an empire given an access code.",
        (o, accessCode) => {
            TeleportService.TeleportToPrivateServer(15783753029, accessCode, [o]);
        }, 0);

        this.createCommand("logs", "log", 
        "Open the log window, where activities from every player are recorded.",
        (o) => {
            PermissionsCanister.tabOpened.fire(o, "Logs");
        }, 0);

        this.createCommand("voterestrict", "vr", 
        "<player> : Vote to restrict a player.", 
        (o, p) => {
            const targets = this.findPlayers(o, p);
            if (targets.size() < 1) {
                this.sendPrivateMessage(o, `Could not find matching players ${p}`, "color:255,43,43");
                return;
            }
            const profile = this.dataService.empireProfile;
            if (profile === undefined) {
                return;
            }
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
                Debris.AddItem(voteToken, 30);
                task.delay(30, () => {
                    if (target === undefined) {
                        return;
                    }
                    target.SetAttribute("Votes", target.GetAttribute("Votes") as number - 1);
                    if (target.GetAttribute("RestrictionTime") as number ?? 0 < tick()) {
                        this.sendPrivateMessage(o, `Your vote to restrict ${target.Name} has worn off.`, "color:138,255,138");
                    }
                });
                this.sendPrivateMessage(o, `Voted to restrict ${target.Name}. Your vote will wear off after 30 seconds.`, "color:138,255,138");
                if (votes >= requirement) {
                    this.sendServerMessage(`${target.Name} has been restricted for 5 minutes.`, "color:138,255,138");
                    profile.Data.restricted.set(userId, tick() + 360);
                    task.delay(360, () => {
                        profile.Data.restricted.delete(userId);
                        this.updatePermissionLevel(userId);
                    });
                    this.updatePermissionLevel(userId);
                }
            }
        }, 0);

        this.createCommand("empireid", "ei", 
        "View the empire ID for this empire. Only useful for diagnostics.",
        (o) => {
            if (this.dataService.empireProfile !== undefined) {
                const id = this.dataService.getEmpireId();
                this.sendPrivateMessage(o, "The empire ID is: " + id);
                PermissionsCanister.codeReceived.fire(o, id);
            }
            else {
                this.sendPrivateMessage(o, "You cannot use this command on this server", "color:255,43,43");
            }
        }, 1);

        // PERM LEVEL 1

        this.createCommand("invite", "inv", 
        "<player> : Allows the specified player to join this empire.",
        (o, p, useId) => {
            const userId = this.id(p, useId);
            if (userId !== undefined && userId !== o.UserId) {
                if (game.PrivateServerOwnerId === 0 && game.PrivateServerId !== "") {
                    this.sendPrivateMessage(o, "You cannot use /invite in this server", "color:255,43,43");
                    return;
                }
                const availableEmpires = this.dataService.getAvailableEmpires(userId);
                const empireId = this.dataService.getEmpireId();
                if (availableEmpires.includes(empireId)) {
                    this.sendPrivateMessage(o, `${this.fp(p, userId)} is already invited`, "color:255,43,43");
                    return;
                }
                availableEmpires.push(empireId);
                this.dataService.setAvailableEmpires(userId, availableEmpires);
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
                if (removed === true) {
                    this.sendPrivateMessage(o, `Revoked ${this.fp(p, userId)}`, "color:138,255,138");
                }
                else {
                    this.sendPrivateMessage(o, `${this.fp(p, userId)} is not invited to the empire`, "color:255,43,43");
                }
            }
        }, 1);

        this.createCommand("accesscode", "ac", 
        "View the access code for this empire. Anyone with the access code is able to join this empire. Only available for private empires.",
        (o) => {
            if ((RunService.IsStudio() || (game.PrivateServerOwnerId === 0 && game.PrivateServerId !== "")) && this.dataService.empireProfile !== undefined) {
                const code = this.dataService.empireProfile.Data.accessCode;
                this.sendPrivateMessage(o, "The server access code is: " + code);
                PermissionsCanister.codeReceived.fire(o, code);
            }
            else {
                this.sendPrivateMessage(o, "You cannot use this command on this server", "color:255,43,43");
            }
        }, 1);

        this.createCommand("joinlink", "jl", 
        "Gets a URL in which players can use to join this empire. Utilises the empire's access code. Only available for private empires.",
        (o) => {
            if (RunService.IsStudio() || (game.PrivateServerOwnerId === 0 && game.PrivateServerId !== "")) {
                const joinLink = "https://www.roblox.com/games/start?placeId=" + game.PlaceId + "&launchData=" + this.dataService.empireProfile?.Data.accessCode;
                this.sendPrivateMessage(o, "Join link: " + joinLink);
                PermissionsCanister.codeReceived.fire(o, joinLink);
            }
            else {
                this.sendPrivateMessage(o, "You cannot use this command on this server", "color:255,43,43");
            }
        }, 1);

        this.createCommand("unplaceall", "ua", 
        "Unplace all items in the area you are currently in.",
        (o) => {
            const area = this.areaService.getArea(o);
            this.gameAssetService.unplaceItems(o, this.itemsService.getPlacedItems().filter(value => value.area === area).map(value => value.placementId ?? "default"));
            this.sendPrivateMessage(o, `Unplaced all items in ${AREAS[area].name}`, "color:138,255,138");
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
            const profile = this.dataService.empireProfile;
            if (profile === undefined) {
                return;
            }
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
                profile.Data.restricted.set(userId, restrictionTime);
                task.delay(duration * 60, () => {
                    profile.Data.restricted.delete(userId);
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
            const profile = this.dataService.empireProfile;
            if (profile === undefined) {
                return;
            }
            for (const target of targets) {
                const userId = target.UserId;
                if (profile.Data.restricted.delete(userId)) {
                    this.sendPrivateMessage(o, `Unrestricted player ${target.Name}`, "color:138,255,138");
                    this.updatePermissionLevel(userId);
                }
                else {
                    this.sendPrivateMessage(o, `${target.Name} is not restricted`, "color:255,43,43");
                }
            }
        }, 2);

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
                const explosion = new Instance("Explosion");
                explosion.ExplosionType = Enum.ExplosionType.NoCraters;
                explosion.DestroyJointRadiusPercent = 0;
                explosion.BlastRadius = 0;
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
                const success = this.remove("banned", userId);
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
                const success = this.add("trusted", userId);
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
                const success1 = this.remove("trusted", userId);
                const success2 = this.remove("managers", userId);
                if (success1 || success2) {
                    this.sendPrivateMessage(o, `Untrusted ${this.fp(p, userId)}`, "color:138,255,138");
                }
                else {
                    this.sendPrivateMessage(o, `${this.fp(p, userId)} is not trusted/a manager`, "color:255,43,43");
                }
                this.updatePermissionLevel(userId);
            }
        }, 2);

        // PERM LEVEL 3

        this.createCommand("manager", "man",
        "<player> <useId: boolean> : Appoints a player as a manager, giving them a permission level of 2.",
        (o, p, useId) => {
            const userId = this.id(p, useId);
            if (userId !== undefined) {
                const success = this.add("managers", userId);
                if (success) {
                    this.sendPrivateMessage(o, `${this.fp(p, userId)} is now a manager`, "color:138,255,138");
                }
                else {
                    this.sendPrivateMessage(o, `${this.fp(p, userId)} is already a manager`, "color:255,43,43");
                }
                this.updatePermissionLevel(userId);
            }
        }, 3);

        this.createCommand("setbuildlvl", "bl",
        "<permlevel> : Sets the minimum permission level required to build.",
        (o, level) => {
            const lvl = tonumber(level);
            if (lvl === undefined || this.dataService.empireProfile === undefined) {
                this.sendPrivateMessage(o, `${level} is not a valid permission level`, "color:255,43,43");
                return;
            }
            this.dataService.empireProfile.Data.permLevels.build = lvl;
            PermissionsCanister.permLevels.set(this.dataService.empireProfile.Data.permLevels);
            this.sendServerMessage(`Building now requires permission level ${lvl}`, "color:138,255,138");
        }, 3);

        this.createCommand("setpurchaselevel", "pl",
        "<permlevel> : Sets the minimum permission level required to purchase items.",
        (o, level) => {
            const lvl = tonumber(level);
            if (lvl === undefined || this.dataService.empireProfile === undefined) {
                this.sendPrivateMessage(o, `${level} is not a valid permission level`, "color:255,43,43");
                return;
            }
            this.dataService.empireProfile.Data.permLevels.purchase = lvl;
            PermissionsCanister.permLevels.set(this.dataService.empireProfile.Data.permLevels);
            this.sendServerMessage(`Purchasing now requires permission level ${lvl}`, "color:138,255,138");
        }, 3);

        this.createCommand("setresetlevel", "rl",
        "<permlevel> : Sets the minimum permission level required to reset.",
        (o, level) => {
            const lvl = tonumber(level);
            if (lvl === undefined || this.dataService.empireProfile === undefined) {
                this.sendPrivateMessage(o, `${level} is not a valid permission level`, "color:255,43,43");
                return;
            }
            this.dataService.empireProfile.Data.permLevels.reset = lvl;
            PermissionsCanister.permLevels.set(this.dataService.empireProfile.Data.permLevels);
            this.sendServerMessage(`Resetting now requires permission level ${lvl}`, "color:138,255,138");
        }, 3);

        // PERM LEVEL 4

        this.createCommand("sword", "sw", 
        "Shank",
        (o) => {
            UI_ASSETS.ClassicSword.Clone().Parent = o.FindFirstChildOfClass("Backpack");
        }, 4);

        this.createCommand("walkspeed", "ws", 
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
            this.leaderboardService.updateLeaderboards();
        }, 4);
    
        this.createCommand("economyset", "ecoset", 
        "<currency> <first> <second> : Set balance for a currency. You can type _ as a replacement for spaces.",
        (_o, currency, first, second) => {
            this.currencyService.setCost((currency.gsub("_", " ")[0]) as Currency, 
                second === undefined ? new InfiniteMath(tonumber(first) ?? 0) : new InfiniteMath([tonumber(first) ?? 0, tonumber(second) ?? 0]));
        }, 4);

        this.createCommand("upgradeset", "upgset", 
        "<upgrade> <amount> : Set the quantity for an upgrade.",
        (_o, upgrade, amount) => {
            this.upgradeBoardService.setUpgradeAmount(upgrade, tonumber(amount) ?? 0);
        }, 4);

        this.createCommand("itemset", "iset", 
        "<item> <amount> : Set the quantity for an item.",
        (_o, item, amount) => {
            const a = tonumber(amount) ?? 0;
            this.itemsService.setItemAmount(item, a);
            this.itemsService.setBoughtAmount(item, a);
        }, 4);

        this.createCommand("levelset", "lset", 
        "<level> : Set the empire's level.",
        (_o, amount) => {
            const a = tonumber(amount) ?? 0;
            this.levelService.setLevel(a);
        }, 4);

        this.createCommand("xpset", "xset", 
        "<xp> : Set the empire's XP.",
        (_o, amount) => {
            const a = tonumber(amount) ?? 0;
            this.levelService.setXp(a);
        }, 4);

        this.createCommand("stageset", "sset", 
        "<quest> <stage> : Set the stage number for the quest.",
        (_o, questId, amount) => {
            const stagePerQuest = this.questsService.getStagePerQuest();
            if (stagePerQuest === undefined) {
                return;
            }
            stagePerQuest.set(questId, tonumber(amount) ?? 0);
            this.questsService.setStagePerQuest(stagePerQuest);
            this.gameAssetService.loadAvailableQuests();
        }, 4);

        this.createCommand("completequest", "cq", 
        "<quest> : Complete a quest.",
        (_o, questId) => {
            const quest = Quest.getQuest(questId);
            if (quest === undefined) {
                return;
            }
            this.gameAssetService.completeQuest(quest);
        }, 4);

        this.createCommand("unlockarea", "ula", 
        "<area> : Unlock an area.",
        (_o, area) => {
            this.unlockedAreasService.unlockArea(area as keyof (typeof AREAS));
        }, 4);

        this.createCommand("lockarea", "la", 
        "<area> : Lock an area.",
        (_o, area) => {
            this.unlockedAreasService.lockArea(area as keyof (typeof AREAS));
        }, 4);

        this.createCommand("colorstrictset", "csset", 
        "<id> : Set the color for color strict items.",
        (_o, item) => ReplicatedStorage.SetAttribute("ColorStrictColor", tonumber(item) ?? 0), 4);

        this.createCommand("trueresetdata", "truewipedata", 
        "Reset all data like no progress was ever made.",
        (_o) => {
            this.itemsService.setPlacedItems([]);
            this.itemsService.setBought(new Map());
            this.itemsService.setInventory(new Map([["ClassLowerNegativeShop", 1]]));
            this.gameAssetService.fullUpdatePlacedItemsModels();
            this.currencyService.setBalance(new Price());
            this.upgradeBoardService.setAmountPerUpgrade({});
            this.playtimeService.setPlaytime(0);
            this.levelService.setLevel(1);
            this.levelService.setXp(0);
            this.questsService.setStagePerQuest(new Map());
            this.sendServerMessage("True reset complete. The shop is in your inventory.");
        }, 4);
    }
}