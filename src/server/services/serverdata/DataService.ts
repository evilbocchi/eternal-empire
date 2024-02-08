import { OnInit, Service } from "@flamework/core";
import ProfileService from "@rbxts/profileservice";
import { Profile } from "@rbxts/profileservice/globals";
import { HttpService, Players, RunService, TeleportService, Workspace } from "@rbxts/services";
import Signal from "@rbxutil/signal";
import { EmpireInfo, ItemsData, START_SCREEN_ENABLED } from "shared/constants";
import { Fletchette, RemoteFunc, RemoteProperty, RemoteSignal } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import ProfileManager from "shared/utils/vrldk/ProfileManager";

declare global {
    interface FletchetteCanisters {
        EmpireCanister: typeof EmpireCanister;
    }
}

const empireProfileTemplate = {
    name: "no name",
    owner: 0,
    created: 0,
    playtime: 0,
    longestSession: 0,
    accessCode: "",
    banned: new Array<number>(),
    managers: new Array<number>(),
    trusted: new Array<number>(),

    currencies: {
        Funds: new InfiniteMath(0),
        Power: new InfiniteMath(0),
        Bitcoin: new InfiniteMath(0),
    },
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

const playerProfileTemplate = {
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
    empireProfileManager = new ProfileManager(ProfileService.GetProfileStore("EmpireData", empireProfileTemplate));
    playerProfileManager = new ProfileManager(ProfileService.GetProfileStore("PlayerData", playerProfileTemplate));

    empireProfile = undefined as Profile<typeof empireProfileTemplate> | undefined;
    cachedEmpireProfiles = new Map<string, Profile<typeof empireProfileTemplate>>();
    empireProfileLoaded = new Signal<Profile<typeof empireProfileTemplate>>();

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
        const playerProfile = this.loadPlayerProfile(player.UserId);
        if (playerProfile === undefined || !playerProfile.Data.availableEmpires.includes(empireId)) {
            return;
        }
        const profile = this.loadEmpireProfile(empireId, true);
        if (profile && profile.Data.accessCode) {
            TeleportService.TeleportToPrivateServer(game.PlaceId, profile.Data.accessCode, [player], undefined, empireId);
        }
    }

    getAvailableEmpires(userId: number) {
        return this.loadPlayerProfile(userId)?.Data.availableEmpires ?? [];
    }

    setAvailableEmpires(userId: number, availableEmpires: string[]) {
        const playerProfile = this.loadPlayerProfile(userId);
        if (playerProfile) {
            playerProfile.Data.availableEmpires = availableEmpires;
            const plr = Players.GetPlayerByUserId(userId);
            if (plr !== undefined)
                EmpireCanister.availableEmpires.setFor(plr, this.mapInfo(availableEmpires));
        }
    }

    mapInfo(availableEmpires: string[]) {
        const infos = new Map<string, EmpireInfo>();
        for (const empireId of availableEmpires) {
            const empire = this.loadEmpireProfile(empireId, true);
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
            Workspace.SetAttribute("EmpireID", "TESTENVIRONMENT");
        }

        const empireId = Workspace.GetAttribute("EmpireID");
        if (empireId === undefined) {
            warn("Could not load empire ID");
            return;
        }
        this.empireProfile = this.loadEmpireProfile(empireId as string);
        if (this.empireProfile !== undefined) {
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
        const onPlayerAdded = (player: Player) => EmpireCanister.availableEmpires.setFor(player, this.mapInfo(this.getAvailableEmpires(player.UserId)));
        Players.PlayerAdded.Connect((player) => onPlayerAdded(player));
        for (const player of Players.GetPlayers()) {
            onPlayerAdded(player);
        }
        EmpireCanister.createNewEmpire.onInvoke((player: Player) => this.createNewEmpire(player));
        EmpireCanister.teleportToEmpire.connect((player, empireId) => this.teleportToEmpire(player, empireId));
    }
}