import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { convertToHHMMSS, playSoundAtPart, spawnExplosion } from "@antivivi/vrldk";
import { OnInit, Service } from "@flamework/core";
import { Debris, Lighting, MarketplaceService, MessagingService, Players, ReplicatedStorage, RunService, ServerStorage, TeleportService, TextChatService, TextService, Workspace } from "@rbxts/services";
import Quest from "server/Quest";
import { AreaService } from "server/services/AreaService";
import { BombsService } from "server/services/BombsService";
import { DonationService } from "server/services/DonationService";
import { GameAssetService } from "server/services/GameAssetService";
import { LeaderboardService } from "server/services/LeaderboardService";
import { OnPlayerJoined } from "server/services/ModdingService";
import { ResetService } from "server/services/ResetService";
import { CurrencyService } from "server/services/serverdata/CurrencyService";
import { DataService } from "server/services/serverdata/DataService";
import { ItemsService } from "server/services/serverdata/ItemsService";
import { LevelService } from "server/services/serverdata/LevelService";
import { PlaytimeService } from "server/services/serverdata/PlaytimeService";
import { QuestsService } from "server/services/serverdata/QuestsService";
import { SetupService } from "server/services/serverdata/SetupService";
import { UnlockedAreasService } from "server/services/serverdata/UnlockedAreasService";
import { UpgradeBoardService } from "server/services/serverdata/UpgradeBoardService";
import { AREAS } from "shared/Area";
import { IS_SINGLE_SERVER, getNameFromUserId, getTextChannels } from "shared/constants";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import { BOMBS_PRODUCTS } from "shared/devproducts/BombsProducts";
import { DONATION_PRODUCTS } from "shared/devproducts/DonationProducts";
import { ASSETS, getSound } from "shared/GameAssets";
import GameSpeed from "shared/GameSpeed";
import { DROPLET_STORAGE } from "shared/item/Droplet";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import BasicCondenser from "shared/items/negative/felixthea/BasicCondenser";
import AdvancedCondenser from "shared/items/negative/skip/AdvancedCondenser";
import BasicCharger from "shared/items/negative/trueease/BasicCharger";
import Packets from "shared/Packets";
import { RESET_LAYERS } from "shared/ResetLayer";
import Sandbox from "shared/Sandbox";

declare global {
    type Log = {
        time: number,
        type: string,
        player?: number,
        recipient?: number,
        x?: number,
        y?: number,
        z?: number,
        area?: string,
        upgrade?: string,
        item?: string,
        items?: string[],
        layer?: string,
        amount?: number,
        currency?: Currency,
        infAmount?: BaseOnoeNum;
    };

    interface Assets {
        ClassicSword: Tool;
    }
}

type PermissionList = "banned" | "trusted" | "managers";

@Service()
export class PermissionsService implements OnInit, OnPlayerJoined {

    plrChannels = new Map<Player, TextChannel>();
    commands = TextChatService.WaitForChild("TextChatCommands");

    constructor(private dataService: DataService, private gameAssetService: GameAssetService, private donationService: DonationService,
        private currencyService: CurrencyService, private leaderboardService: LeaderboardService, private upgradeBoardService: UpgradeBoardService,
        private itemsService: ItemsService, private playtimeService: PlaytimeService, private areaService: AreaService, private levelService: LevelService,
        private questsService: QuestsService, private unlockedAreasService: UnlockedAreasService, private resetService: ResetService,
        private bombsService: BombsService, private setupService: SetupService) {

    }

    getList(list: PermissionList) {
        return this.dataService.empireData[list] ?? [];
    }

    setList(list: PermissionList, value: number[]) {
        this.dataService.empireData[list] = value;
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
        const data = this.dataService.empireData;
        if (this.dataService.testing) {
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
            Packets.systemMessageSent.fire(player, plrChannel.Name, message, metadata ?? "");
        }
    }

    sendServerMessage(message: string, metadata?: string) {
        const rbxGeneral = getTextChannels().WaitForChild("RBXGeneral") as TextChannel;
        Packets.systemMessageSent.fireAll(rbxGeneral.Name, message, metadata ?? "");
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
        const data = this.dataService.empireData;
        data.logs = data.logs.filter((value) => tick() - value.time < 604800);
        data.logs.push(log);
        Packets.logAdded.fireAll(log);
    }

    getAccessCode() {
        return this.dataService.empireData.accessCode + "|" + this.dataService.empireId;
    }

