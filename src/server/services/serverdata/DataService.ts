//!native
//!optimize 2

/**
 * @fileoverview DataService - Core data management service for empires and players.
 * 
 * This service handles:
 * - Empire and player data loading/saving via ProfileService
 * - Empire creation and management
 * - Player teleportation between empires
 * - Data validation and corruption fixes
 * - Permission checking
 * - DataStore management for available empires
 * 
 * The service supports both public servers and private empire servers,
 * with different initialization logic for each type.
 * 
 * @since 1.0.0
 */

import Difficulty from "@antivivi/jjt-difficulties";
import { Profile } from "@antivivi/profileservice/globals";
import { BaseOnoeNum, OnoeNum } from "@antivivi/serikanum";
import { ProfileManager } from "@antivivi/vrldk";
import { OnInit, Service } from "@flamework/core";
import { BadgeService, DataStoreService, HttpService, MarketplaceService, Players, RunService, TeleportService, Workspace } from "@rbxts/services";
import { OnPlayerJoined } from "server/services/ModdingService";
import { IS_SERVER, IS_SINGLE_SERVER, getNameFromUserId, getStartCamera, isStartScreenEnabled } from "shared/constants";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Item from "shared/item/Item";
import ItemCounter from "shared/item/ItemCounter";
import type Shop from "shared/item/traits/Shop";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";

declare global {
    /**
     * Represents an item that has been placed in the world.
     */
    interface PlacedItem {
        /**
         * The ID of the item that has been placed.
         */
        item: string;

        /**
         * The X value of the position in the world.
         */
        posX: number;

        /**
         * The Y value of the position in the world.
         */
        posY: number;

        /**
         * The Z value of the position in the world.
         */
        posZ: number;

        /**
         * The rotation value around the X axis in degrees.
         */
        rotX: number;

        /**
         * The rotation value around the Y axis in degrees.
         */
        rotY: number;

        /**
         * The rotation value around the Z axis in degrees.
         */
        rotZ: number;

        /**
         * The rotation value in degrees.
         */
        rawRotation?: number;

        /**
         * The ID of the placement, used to identify the item in the world.
         * 
         * This is automatically generated when the item is placed.
         */
        area?: string;

        /**
         * The ID of the placement, used to identify the item in the world.
         * 
         * This is automatically generated when the item is placed.
         */
        meta?: PlacedItemMetadata;
    }

    /**
     * Metadata for a placed item.
     * 
     * Use this to store additional information about the item, such as its state or configuration.
     */
    interface PlacedItemMetadata {

    }

    type Inventory = Map<string, number>;

    /**
     * Represents the data structure of a player's items.
     */
    interface ItemsData {
        /**
         * The inventory of the player, containing item IDs and their respective amounts.
         */
        inventory: Inventory;

        /**
         * The items that the player has bought. Used to fetch the price of items in {@link Shop} items.
         */
        bought: Inventory;

        /**
         * The items that the player has placed in the world.
         * @deprecated Use `worldPlaced` instead.
        */
        placed: PlacedItem[];

        /**
         * The items that the player has placed in the world, mapped by their placement ID.
         * 
         * This is used to identify items in the world and allows for easy access to their properties.
         */
        worldPlaced: Map<string, PlacedItem>;

        /**
         * The next ID to use for a placed item.
         */
        nextId: number;
    }

    /**
     * Represents the information about an empire that is exposed to the client.
     */
    interface EmpireInfo {
        /**
         * The name of the empire.
         */
        name: string;
        /**
         * The ID of the owner of the empire.
         */
        owner: number;
        /**
         * The number of placed items in the empire.
         */
        items: number;
        /**
         * The UNIX timestamp when the empire was created.
         */
        created: number;
        /**
         * The total playtime of the empire in seconds.
         */
        playtime: number;
    }

    /**
     * Client-side settings for the player.
     */
    type Settings = typeof PlayerProfileTemplate.settings;

    /**
     * Represents the data structure of an empire profile.
     */
    type EmpireData = typeof EmpireProfileTemplate;

    /**
     * Represents the keys for each permission to manage an empire.
     */
    type PermissionKey = keyof EmpireData["permLevels"];
}

