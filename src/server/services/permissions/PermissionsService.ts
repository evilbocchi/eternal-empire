/**
 * @fileoverview PermissionsService - Manages player permissions, moderation, and command handling.
 * 
 * This service is responsible for:
 * - Managing permission levels (banned, trusted, managers, owner, etc.)
 * - Handling player moderation (ban, kick, restrict, trust, etc.)
 * - Registering and processing chat commands with permission checks
 * - Logging player/server actions for auditing
 * - Integrating with other services for data, items, upgrades, and more
 * - Broadcasting server and private messages
 * - Handling global chat and related features
 * 
 * Acts as the central authority for all permission and moderation logic in the game.
 * 
 * @since 1.0.0
 */

import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { convertToHHMMSS, playSoundAtPart, spawnExplosion } from "@antivivi/vrldk";
import { OnInit, Service } from "@flamework/core";
import { Debris, Lighting, MarketplaceService, MessagingService, Players, ReplicatedStorage, RunService, ServerStorage, TeleportService, TextChatService, TextService, Workspace } from "@rbxts/services";
import Quest from "server/Quest";
import { AreaService } from "server/services/world/AreaService";
import { BombsService } from "server/services/BombsService";
import { ChestService } from "server/services/world/ChestService";
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
    interface Log {
        time: number;
        type: string;
        player?: number;
        recipient?: number;
        x?: number;
        y?: number;
        z?: number;
        area?: string;
        upgrade?: string;
        item?: string;
        items?: string[];
        layer?: string;
        amount?: number;
        currency?: Currency;
        infAmount?: BaseOnoeNum;
    }

    interface Assets {
        ClassicSword: Tool;
    }
}

type PermissionList = "banned" | "trusted" | "managers";

/**
 * Service for managing player permissions, moderation, and command registration.
 * 
 * Handles permission lists, player moderation actions, command creation, and logging.
 * Integrates with other services for data, items, upgrades, and messaging.
 */
@Service()
export class PermissionsService implements OnInit, OnPlayerJoined {

    plrChannels = new Map<Player, TextChannel>();

    /**
     * Constructs the PermissionsService with all required dependencies.
     */
    constructor(private dataService: DataService, private gameAssetService: GameAssetService, private donationService: DonationService,
        private currencyService: CurrencyService, private leaderboardService: LeaderboardService, private upgradeBoardService: UpgradeBoardService,
        private itemsService: ItemsService, private playtimeService: PlaytimeService, private areaService: AreaService, private levelService: LevelService,
        private questsService: QuestsService, private unlockedAreasService: UnlockedAreasService, private resetService: ResetService,
        private bombsService: BombsService, private setupService: SetupService, private chestService: ChestService) {

    }

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
            }
            else {
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

    /**
     * Sends a private system message to a player.
     * @param player Target player
     * @param message Message text
     * @param metadata Optional message metadata
     */
    sendPrivateMessage(player: Player, message: string, metadata?: string) {
        const plrChannel = this.plrChannels.get(player);
        if (plrChannel !== undefined) {
            Packets.systemMessageSent.fire(player, plrChannel.Name, message, metadata ?? "");
        }
    }

    /**
     * Sends a system message to the server's general chat.
     * @param message Message text
     * @param metadata Optional message metadata
     */
    sendServerMessage(message: string, metadata?: string) {
        const rbxGeneral = getTextChannels().WaitForChild("RBXGeneral") as TextChannel;
        Packets.systemMessageSent.fireAll(rbxGeneral.Name, message, metadata ?? "");
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
     * Logs an action to the empire log and broadcasts to clients.
     * @param log Log entry
     */
    log(log: Log) {
        const data = this.dataService.empireData;
        data.logs = data.logs.filter((value) => tick() - value.time < 604800);
        data.logs.push(log);
        Packets.logAdded.fireAll(log);
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

    /**
     * Initializes the PermissionsService, sets up commands and event handlers.
     */
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
    }
}