    onPlayerJoined(player: Player) {
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
        const plrChannel = new Instance("TextChannel");
        plrChannel.Name = player.Name;
        plrChannel.Parent = getTextChannels();
        plrChannel.AddUserAsync(player.UserId);
        plrChannel.SetAttribute("Color", Color3.fromRGB(82, 255, 105));
        player.SetAttribute("Developer", player.GetRankInGroup(10940445) > 252);
        this.plrChannels.set(player, plrChannel);
        const permLevel = this.updatePermissionLevel(player.UserId);
        this.sendPrivateMessage(player, `Your permission level is ${permLevel}. Type /help for a list of available commands.`, "color:138,255,138");
        let counter = 0;
        player.Chatted.Connect((message) => {
            if (this.dataService.empireData.globalChat === true && message.sub(1, 1) !== "/") {
                ++counter;
                task.delay(5, () => --counter);
                if (counter > 5) {
                    return;
                }
                task.spawn(() => {
                    MessagingService.PublishAsync("GlobalChat", { player: player.UserId, message: TextService.FilterStringAsync(message, player.UserId).GetNonChatStringForBroadcastAsync() });
                });
            }
        });
    }

    onInit() {

        MessagingService.SubscribeAsync("Donation", (message) => {
            Packets.donationGiven.fireAll();
            this.sendServerMessage(message.Data as string, "color:3,207,252");
        });
        MessagingService.SubscribeAsync("GlobalChat", (message) => {
            if (this.dataService.empireData.globalChat !== true)
                return;
            const data = message.Data as { player: number, message: string; };
            if (this.dataService.empireData.blocking.has(data.player))
                return;
            for (const player of Players.GetPlayers()) {
                if (player.UserId === data.player) {
                    return;
                }
            }
            const name = getNameFromUserId(data.player);
            this.sendServerMessage(`${name}:  ${data.message}`, "tag:hidden;color:180,180,180;");
        });

        Packets.promptDonation.listen((player, dp) => MarketplaceService.PromptProductPurchase(player, dp));
        for (const donationProduct of DONATION_PRODUCTS) {
            this.gameAssetService.setProductFunction(donationProduct.id, (_receipt, player) => {
                this.donationService.setDonated(player, this.donationService.getDonated(player) + donationProduct.amount);
                this.sendServerMessage(player.Name + " JUST DONATED " + donationProduct.amount + " ROBUX!");
                if (donationProduct.amount >= 100) {
                    MessagingService.PublishAsync("Donation", player.Name + " JUST DONATED " + donationProduct.amount + " ROBUX!!!");
                }
                return Enum.ProductPurchaseDecision.PurchaseGranted;
            });
        }
        for (const [currency, bombProduct] of pairs(BOMBS_PRODUCTS)) {
            this.gameAssetService.setProductFunction(bombProduct, () => {
                this.currencyService.increment(currency + " Bombs" as Currency, new OnoeNum(4));
                return Enum.ProductPurchaseDecision.PurchaseGranted;
            });
        }
        this.bombsService.bombActive.connect((endTime, bombType, player) => {
            this.sendServerMessage(getNameFromUserId(player) + " just activated a " + bombType + " for " + convertToHHMMSS(endTime - os.time()) + "!");
        });

        Packets.permLevels.set(this.dataService.empireData.permLevels);
        const compensateItem = (item: Item) => {
            const placedItems = this.dataService.empireData.items.worldPlaced;
            let placed = 0;
            for (const [_, placedItem] of placedItems) {
                if (placedItem.item === item.id)
                    ++placed;
            }
            const inInv = this.itemsService.getItemAmount(item.id);
            const bought = this.itemsService.getBoughtAmount(item.id);
            if (bought > inInv + placed) {
                const given = bought - placed;
                this.itemsService.setItemAmount(item.id, inInv + given);
                this.sendServerMessage("You have been given " + given + " " + item.name + "(s) in return for item cost changes.");
                print("gave " + given + " " + item.id);
            }
        };
        compensateItem(BasicCharger);
        compensateItem(AdvancedCondenser);
        compensateItem(BasicCondenser);
        const setups = this.dataService.empireData.printedSetups;
        task.spawn(() => {
            while (task.wait(1)) {
                const balance = this.currencyService.balance;
                for (const setup of setups) {
                    if (setup.alerted === false && setup.autoloads === true && balance.canAfford(setup.calculatedPrice)) {
                        setup.alerted = true;
                        this.sendServerMessage(`${setup.name} can now be purchased!`, "color:255,255,127");
                    }
                }
            }
        });

        Packets.getLogs.onInvoke(() => this.dataService.empireData.logs);
        this.gameAssetService.questItemGiven.connect((itemId, amount) => this.sendServerMessage(`[+${amount} ${Items.getItem(itemId)?.name}]`, "tag:hidden;color:255,170,255"));
        this.gameAssetService.questItemTaken.connect((itemId, amount) => this.sendServerMessage(`[-${amount} ${Items.getItem(itemId)?.name}]`, "tag:hidden;color:255,170,255"));

        //
        // Logs
        //
        this.itemsService.itemsBought.connect((player, items) => this.log({
            time: tick(),
            type: "Purchase",
            player: player?.UserId,
            items: items.map((item) => item.id),
        }));
        this.bombsService.bombUsed.connect((player, bombType) => this.log({
            time: tick(),
            type: "Bomb",
            player: player.UserId,
            currency: bombType,
            amount: 1
        }));
        this.itemsService.itemsPlaced.connect((player, placedItems) => {
            const time = tick();
            let i = 0;
            for (const placedItem of placedItems) {
                this.log({
                    time: time + (++i / 1000), // not a hack i swear
                    type: "Place",
                    player: player.UserId,
                    item: placedItem.item,
                    x: placedItem.posX,
                    y: placedItem.posY,
                    z: placedItem.posZ,
                });
            }
        });
        this.itemsService.itemsUnplaced.connect((player, placedItems) => {
            const time = tick();
            let i = 0;
            for (const placedItem of placedItems) {
                this.log({
                    time: time + (++i / 1000),
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
        this.resetService.reset.connect((player, layer, amount) => {
            const resetLayer = RESET_LAYERS[layer];
            const color = CURRENCY_DETAILS[resetLayer.gives].color;
            this.sendServerMessage(`${player.Name} performed a ${layer} for ${CurrencyBundle.getFormatted(resetLayer.gives, amount)}`, `color:${color.R * 255},${color.G * 255},${color.B * 255}`);
            this.log({
                time: tick(),
                type: "Reset",
                layer: layer,
                player: player.UserId,
                infAmount: amount,
                currency: resetLayer.gives
            });
        });
        this.setupService.setupSaved.connect((player, area) => this.log({
            time: tick(),
            type: "SetupSave",
            player: player.UserId,
            area: area,
        }));
        this.setupService.setupLoaded.connect((player, area) => this.log({
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
                    const code = this.getAccessCode();
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
                    const joinLink = "https://www.roblox.com/games/start?placeId=" + game.PlaceId + "&launchData=" + this.getAccessCode();
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

                this.itemsService.unplaceItems(o, toRemove);
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
                playSoundAtPart(h.RootPart, getSound("Explosion"));
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
                        playSoundAtPart(h.RootPart, getSound("Rocket"));
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
                this.itemsService.refreshEffects();
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
                this.upgradeBoardService.setUpgradeAmount(upgrade, tonumber(amount) ?? 0);
            }, 4);

        this.createCommand("itemset", "iset",
            "<item> <amount> : Set the quantity for an item.",
            (_o, item, amount) => {
                const a = tonumber(amount) ?? 0;
                this.itemsService.setItemAmount(item, a);
                this.itemsService.setBoughtAmount(item, a);
            }, 4);

        this.createCommand("itemall", "ia",
            "Give 99 of all items into the inventory and place 1 of each item. Should only be done in sandbox.",
            (_o) => {
                // spawn all item models
                for (const [id, item] of Items.itemsPerId) {
                    this.itemsService.setBoughtAmount(id, 0, true);
                    this.itemsService.setItemAmount(id, 99, true);

                    const primaryPart = item.MODEL?.PrimaryPart;
                    if (primaryPart === undefined)
                        continue;

                    this.itemsService.serverPlace(id, primaryPart.Position, 0);
                }
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
                const stagePerQuest = this.dataService.empireData.quests;
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
                this.itemsService.setPlacedItems(new Map());
                this.itemsService.setBought(new Map());
                this.itemsService.setInventory(new Map([["ClassLowerNegativeShop", 1]]));
                this.itemsService.fullUpdatePlacedItemsModels();
                this.currencyService.setAll(new Map());
                this.upgradeBoardService.setAmountPerUpgrade(new Map());
                this.playtimeService.setPlaytime(0);
                this.levelService.setLevel(1);
                this.levelService.setXp(0);
                this.questsService.setStagePerQuest(new Map());
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

        this.createCommand("fix", "fix",
            "debug command",
            (_player) => {
                const items = this.dataService.dupeCheck(this.dataService.empireData.items);

                this.itemsService.setItems(items);
                this.itemsService.fullUpdatePlacedItemsModels();
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