/**
 * Default empire profile. Use this to create new empire profiles.
 */
export const EmpireProfileTemplate = {
    // General

    /**
     * The name of the empire.
     */
    name: "no name",

    /**
     * The ID of the owner of the empire.
     */
    owner: 0,

    /**
     * The UNIX timestamp when the empire was created.
     */
    created: 0,

    /**
     * The total playtime of the empire in seconds.
     */
    playtime: 0,

    /**
     * The longest session that the empire has had, in seconds.
     */
    longestSession: 0,

    /**
     * The last session that the empire has had in UNIX timestamp.
     */
    lastSession: 0,

    /**
     * The code that can be used to access the reserved server of this empire.
     * 
     * @see {@link TeleportService.TeleportToPrivateServer} for using the access code.
     */
    accessCode: "",

    // Management

    managers: new Array<number>(),
    trusted: new Array<number>(),
    restricted: new Map<number, number>(),
    banned: new Array<number>(),
    logs: new Array<Log>(),
    permLevels: {
        build: 0,
        purchase: 0,
        reset: 0,
    },
    globalChat: true,
    particlesEnabled: true,
    blocking: new Set<number>(),

    // Gameplay
    level: 1,
    xp: 0,
    quests: new Map<string, number>(),
    openedChests: new Map<string, number>(),
    upgrades: new Map<string, number>(),
    completedEvents: new Set<string>(),
    questMetadata: new Map<string, unknown>(),
    unlockedAreas: new Set<AreaId>(["BarrenIslands"]),
    currencies: new Map<Currency, BaseOnoeNum>(),
    mostCurrencies: new Map<Currency, BaseOnoeNum>(),
    mostCurrenciesSinceReset: new Map<Currency, BaseOnoeNum>(),
    lastReset: 0,
    challenges: new Map<string, number>(),
    currentChallenge: undefined as string | undefined,
    currentChallengeStartTime: 0,
    challengeBestTimes: new Map<string, number>(),
    items: {
        inventory: new Map<string, number>(),
        bought: new Map<string, number>(),
        worldPlaced: new Map<string, PlacedItem>(),
        nextId: 0,
    } as ItemsData,
    backup: {
        currencies: undefined as CurrencyMap | undefined,
        upgrades: undefined as Map<string, number> | undefined,
    },

    /** @deprecated */
    savedItems: new Map<AreaId, Array<PlacedItem>>(),
    printedSetups: new Array<Setup>(),
    nameChanges: 0,
    previousNames: new Set<string>()
};

export const PlayerProfileTemplate = {
    /**
     * List of empire IDs that this player has access to.
     * @deprecated Use DataStore-based available empires instead.
     */
    availableEmpires: undefined as Array<string> | undefined,

    /**
     * List of empire IDs that this player owns.
     */
    ownedEmpires: new Array<string>(),

    /**
     * Player's client-side settings and preferences.
     */
    settings: {
        ScientificNotation: false,
        hotkeys: {} as { [key: string]: number; },
        ResetAnimation: true,
        BuildAnimation: true,
        CurrencyGainAnimation: true,
        FormatCurrencies: true,
        Music: true,
        SoundEffects: true,
        HideMaxedItems: false
    },

    /**
     * Whether the player has used the portal feature.
     */
    usedPortal: false,

    /**
     * Raw number of purifier clicks the player has made.
     */
    rawPurifierClicks: 0,

    /**
     * Amount the player has donated (in Robux).
     */
    donated: 0,
};

/**
 * Default player profile template. Use this to create new player profiles.
 * Contains player-specific settings and data that persist across empires.
 */

// Cache start camera and screen state for performance
const START_CAMERA = getStartCamera();
const START_SCREEN_ENABLED = isStartScreenEnabled();

/**
 * Main data service responsible for managing empire and player data.
 * Handles data loading, saving, empire creation, teleportation, and permissions.
 */
@Service()
export default class DataService implements OnInit, OnPlayerJoined {

    // Profile Managers

