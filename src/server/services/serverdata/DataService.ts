import { OnoeNum } from "@antivivi/serikanum";
import { OnInit, Service } from "@flamework/core";
import { Profile } from "@rbxts/profileservice/globals";
import { DataStoreService, HttpService, MarketplaceService, Players, RunService, TeleportService, Workspace } from "@rbxts/services";
import { OnPlayerJoined } from "server/services/ModdingService";
import { IS_SINGLE_SERVER, START_CAMERA, START_SCREEN_ENABLED, getNameFromUserId } from "shared/constants";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/network/Packets";
import Price from "shared/Price";
import ProfileManager from "shared/utils/vrldk/ProfileManager";

declare global {
    type PlacedItem = {
        placementId: string,
        item: string,
        posX: number,
        posY: number,
        posZ: number,
        rotX: number,
        rotY: number,
        rotZ: number,
        rawRotation?: number,
        direction?: boolean,
        area?: string;
    };

    type Inventory = Map<string, number>;

    type ItemsData = {
        inventory: Inventory,
        bought: Inventory,
        placed: PlacedItem[],
        nextId: number,
    };

    type EmpireInfo = {
        name: string,
        owner: number,
        items: number,
        created: number,
        playtime: number,
    };

    type Settings = typeof PlayerProfileTemplate.settings;
}

export const EmpireProfileTemplate = {
    // General
    name: "no name",
    owner: 0,
    created: 0,
    playtime: 0,
    longestSession: 0,
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

    // Gameplay
    level: 1,
    xp: 0,
    quests: new Map<string, number>(),
    openedChests: new Map<string, number>(),
    upgrades: new Map<string, number>(),
    completedEvents: new Set<string>(),
    questMetadata: new Map<string, unknown>(),
    unlockedAreas: new Set<AreaId>(["BarrenIslands"]),
    currencies: new Map<Currency, OnoeNum>(),
    mostCurrencies: new Map<Currency, OnoeNum>(),
    challenges: new Map<string, number>(),
    currentChallenge: undefined as string | undefined,
    currentChallengeStartTime: 0,
    challengeBestTimes: new Map<string, number>(),
    items: {
        inventory: new Map<string, number>(),
        bought: new Map<string, number>(),
        placed: [
            {
                placementId: "STARTING",
                item: "ClassLowerNegativeShop",
                posX: 16.5,
                posY: 3.5,
                posZ: 0,
                rotX: 0,
                rotY: 0,
                rotZ: 0,
                area: "BarrenIslands"
            }
        ],
        nextId: 0,
    } as ItemsData,
    backup: {
        currencies: undefined as Map<Currency, OnoeNum> | undefined,
        upgrades: undefined as Map<string, number> | undefined,
    },

    /** @deprecated */
    savedItems: new Map<AreaId, Array<PlacedItem>>(),
    printedSetups: new Array<Setup>(),
    nameChanges: 0,
    previousNames: new Set<string>()
};

export const PlayerProfileTemplate = {
    availableEmpires: undefined as Array<string> | undefined,
    ownedEmpires: new Array<string>(),
    settings: {
        ScientificNotation: false,
        hotkeys: {} as { [key: string]: number; },
        ResetAnimation: true,
        BuildAnimation: true,
        FormatCurrencies: true,
        Music: true,
        SoundEffects: true,
        CoalesceItemCategories: false,
    },
    usedPortal: false,
    rawPurifierClicks: 0,
    donated: 0,
};

@Service()
export class DataService implements OnInit, OnPlayerJoined {
    empireProfileManager = new ProfileManager("EmpireData", EmpireProfileTemplate);
    playerProfileManager = new ProfileManager("PlayerData", PlayerProfileTemplate);

    availableEmpiresStore = DataStoreService.GetDataStore("AvailableEmpires");
    availableEmpiresPerPlayer = new Map<number, Map<string, EmpireInfo>>();
    cachedEmpireProfiles = new Map<string, Profile<typeof EmpireProfileTemplate>>();
    isPublicServer = game.PrivateServerId === "" && (!RunService.IsStudio() || START_SCREEN_ENABLED === true);
    debounce = 0;

