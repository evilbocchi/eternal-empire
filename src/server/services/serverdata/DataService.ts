import { OnInit, Service } from "@flamework/core";
import { Profile } from "@rbxts/profileservice/globals";
import { DataStoreService, HttpService, Players, RunService, TeleportService, Workspace } from "@rbxts/services";
import { AREAS, EmpireInfo, IS_SINGLE_SERVER, ItemsData, Log, PlacedItem, START_CAMERA, START_SCREEN_ENABLED, getNameFromUserId } from "shared/constants";
import { Fletchette, RemoteFunc, RemoteProperty, RemoteSignal, Signal } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import ProfileManager from "shared/utils/vrldk/ProfileManager";

declare global {
    interface FletchetteCanisters {
        EmpireCanister: typeof EmpireCanister;
    }
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

    // Gameplay
    level: 1,
    xp: 0,
    quests: new Map<string, number>(),
    upgrades: {
        
    },
    unlockedAreas: new Set<keyof (typeof AREAS)>(["BarrenIslands"]),
    currencies: new Map<Currency, InfiniteMath>(),
    mostCurrencies: new Map<Currency, InfiniteMath>(),
    items: {
        inventory: new Map<string, number>(),
        bought: new Map<string, number>(),
        placed: [
            {
                item: "ClassLowerNegativeShop",
                posX: 16.5,
                posY: 3.5,
                posZ: 0,
                rotX: 0,
                rotY: 0,
                rotZ: 0
            }
        ],
        nextId: 0,
    } as ItemsData,
    savedItems: new Map<keyof (typeof AREAS), Array<PlacedItem>>(),
};

export const PlayerProfileTemplate = {
    availableEmpires: undefined,
    ownedEmpires: new Array<string>(),
    settings: {
        ScientificNotation: false,
        hotkeys: new Map<string, number>(),
        ResetAnimation: true,
        BuildAnimation: true
    },
    usedPortal: false,
    rawPurifierClicks: 0,
    donated: 0,
};

const EmpireCanister = Fletchette.createCanister("EmpireCanister", {
    savingEmpire: new RemoteSignal<(status: number) => void>(true),
    availableEmpires: new RemoteProperty<Map<string, EmpireInfo>>(new Map<string, EmpireInfo>(), true),
    createNewEmpire: new RemoteFunc<() => boolean>(),
    teleportToEmpire: new RemoteSignal<(empireId: string) => void>(),
});

@Service()
export class DataService implements OnInit {
    empireProfileManager = new ProfileManager("EmpireData", EmpireProfileTemplate);
    playerProfileManager = new ProfileManager("PlayerData", PlayerProfileTemplate);

    availableEmpiresStore = DataStoreService.GetDataStore("AvailableEmpires");
    availableEmpiresPerPlayer = new Map<number, string[]>();
    empireProfile = undefined as Profile<typeof EmpireProfileTemplate> | undefined;
    cachedEmpireProfiles = new Map<string, Profile<typeof EmpireProfileTemplate>>();
    empireProfileLoaded = new Signal<(profile: Profile<typeof EmpireProfileTemplate>) => void>();
    isPublicServer = game.PrivateServerId === "";
    debounce = 0;

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
        if (tick() - this.debounce < 0.5) {
            return false;
        }
        this.debounce = tick();
        const availableEmpires = this.getAvailableEmpires(player.UserId);
        for (const availableEmpire of availableEmpires) {
            if (this.loadEmpireProfile(availableEmpire, true)?.Data.owner === player.UserId) {
                return false;
            }
        }
       