    /**
     * Manages empire data profiles using ProfileService.
     */
    readonly empireProfileManager = new ProfileManager("EmpireData", EmpireProfileTemplate);

    /**
     * Manages player data profiles using ProfileService.
     */
    readonly playerProfileManager = new ProfileManager("PlayerData", PlayerProfileTemplate);

    // Data Stores and Caches

    /**
     * DataStore for tracking which empires each player has access to.
     */
    availableEmpiresStore = DataStoreService.GetDataStore("AvailableEmpires");

    /**
     * Cache of available empires per player to reduce DataStore calls.
     */
    availableEmpiresPerPlayer = new Map<number, Map<string, EmpireInfo>>();

    /**
     * Cache of loaded empire profiles to prevent duplicate loads.
     */
    cachedEmpireProfiles = new Map<string, Profile<EmpireData>>();

    // Server State

    /**
     * Whether this server is a public server (not private/reserved).
     */
    isPublicServer = IS_SERVER && game.PrivateServerId === "" && (!RunService.IsStudio() || START_SCREEN_ENABLED === true);

    /**
     * Debounce timer for empire creation to prevent spam.
     */
    debounce = 0;

    /**
     * Whether this is the testing environment.
     */
    testing = game.PlaceId === 16438564807;

    /**
     * Cache of maximum item amounts for dupe checking.
     */
    maxItemAmounts = new Map<string, number>();

    /** Empire profile for the current server. */
    empireProfile!: Profile<EmpireData>;

