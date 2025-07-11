import { OnInit, Service } from "@flamework/core";
import ProfileService from "@rbxts/profileservice";
import { Profile } from "@rbxts/profileservice/globals";
import { DataStoreService, HttpService, Players, RunService, TeleportService, Workspace } from "@rbxts/services";
import Signal from "@rbxutil/signal";
import { Currency, EmpireInfo, ItemsData, START_CAMERA, START_SCREEN_ENABLED } from "shared/constants";
import { Fletchette, RemoteFunc, RemoteProperty, RemoteSignal } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import ProfileManager from "shared/utils/vrldk/ProfileManager";

declare global {
    interface FletchetteCanisters {
        EmpireCanister: typeof EmpireCanister;
    }
}

export const EmpireProfileTemplate = {
    name: "no name",
    owner: 0,
    created: 0,
    playtime: 0,
    longestSession: 0,
    accessCode: "",
    banned: new Array<number>(),
    managers: new Array<number>(),
    trusted: new Array<number>(),

    upgrades: {
        
    },
    currencies: new Map<Currency, InfiniteMath>(),
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
        ]
    } as ItemsData
};

const PlayerProfileTemplate = {
    availableEmpires: new Array<string>(),
    donated: 0,
};

const EmpireCanister = Fletchette.createCanister("EmpireCanister", {
    availableEmpires: new RemoteProperty<Map<string, EmpireInfo>>(new Map<string, EmpireInfo>(), true),
    createNewEmpire: new RemoteFunc<() => boolean>(),
    teleportToEmpire: new RemoteSignal<(empireId: string) => void>(),
});

@Service()
export class DataService implements OnInit {
    empireProfileManager = new ProfileManager(ProfileService.GetProfileStore("EmpireData", EmpireProfileTemplate));
    playerProfileManager = new ProfileManager(ProfileService.GetProfileStore("PlayerData", PlayerProfileTemplate));

    availableEmpiresStore = DataStoreService.GetDataStore("AvailableEmpires");
    availableEmpiresPerPlayer = new Map<number, string[]>();
    empireProfile = undefined as Profile<typeof EmpireProfileTemplate> | undefined;
    cachedEmpireProfiles = new Map<string, Profile<typeof EmpireProfileTemplate>>();
    empireProfileLoaded = new Signal<Profile<typeof EmpireProfileTemplate>>();

    loadEmpireProfile(empireId: string, view?: boolean) {
        const key = "Empire_" + empireId;
        return view ? this.empireProfileManager.view(key) : this.empireProfileManager.load(key);
    }

    unloadEmpireProfile(empireId: string) {
        return this.empireProfileManager.unload("Empire_" + empireId);
    }

    createNewEmpire(player: Player) {
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
            const [accessCode] = TeleportService.ReserveServer(game.PlaceId);
            newProfile.Data.accessCode = accessCode;
            this.setAvailableEmpires(player.UserId, [empireId, ...this.getAvailableEmpires(player.UserId)]);
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
            if (empire === undefined)
                error("No empire");
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
        const isPublicServer = Workspace.GetAttribute("IsPublicServer") === true;
        if (!RunService.IsStudio() || START_SCREEN_ENABLED === true) { // production protocol
            if (isPublicServer) {
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
            if (game.PrivateServerOwnerId !== 0) {
                this.empireProfile.Data.owner = game.PrivateServerOwnerId;
                if (this.empireProfile.Data.name === "no name") {
                    this.empireProfile.Data.name = Players.GetNameFromUserIdAsync(game.PrivateServerOwnerId) + "'s Private Server";
                }
            }
            this.empireProfileLoaded.Fire(this.empireProfile);
        }
        Workspace.SetAttribute("EmpireProfileLoaded", true);
    }

    onInit() {
        Workspace.SetAttribute("IsPublicServer", game.PrivateServerId === "");
        this.loadEmpireId();        
        Players.PlayerRemoving.Connect((player) => this.unloadPlayerProfile(player.UserId));
        game.BindToClose(() => {
            const empireId = Workspace.GetAttribute("EmpireID") as string;
            if (empireId) {
                this.unloadEmpireProfile(empireId);
            }
        });
        const onPlayerAdded = (player: Player) => {
            let availableEmpires = this.getAvailableEmpires(player.UserId);
            const playerProfile = this.loadPlayerProfile(player.UserId);
            if (playerProfile?.Data.availableEmpires !== undefined) {
                availableEmpires = [...availableEmpires, ...playerProfile.Data.availableEmpires];
                this.setAvailableEmpires(player.UserId, availableEmpires);
            }
            EmpireCanister.availableEmpires.setFor(player, this.mapInfo(availableEmpires));
        };
        Players.PlayerAdded.Connect((player) => onPlayerAdded(player));
        for (const player of Players.GetPlayers()) {
            onPlayerAdded(player);
        }
        EmpireCanister.createNewEmpire.onInvoke((player: Player) => this.createNewEmpire(player));
        EmpireCanister.teleportToEmpire.connect((player, empireId) => this.teleportToEmpire(player, empireId));
    }
}