        const empireId = HttpService.GenerateGUID(false);
        const newProfile = this.loadEmpireProfile(empireId);
        if (newProfile !== undefined) {
            newProfile.AddUserId(player.UserId);
            newProfile.Data.name = player.DisplayName + "'s Empire";
            newProfile.Data.owner = player.UserId;
            newProfile.Data.created = tick();
            const [success, result] = pcall(() => {
                const [accessCode] = TeleportService.ReserveServer(15783753029);
                return accessCode;
            });
            if (success === true) {
                newProfile.Data.accessCode = result;
            }
            else if (!RunService.IsStudio()) {
                return false;
            }
            this.setAvailableEmpires(player.UserId, [empireId, ...this.getAvailableEmpires(player.UserId)]);
            this.unloadEmpireProfile(empireId);
            return true;
        }
        return false;
    }

    teleportToEmpire(player: Player, empireId: string) {
        const profile = this.loadEmpireProfile(empireId, true);
        if (profile && profile.Data.accessCode) {
            TeleportService.TeleportToPrivateServer(15783753029, profile.Data.accessCode, [player], undefined, empireId);
        }
    }

    getAvailableEmpires(userId: number) {
        const cached = this.availableEmpiresPerPlayer.get(userId);
        if (cached !== undefined) {
            return cached;
        }
        const [data] = this.availableEmpiresStore.GetAsync("Player_" + userId);
        this.availableEmpiresPerPlayer.set(userId, data as string[]);
        return (data ?? []) as string[];
    }

    setAvailableEmpires(userId: number, availableEmpires: string[]) {
        this.availableEmpiresStore.SetAsync("Player_" + userId, availableEmpires);
        this.availableEmpiresPerPlayer.set(userId, availableEmpires);
        const plr = Players.GetPlayerByUserId(userId);
        if (plr !== undefined) {
            EmpireCanister.availableEmpires.setFor(plr, this.mapInfo(availableEmpires));
        }
    }

    mapInfo(availableEmpires: string[]) {
        const infos = new Map<string, EmpireInfo>();
        for (const empireId of availableEmpires) {
            const empire =  this.loadEmpireProfile(empireId, true);
            if (empire === undefined) {
                continue;
            }
            infos.set(empireId, {
                name: empire.Data.name,
                owner: empire.Data.owner,
                items: empire.Data.items.placed.size(),
                created: empire.Data.created,
                playtime: empire.Data.playtime
            });
        }
        return infos;
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

    loadEmpireId() {
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
        if (empireId === undefined) {
            warn("Could not load empire ID");
            return;
        }
        this.empireProfile = this.loadEmpireProfile(empireId as string);
        if (this.empireProfile !== undefined) {
            if (game.PrivateServerOwnerId === 0) {
                this.empireProfile.Data.name = IS_SINGLE_SERVER ? "Single Server" : "Public Server";
            }
            else {
                this.empireProfile.Data.owner = game.PrivateServerOwnerId;
                if (this.empireProfile.Data.name === "no name") {
                    this.empireProfile.Data.name = getNameFromUserId(game.PrivateServerOwnerId) + "'s Private Server";
                }
            }
            this.empireProfileLoaded.fire(this.empireProfile);
        }
        Workspace.SetAttribute("EmpireProfileLoaded", true);
    }

    checkPermLevel(player: Player, action: keyof (typeof EmpireProfileTemplate.permLevels)) {
        const minimumPerm = this.empireProfile?.Data.permLevels[action];
        const permLevel = player.GetAttribute("PermissionLevel") as number;
        if (minimumPerm === undefined || permLevel === undefined || permLevel < minimumPerm) {
            return false;
        }
        return true;
    }

    onInit() {
        Workspace.SetAttribute("IsSingleServer", IS_SINGLE_SERVER);
        Workspace.SetAttribute("IsPublicServer", this.isPublicServer);
        this.loadEmpireId();        
        Players.PlayerRemoving.Connect((player) => {
            this.unloadPlayerProfile(player.UserId);
            this.availableEmpiresPerPlayer.delete(player.UserId);
        });
        task.spawn(() => {
            if (IS_SINGLE_SERVER || !this.isPublicServer) {
                while (task.wait(60)) {
                    EmpireCanister.savingEmpire.fireAll(100);
                    const success = this.saveEmpireProfile(this.getEmpireId());
                    EmpireCanister.savingEmpire.fireAll(success ? 200 : 500);
                }
            }
        });
        game.BindToClose(() => {
            const empireId = Workspace.GetAttribute("EmpireID") as string;
            if (empireId) {
                this.unloadEmpireProfile(empireId);
            }
        });
        const onPlayerAdded = (player: Player) => {
            let availableEmpires = this.getAvailableEmpires(player.UserId);
            const playerProfile = this.loadPlayerProfile(player.UserId);
            if (playerProfile !== undefined) {
                let changed = false;
                const newAvailable = new Array<string>();
                for (const old of availableEmpires) {
                    if (newAvailable.includes(old)) {
                        changed = true;
                    }
                    else {
                        newAvailable.push(old);
                    }
                }
                if (changed === true) {
                    availableEmpires = newAvailable;
                }
                if (playerProfile.Data.availableEmpires !== undefined) {
                    availableEmpires = [...availableEmpires, ...playerProfile.Data.availableEmpires];
                    playerProfile.Data.availableEmpires = undefined;
                    changed = true;
                }
                if (playerProfile.Data.ownedEmpires !== undefined) {
                    for (const owned of playerProfile.Data.ownedEmpires) {
                        if (!availableEmpires.includes(owned)) {
                            availableEmpires.push(owned);
                            changed = true;
                        }
                    }
                }
                if (changed === true) {
                    this.setAvailableEmpires(player.UserId, availableEmpires);
                    print(availableEmpires)
                    warn("Player data was modified to fix lossy and old data");
                }
                player.SetAttribute("UsedPortal", playerProfile.Data.usedPortal);
                player.GetAttributeChangedSignal("UsedPortal").Connect(() => playerProfile.Data.usedPortal = player.GetAttribute("UsedPortal") as boolean);
                player.SetAttribute("RawPurifierClicks", math.floor(playerProfile.Data.rawPurifierClicks));
                player.GetAttributeChangedSignal("RawPurifierClicks").Connect(() => playerProfile.Data.rawPurifierClicks = player.GetAttribute("RawPurifierClicks") as number);
                if (playerProfile.Data.rawPurifierClicks === 0 && this.empireProfile !== undefined 
                    && (this.empireProfile.Data.owner === player.UserId || RunService.IsStudio())) {
                    const c = this.empireProfile.Data.currencies.get("Purifier Clicks");
                    if (c !== undefined) {
                        const clicks = new InfiniteMath(c);
                        if (clicks !== undefined) {
                            player.SetAttribute("RawPurifierClicks", math.min(math.floor(clicks.div(3).add(1).Reverse()), 10000000));
                            print("Awarded player with clicks as compensation");
                        }
                    }
                }
            }

            const empireId = this.getEmpireId();
            const ownedEmpires = playerProfile?.Data.ownedEmpires;
            if (ownedEmpires !== undefined && !ownedEmpires.includes(empireId) && this.empireProfile?.Data.owner === player.UserId) {
                ownedEmpires.push(empireId);
            }
            EmpireCanister.availableEmpires.setFor(player, this.mapInfo(availableEmpires));
        }
        Players.PlayerAdded.Connect((player) => onPlayerAdded(player));
        for (const player of Players.GetPlayers()) {
            onPlayerAdded(player);
        }
        EmpireCanister.createNewEmpire.onInvoke((player: Player) => this.createNewEmpire(player));
        EmpireCanister.teleportToEmpire.connect((player, empireId) => this.teleportToEmpire(player, empireId));
    }
}