    /**
     * Lazy-loaded information about the current empire and server state.
     * Initializes empire profile, performs data migrations, and fixes data corruption.
     */
    readonly loadedInformation = (() => {
        let empireId: string;

        // Determine empire ID based on server type and environment
        if (!RunService.IsStudio() || START_SCREEN_ENABLED === true) { // production protocol
            if (IS_SINGLE_SERVER) {
                empireId = "SingleServer";
            }
            else if (this.isPublicServer) {
                empireId = game.JobId;
            }
            else {
                // Wait for at least one player to join to get teleport data
                while (Players.GetPlayers().size() < 1) {
                    task.wait();
                }
                const player = Players.GetPlayers()[0];
                const tpData = player.GetJoinData().TeleportData as string;
                empireId ??= tpData === undefined ? game.PrivateServerId : tpData;
            }
        }
        else {
            // Studio environment - get ID from start camera
            empireId = (START_CAMERA.WaitForChild("Id") as StringValue).Value;
        }

        if (empireId === undefined)
            throw "Could not load empire ID";

        const empireProfile = this.loadEmpireProfile(empireId, !IS_SERVER); // view the profile if not on server. absence of server means testing environment
        if (empireProfile === undefined)
            throw "Could not load empire";

        const empireData = empireProfile.Data;

        // Set default names for public servers
        if (this.isPublicServer === true)
            empireData.name = IS_SINGLE_SERVER ? "Single Server" : "Public Server";

        // Initialize empire name if not set
        if (empireData.previousNames.size() === 0 && IS_SERVER) {
            if (game.PrivateServerOwnerId === 0) {
                empireData.name = getNameFromUserId(empireData.owner) + "'s Empire";
            }
            else {
                empireData.owner = game.PrivateServerOwnerId;
                empireData.name = getNameFromUserId(game.PrivateServerOwnerId) + "'s Private Server";
            }
        }

        // Migration: Convert old InfiniteMath to OnoeNum currency system
        for (const [currency, value] of empireData.currencies) {
            if (CURRENCY_DETAILS[currency] === undefined) {
                // Remove currencies that no longer exist
                empireData.currencies.delete(currency);
                empireData.mostCurrencies.delete(currency);
                continue;
            }
            const v = value as OnoeNum & { first?: number, second?: number; };
            if (v.first !== undefined && v.second !== undefined)
                empireData.currencies.set(currency, OnoeNum.fromSerika(v.first, v.second));
            else {
                const fixed = new OnoeNum(value);
                if (fixed.mantissa !== fixed.mantissa) { // nan check
                    fixed.mantissa = 0;
                    fixed.exponent = 0;
                }
                empireData.currencies.set(currency, fixed);
            }
        }
        // Convert most currencies as well
        for (const [currency, value] of empireData.mostCurrencies) {
            const v = value as OnoeNum & { first?: number, second?: number; };
            if (v.first !== undefined && v.second !== undefined)
                empireData.mostCurrencies.set(currency, OnoeNum.fromSerika(v.first, v.second));
        }

        // Migration: Convert old placed items array to new worldPlaced map
        const items = empireData.items;
        if (items.placed !== undefined) {
            for (const placedItem of items.placed) {
                items.worldPlaced.set(((placedItem as unknown) as { placementId: string; }).placementId ?? tostring(++items.nextId), placedItem);
            }
            items.placed = [];
        }

        // Perform dupe checking unless in sandbox mode
        if (!Sandbox.getEnabled()) // ignore sandbox for dupes
            this.dupeCheck(items);

        // Migration: Convert legacy printer setups to new system
        const old = empireData.savedItems.get("SlamoVillage");
        if (old !== undefined) {
            empireData.savedItems.delete("SlamoVillage");
            let totalPrice = new CurrencyBundle();
            let itemCount = new Map<Item, number>();
            for (const placedItem of old) {
                const item = Items.getItem(placedItem.item);
                if (item === undefined)
                    continue;
                let currentItemCount = (itemCount.get(item) ?? 0) + 1;
                const price = item.pricePerIteration.get(currentItemCount);
                if (price !== undefined)
                    totalPrice = totalPrice.add(price);
                itemCount.set(item, currentItemCount);
            }
            empireData.printedSetups.push({
                name: "Setup 1",
                area: "SlamoVillage",
                calculatedPrice: totalPrice.amountPerCurrency,
                autoloads: false,
                alerted: false,
                items: old
            });
        }

        // Data integrity: Ensure every empire has a shop
        let hasShop = false;
        const placedItems = items.worldPlaced;
        for (const [_, placedItem] of placedItems)
            if (placedItem.item === "ClassLowerNegativeShop") {
                hasShop = true;
                break;
            }
        if (hasShop === false) {
            const inventory = items.inventory;
            const amount = inventory.get("ClassLowerNegativeShop");
            if (amount === undefined || amount === 0) {
                items.worldPlaced.set("STARTING", {
                    item: "ClassLowerNegativeShop",
                    posX: 16.5,
                    posY: 3.5,
                    posZ: 0,
                    rotX: 0,
                    rotY: 0,
                    rotZ: 0,
                    area: "BarrenIslands"
                });
                warn("gave shop");
            }
        }

        // Data cleanup: Remove illegal challenge runs
        if (!empireData.completedEvents.has("RemoveIllegalChallenges")) {
            let removed = false;
            const a1 = empireData.challenges.get("MeltingEconomy");
            if (a1 !== undefined && a1 > 3) {
                removed = true;
                empireData.challenges.set("MeltingEconomy", 3);
                empireData.upgrades.set("MeltingEconomy_rw", 3);
            }
            const a2 = empireData.challenges.get("PinnedProgress");
            if (a2 !== undefined && a2 > 2) {
                removed = true;
                empireData.challenges.set("PinnedProgress", 2);
                empireData.upgrades.set("PinnedProgress_rw", 2);
            }
            if (removed === true) {
                items.inventory.set("SadnessInMyHeart", 1);
                Packets.systemMessageSent.fireAll("RBXGeneral", "An extreme apology to you. A hotfix was applied to challenges to fix a major bug, and your challenge stats have been affected. An item has been placed in your inventory.", "");
            }
            empireData.completedEvents.add("RemoveIllegalChallenges");
        }

        // Data limits: Trim excessive printed setups and logs
        if (empireData.printedSetups.size() > 50) {
            const newPrintedSetups = new Array<Setup>();
            for (let i = 0; i < 50; i++) {
                newPrintedSetups.push(empireData.printedSetups[i]);
            }
            empireData.printedSetups = newPrintedSetups;
            Packets.systemMessageSent.fireAll("RBXGeneral", "We noticed that you have more than 50 printed setups in your save. Please refrain from adding too many, as you could exceed the 4MB data limit and corrupt your save. Your printed setups have been trimmed.", "");
        }

        if (empireData.logs.size() > 2000) {
            empireData.logs = [];
        }
        empireData.lastSession = tick();
        if (empireData.lastReset === 0) {
            empireData.lastReset = tick();
        }

        this.empireProfile = empireProfile;
        return { empireData, empireId };
    })();