    /** Empire profile for the current server. */
    empireProfile!: Profile<typeof EmpireProfileTemplate>;
    readonly empireData = (() => {
        if (!RunService.IsStudio() || START_SCREEN_ENABLED === true) { // production protocol
            if (IS_SINGLE_SERVER) {
                Workspace.SetAttribute("EmpireID", "SingleServer");
            }
            else if (this.isPublicServer) {
                Workspace.SetAttribute("EmpireID", game.JobId);
            }
            else {
                while (Players.GetPlayers().size() < 1) {
                    task.wait();
                }
                const player = Players.GetPlayers()[0];
                const tpData = player.GetJoinData().TeleportData as string;
                if (Workspace.GetAttribute("EmpireID") === undefined) {
                    Workspace.SetAttribute("EmpireID", tpData === undefined ? game.PrivateServerId : tpData);
                }
            }
        }
        else {
            Workspace.SetAttribute("EmpireID", (START_CAMERA.WaitForChild("Id") as StringValue).Value);
        }

        const empireId = Workspace.GetAttribute("EmpireID");
        if (empireId === undefined)
            error("Could not load empire ID");
        const empireProfile = this.loadEmpireProfile(empireId as string);
        if (empireProfile === undefined)
            error("Could not load empire");
        const empireData = empireProfile.Data;
        if (this.isPublicServer === true) {
            empireData.name = IS_SINGLE_SERVER ? "Single Server" : "Public Server";
        }
        if (empireData.previousNames.size() === 0) {
            if (game.PrivateServerOwnerId === 0) {
                empireData.name = getNameFromUserId(empireData.owner) + "'s Empire";
            }
            else {
                empireData.owner = game.PrivateServerOwnerId;
                empireData.name = getNameFromUserId(game.PrivateServerOwnerId) + "'s Private Server";
            }
        }


        // infinitemath to onoenum
        for (const [currency, value] of empireData.currencies) {
            if (Price.DETAILS_PER_CURRENCY[currency] === undefined) {
                empireData.currencies.delete(currency);
                empireData.mostCurrencies.delete(currency);
                continue;
            }
            const v = value as OnoeNum & { first?: number, second?: number; };
            if (v.first !== undefined && v.second !== undefined)
                empireData.currencies.set(currency, OnoeNum.fromSerika(v.first, v.second));
            else {
                empireData.currencies.set(currency, new OnoeNum(value));
            }
        }
        for (const [currency, value] of empireData.mostCurrencies) {
            const v = value as OnoeNum & { first?: number, second?: number; };
            if (v.first !== undefined && v.second !== undefined)
                empireData.mostCurrencies.set(currency, OnoeNum.fromSerika(v.first, v.second));
        }

        // convert old setups
        for (const placedItem of empireData.items.placed) {
            if (placedItem.placementId === undefined) {
                warn("added placementid");
                placedItem.placementId = tostring(++empireData.items.nextId);
            }
        }
        const old = empireData.savedItems.get("SlamoVillage");
        if (old !== undefined) {
            empireData.savedItems.delete("SlamoVillage");
            let totalPrice = new Price();
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
                calculatedPrice: totalPrice.costPerCurrency,
                autoloads: false,
                alerted: false,
                items: old
            });
        }

        // fix no shop
        let hasShop = false;
        const placedItems = empireData.items.placed;
        for (const placedItem of placedItems)
            if (placedItem.item === "ClassLowerNegativeShop") {
                hasShop = true;
                break;
            }
        if (hasShop === false) {
            const inventory = empireData.items.inventory;
            const amount = inventory.get("ClassLowerNegativeShop");
            if (amount === undefined || amount === 0) {
                inventory.set("ClassLowerNegativeShop", 1);
                warn("gave shop");
            }
        }