    /**
     * The loaded empire data for the current server.
     * Directly references the empire profile data, so changes will affect the profile.
     */
    readonly empireData = this.loadedInformation.empireData;

    /** The empire ID for the current server. */
    readonly empireId = this.loadedInformation.empireId;

    /**
     * Fix duped items and bad bought amounts.
     * 
     * @param items Data to fix.
     * @returns Fixed data.
     */
    dupeCheck(items: ItemsData) {
        Items.itemsPerId.forEach((item: Item) => {
            if (item.defaultPrice !== undefined) // buy limit is uncapped, dont check
                return;

            const itemId = item.id;
            const [invCount, placedCount] = ItemCounter.getAmounts(items.inventory, items.worldPlaced, itemId);
            const totalCount = invCount + placedCount;

            let max = this.maxItemAmounts.get(itemId);
            if (max === undefined) {
                max = -1;
                for (const [amount, _] of item.pricePerIteration)
                    if (amount > max)
                        max = amount;

                this.maxItemAmounts.set(itemId, max);
            }

            if (max === -1 || totalCount <= max)
                return;

            // this is the point where there are clearly more items than allowed. remove the excess
            const diff = totalCount - max;
            const fromInvCount = math.min(diff, invCount);
            warn("Removing", fromInvCount, itemId);
            items.inventory.set(itemId, invCount - fromInvCount);

            const remaining = diff - fromInvCount;
            if (remaining > 0) { // if there isnt enough in inventory to remove, remove from placed items
                print("Removing", remaining, itemId, "from placed items");
                let removed = 0;
                for (const [placementId, placedItem] of items.worldPlaced) {
                    if (placedItem.item === itemId) {
                        items.worldPlaced.delete(placementId);
                        if (++removed >= remaining) {
                            return;
                        }
                    }
                }
            }
        });

        // fix bad bought
        const addAmount = (list: Map<string, number>, itemId: string, amount: number) => {
            list.set(itemId, (list.get(itemId) ?? 0) + amount);
        };

        const baseAmounts = new Map<string, number>();
        for (const [_, placedItem] of items.worldPlaced)
            addAmount(baseAmounts, placedItem.item, 1);
        for (const [itemId, amount] of items.inventory)
            addAmount(baseAmounts, itemId, amount);

        const nestCheck = (base: Map<string, number>, item: Item, amount?: number) => {
            if (amount === undefined)
                return;
            for (const [subItem, requiredAmount] of item.requiredItems) {
                const totalAmount = requiredAmount * amount;
                addAmount(base, subItem.id, totalAmount);
                nestCheck(base, subItem, totalAmount);
            }
        };
        const addedAmounts = new Map<string, number>();
        for (const [itemId, item] of Items.itemsPerId) {
            nestCheck(addedAmounts, item, baseAmounts.get(itemId));
        }
        for (const [itemId, item] of Items.itemsPerId) {
            if (item.isA("HarvestingTool") || item.pricePerIteration.size() === 0 || item.difficulty === Difficulty.Excavation)
                continue;

            const amount = (addedAmounts.get(itemId) ?? 0) + (baseAmounts.get(itemId) ?? 0);
            if (amount < 0)
                continue;

            const cached = items.bought.get(itemId) ?? 0;
            if (cached !== amount) {
                warn(itemId, "has", cached, "bought, found", amount);
                items.bought.set(itemId, amount);
            }
        }
        return items;
    }

    /**
     * Saves an empire profile to the DataStore.
     * 
     * @param empireId The ID of the empire to save.
     * @returns Whether the save was successful.
     */
    saveEmpireProfile(empireId: string) {
        const key = "Empire_" + empireId;
        return this.empireProfileManager.save(key);
    }

    /**
     * Loads an empire profile from the DataStore.
     * 
     * @param empireId The ID of the empire to load.
     * @param view Whether to load in view-only mode (read-only).
     * @returns The loaded empire profile, or undefined if not found.
     */
    loadEmpireProfile(empireId: string, view?: boolean) {
        const key = "Empire_" + empireId;
        return view ? this.empireProfileManager.view(key) : this.empireProfileManager.load(key);
    }

    /**
     * Unloads an empire profile from memory.
     * 
     * @param empireId The ID of the empire to unload.
     * @returns Whether the unload was successful.
     */
    unloadEmpireProfile(empireId: string) {
        return this.empireProfileManager.unload("Empire_" + empireId);
    }

    /**
     * Creates a new empire for a player.
     * Checks permissions, gamepass ownership, and generates a new empire with reserved server.
     * 
     * @param player The player requesting to create an empire.
     * @returns Whether the empire was successfully created.
     */
    createNewEmpire(player: Player) {
        if (tick() - this.debounce < 0.5 || IS_SINGLE_SERVER) {
            return false;
        }
        this.debounce = tick();
        const playerProfile = this.loadPlayerProfile(player.UserId);
        if (playerProfile === undefined)
            throw "wtf";
        const playerData = playerProfile.Data;

        let ownedEmpireCount = playerData.ownedEmpires.size();
        if (ownedEmpireCount > 3 && !MarketplaceService.UserOwnsGamePassAsync(player.UserId, 73544443675113)) {
            return false;
        }

        const empireId = HttpService.GenerateGUID(false);
        const newProfile = this.loadEmpireProfile(empireId);
        if (newProfile !== undefined) {
            newProfile.AddUserId(player.UserId);
            let name = player.DisplayName + "'s Empire";
            if (ownedEmpireCount > 0)
                name += " " + (ownedEmpireCount + 1);
            newProfile.Data.name = name;
            newProfile.Data.owner = player.UserId;
            newProfile.Data.created = tick();
            const [success, result] = pcall(() => {
                const [accessCode] = TeleportService.ReserveServer(game.PlaceId);
                return accessCode;
            });
            if (success === true) {
                newProfile.Data.accessCode = result;
            }
            else if (!RunService.IsStudio()) {
                return false;
            }
            playerData.ownedEmpires.push(empireId);
            this.addAvailableEmpire(player.UserId, empireId);
            this.unloadEmpireProfile(empireId);
            return true;
        }
        return false;
    }

    /**
     * Teleports a player to their empire's private server.
     * 
     * @param player The player to teleport.
     * @param empireId The ID of the empire to teleport to.
     * @returns Whether the teleport was successful.
     */
    teleportToEmpire(player: Player, empireId: string) {
        const profile = this.loadEmpireProfile(empireId, true);
        if (profile && profile.Data.accessCode) {
            TeleportService.TeleportToPrivateServer(game.PlaceId, profile.Data.accessCode, [player], undefined, empireId);
            return true;
        }
        return false;
    }

    /**
     * Gets the list of empires a player has access to.
     * Uses caching to reduce DataStore calls.
     * 
     * @param userId The user ID to get available empires for.
     * @returns Map of empire IDs to empire information.
     */
    getAvailableEmpires(userId: number): Map<string, EmpireInfo> {
        const cached = this.availableEmpiresPerPlayer.get(userId);
        if (cached !== undefined) {
            return cached;
        }
        const key = "Player_" + userId;
        const result = this.availableEmpiresStore.GetAsync(key);
        let data = result === undefined ? undefined : result[0];
        data ??= new Map<string, EmpireInfo>();

        if ((data as string[])[0] !== undefined) {
            const mapped = new Map<string, EmpireInfo>();
            for (const empireId of (data as string[]))
                mapped.set(empireId, this.getInfo(empireId));
            task.spawn(() => this.availableEmpiresStore.SetAsync(key, mapped));
            this.availableEmpiresPerPlayer.set(userId, mapped);
            return mapped;
        }

        this.availableEmpiresPerPlayer.set(userId, data as Map<string, EmpireInfo>);
        return data as Map<string, EmpireInfo>;
    }