        // remove illegal runs
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
                empireData.items.inventory.set("SadnessInMyHeart", 1);
                Packets.systemMessageSent.fireAll("RBXGeneral", "An extreme apology to you. A hotfix was applied to challenges to fix a major bug, and your challenge stats have been affected. An item has been placed in your inventory.", "");
            }
            empireData.completedEvents.add("RemoveIllegalChallenges");
        }
        

        Workspace.SetAttribute("EmpireProfileLoaded", true);
        this.empireProfile = empireProfile;
        return empireData;
    })();

    saveEmpireProfile(empireId: string) {
        const key = "Empire_" + empireId;
        return this.empireProfileManager.save(key);
    }

    loadEmpireProfile(empireId: string, view?: boolean) {
        const key = "Empire_" + empireId;
        return view ? this.empireProfileManager.view(key) : this.empireProfileManager.load(key);
    }

    unloadEmpireProfile(empireId: string) {
        return this.empireProfileManager.unload("Empire_" + empireId);
    }

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

    teleportToEmpire(player: Player, empireId: string) {
        const profile = this.loadEmpireProfile(empireId, true);
        if (profile && profile.Data.accessCode) {
            TeleportService.TeleportToPrivateServer(game.PlaceId, profile.Data.accessCode, [player], undefined, empireId);
        }
    }

    getAvailableEmpires(userId: number): Map<string, EmpireInfo> {
        const cached = this.availableEmpiresPerPlayer.get(userId);
        if (cached !== undefined) {
            return cached;
        }
        const key = "Player_" + userId;
        let [data] = this.availableEmpiresStore.GetAsync(key);
        if ((data as string[])[0] !== undefined) {
            const mapped = new Map<string, EmpireInfo>();
            for (const empireId of (data as string[]))
                mapped.set(empireId, this.getInfo(empireId));
            task.spawn(() => this.availableEmpiresStore.SetAsync(key, mapped));
            this.availableEmpiresPerPlayer.set(userId, mapped);
            return mapped;
        }
        if (data === undefined) {
            data = new Map();
        }
        this.availableEmpiresPerPlayer.set(userId, data as Map<string, EmpireInfo>);
        return data as Map<string, EmpireInfo>;
    }

    updateAvailableEmpires(userId: number, availableEmpires: Map<string, EmpireInfo>) {
        this.availableEmpiresPerPlayer.set(userId, availableEmpires);
        const plr = Players.GetPlayerByUserId(userId);
        if (plr !== undefined) {
            Packets.availableEmpires.setFor(plr, availableEmpires);
        }
    }

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

    getInfo(empireId: string) {
        const empire = this.loadEmpireProfile(empireId, true);
        if (empire === undefined)
            throw "No such empire " + empireId;
        return {
            name: empire.Data.name,
            owner: empire.Data.owner,
            items: empire.Data.items.placed.size(),
            created: empire.Data.created,
            playtime: empire.Data.playtime
        };
    }

    loadPlayerProfile(userId: number, view?: boolean) {
        const key = "Player_" + userId;
        return view ? this.playerProfileManager.view(key) : this.playerProfileManager.load(key);
    }

    unloadPlayerProfile(userId: number) {
        return this.playerProfileManager.unload("Player_" + userId);
    }

    getEmpireId(): string {
        const empireID = Workspace.GetAttribute("EmpireID");
        if (empireID === undefined) {
            while (Workspace.GetAttribute("EmpireID") === undefined) {
                task.wait();
            }
            return this.getEmpireId();
        }
        return Workspace.GetAttribute("EmpireID") as string;
    }

    checkPermLevel(player: Player, action: keyof (typeof EmpireProfileTemplate.permLevels)) {
        const minimumPerm = this.empireData.permLevels[action];
        const permLevel = player.GetAttribute("PermissionLevel") as number;
        if (permLevel === undefined || permLevel < minimumPerm) {
            return false;
        }
        return true;
    }

    onPlayerJoined(player: Player) {
        let availableEmpires = this.getAvailableEmpires(player.UserId);
        pcall(() => {
            for (const [id, empire] of availableEmpires) {
                if (empire.owner === 0) {
                    availableEmpires.delete(id);
                    warn("ridded public from available empires")
                }
            }
            if (!this.isPublicServer) {
                const id = this.getEmpireId();
                availableEmpires.set(id, this.getInfo(id));
            }
        });

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

        const empireId = this.getEmpireId();
        const ownedEmpires = playerProfile?.Data.ownedEmpires;
        if (ownedEmpires !== undefined && !ownedEmpires.includes(empireId) && this.empireData.owner === player.UserId) {
            ownedEmpires.push(empireId);
        }
        if (this.isPublicServer) {
            Packets.availableEmpires.setFor(player, availableEmpires);
        }
    }

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
                    const success = this.saveEmpireProfile(this.getEmpireId());
                    Packets.savingEmpire.fireAll(success ? 200 : 500);
                }
            }
        });
        game.BindToClose(() => {
            const empireId = Workspace.GetAttribute("EmpireID") as string;
            if (empireId) {
                this.unloadEmpireProfile(empireId);
            }
        });
        Packets.createNewEmpire.onInvoke((player: Player) => this.createNewEmpire(player));
        Packets.teleportToEmpire.listen((player, empireId) => this.teleportToEmpire(player, empireId));
    }
}