    /**
     * Updates the available empires for a player both in cache and client.
     * 
     * @param userId The user ID to update.
     * @param availableEmpires The new available empires map.
     */
    updateAvailableEmpires(userId: number, availableEmpires: Map<string, EmpireInfo>) {
        this.availableEmpiresPerPlayer.set(userId, availableEmpires);
        const plr = Players.GetPlayerByUserId(userId);
        if (plr !== undefined) {
            Packets.availableEmpires.setFor(plr, availableEmpires);
        }
    }

    /**
     * Adds an empire to a player's available empires list.
     * 
     * @param userId The user ID to add the empire for.
     * @param empire The empire ID to add.
     */
    addAvailableEmpire(userId: number, empire: string) {
        const [availableEmpires] = this.availableEmpiresStore.UpdateAsync("Player_" + userId, (oldValue: Map<string, EmpireInfo> | undefined) => {
            if (oldValue === undefined) {
                return $tuple(new Map([[empire, this.getInfo(empire)]]));
            }
            if (oldValue.has(empire)) {
                return $tuple(oldValue);
            }
            oldValue.set(empire, this.getInfo(empire));
            return $tuple(oldValue);
        });
        if (availableEmpires !== undefined) {
            this.updateAvailableEmpires(userId, availableEmpires);
        }
    }

    /**
     * Removes an empire from a player's available empires list.
     * 
     * @param userId The user ID to remove the empire for.
     * @param empire The empire ID to remove.
     */
    removeAvailableEmpire(userId: number, empire: string) {
        const [availableEmpires] = this.availableEmpiresStore.UpdateAsync("Player_" + userId, (oldValue: Map<string, EmpireInfo> | undefined) => {
            if (oldValue === undefined) {
                return $tuple(new Map<string, EmpireInfo>());
            }
            const availableEmpires = new Map<string, EmpireInfo>();
            for (const [k, v] of pairs(oldValue))
                if (k !== empire)
                    availableEmpires.set(k, v);
            return $tuple(availableEmpires);
        });
        if (availableEmpires !== undefined) {
            this.updateAvailableEmpires(userId, availableEmpires);
        }
    }

    /**
     * Gets basic information about an empire.
     * 
     * @param empireId The ID of the empire to get info for.
     * @returns Empire information object.
     */
    getInfo(empireId: string) {
        const empire = this.loadEmpireProfile(empireId, true);
        if (empire === undefined)
            throw "No such empire " + empireId;
        const items = empire.Data.items;
        return {
            name: empire.Data.name,
            owner: empire.Data.owner,
            items: (items.worldPlaced ?? items.placed).size(),
            created: empire.Data.created,
            playtime: empire.Data.playtime
        };
    }

    /**
     * Loads a player profile from the DataStore.
     * 
     * @param userId The user ID to load the profile for.
     * @param view Whether to load in view-only mode (read-only).
     * @returns The loaded player profile, or undefined if not found.
     */
    loadPlayerProfile(userId: number, view?: boolean) {
        const key = "Player_" + userId;
        return view ? this.playerProfileManager.view(key) : this.playerProfileManager.load(key);
    }

    /**
     * Unloads a player profile from memory.
     * 
     * @param userId The user ID to unload the profile for.
     * @returns Whether the unload was successful.
     */
    unloadPlayerProfile(userId: number) {
        return this.playerProfileManager.unload("Player_" + userId);
    }

    /**
     * Checks if a player has the required permission level for an action.
     * 
     * @param player The player to check permissions for.
     * @param action The action requiring permission.
     * @returns Whether the player has sufficient permissions.
     */
    checkPermLevel(player: Player, action: PermissionKey) {
        const minimumPerm = this.empireData.permLevels[action];
        const permLevel = player.GetAttribute("PermissionLevel") as number;
        if (permLevel === undefined || permLevel < minimumPerm) {
            return false;
        }
        return true;
    }

    /**
     * Handles player joining logic.
     * Sets up player data, available empires, and player attributes.
     * 
     * @param player The player that joined.
     */
    onPlayerJoined(player: Player) {
        let availableEmpires = this.getAvailableEmpires(player.UserId);
        pcall(() => {
            for (const [id, empire] of availableEmpires) {
                if (empire.owner === 0) {
                    availableEmpires.delete(id);
                    warn("ridded public from available empires");
                }
            }
            if (!this.isPublicServer) {
                availableEmpires.set(this.empireId, this.getInfo(this.empireId));
            }
        });
        pcall(() => {
            BadgeService.AwardBadge(player.UserId, 3498765777753358); // join badge
        })

        const playerProfile = this.loadPlayerProfile(player.UserId);
        if (playerProfile === undefined)
            throw "No player profile for player " + player.Name;

        let changed = false;
        if (playerProfile.Data.availableEmpires !== undefined) {
            for (const empireId of playerProfile.Data.availableEmpires) {
                availableEmpires.set(empireId, this.getInfo(empireId));
            }
            playerProfile.Data.availableEmpires = undefined;
            changed = true;
        }
        if (playerProfile.Data.ownedEmpires !== undefined) {
            for (const owned of playerProfile.Data.ownedEmpires) {
                if (!availableEmpires.has(owned)) {
                    availableEmpires.set(owned, this.getInfo(owned));
                    changed = true;
                }
            }
        }
        if (changed === true) {
            this.availableEmpiresStore.SetAsync("Player_" + player.UserId, availableEmpires);
            this.updateAvailableEmpires(player.UserId, availableEmpires);
            print(availableEmpires);
            warn("Player data was modified to fix lossy and old data");
        }
        player.SetAttribute("UsedPortal", playerProfile.Data.usedPortal);
        player.GetAttributeChangedSignal("UsedPortal").Connect(() => playerProfile.Data.usedPortal = player.GetAttribute("UsedPortal") as boolean);
        player.SetAttribute("RawPurifierClicks", math.floor(playerProfile.Data.rawPurifierClicks));
        player.GetAttributeChangedSignal("RawPurifierClicks").Connect(() => playerProfile.Data.rawPurifierClicks = player.GetAttribute("RawPurifierClicks") as number);
        if (playerProfile.Data.rawPurifierClicks === 0 && (this.empireData.owner === player.UserId || RunService.IsStudio())) {
            const c = this.empireData.currencies.get("Purifier Clicks");
            if (c !== undefined) {
                const clicks = new OnoeNum(c);
                if (clicks !== undefined) {
                    player.SetAttribute("RawPurifierClicks", math.min(math.floor(clicks.div(3).add(1).revert()), 10000000));
                    print("Awarded player with clicks as compensation");
                }
            }
        }

        const ownedEmpires = playerProfile?.Data.ownedEmpires;
        if (ownedEmpires !== undefined && !ownedEmpires.includes(this.empireId) && this.empireData.owner === player.UserId) {
            ownedEmpires.push(this.empireId);
        }
        if (this.isPublicServer) {
            Packets.availableEmpires.setFor(player, availableEmpires);
        }
    }

    /**
     * Initializes the DataService.
     * Sets up server attributes, event connections, and packet handlers.
     */
    onInit() {
        Workspace.SetAttribute("IsSingleServer", IS_SINGLE_SERVER);
        Workspace.SetAttribute("IsPublicServer", this.isPublicServer);
        Players.PlayerRemoving.Connect((player) => {
            this.unloadPlayerProfile(player.UserId);
            this.availableEmpiresPerPlayer.delete(player.UserId);
        });
        task.spawn(() => {
            if (IS_SINGLE_SERVER || !this.isPublicServer) {
                while (task.wait(60)) {
                    Packets.savingEmpire.fireAll(100);
                    const success = this.saveEmpireProfile(this.empireId);
                    Packets.savingEmpire.fireAll(success ? 200 : 500);
                }
            }
        });

        if (IS_SERVER) { // check for no testing environment
            game.BindToClose(() => this.unloadEmpireProfile(this.empireId));
        }

        Packets.createNewEmpire.onInvoke((player: Player) => this.createNewEmpire(player));
        Packets.teleportToEmpire.onInvoke((player, empireId) => this.teleportToEmpire(player, empireId));
    }
}