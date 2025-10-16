import { OnStart, Service } from "@flamework/core";
import { Players, Workspace } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import { OnPlayerAdded } from "server/services/ModdingService";
import { WAYPOINTS } from "shared/constants";
import { IS_EDIT, IS_PUBLIC_SERVER } from "shared/Context";
import eat from "shared/hamster/eat";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";
import { AREAS } from "shared/world/Area";

@Service()
export default class CharacterSpawnService implements OnStart, OnPlayerAdded {
    readonly spawnLocation: SpawnLocation;

    constructor(private readonly dataService: DataService) {
        if (IS_EDIT || Sandbox.getEnabled()) {
            this.spawnLocation = undefined as never;
            return;
        }

        const spawnLocation = new Instance("SpawnLocation");
        spawnLocation.Name = "CharacterSpawnService";
        spawnLocation.Size = new Vector3(0.1, 0.1, 0.1);
        spawnLocation.Transparency = 1;
        spawnLocation.Anchored = true;
        spawnLocation.CanCollide = false;
        spawnLocation.CFrame = new CFrame(0, -1000, 0);
        spawnLocation.Parent = Workspace;
        this.spawnLocation = spawnLocation;
        this.refreshSpawn();
    }

    getSpawnPosition() {
        // const isMinerHaven = this.dataService.empireData.quests.get(MinerHaven.id) >= 0;
        const isMinerHaven = false;
        if (isMinerHaven) {
            return AREAS.MinerHaven.spawnLocationWorldNode?.getInstance()?.Position;
        }

        const newBeginningsStageIndex = this.dataService.empireData.quests.get("NewBeginnings");
        if (newBeginningsStageIndex === undefined || newBeginningsStageIndex === 0) {
            return WAYPOINTS.NewBeginningsPlayerPos.Position;
        }

        return AREAS.BarrenIslands.spawnLocationWorldNode?.getInstance()?.Position;
    }

    refreshSpawn() {
        if (IS_EDIT) return;

        const position = this.getSpawnPosition();
        if (position) {
            this.spawnLocation.CFrame = new CFrame(position);
        }
    }

    onPlayerAdded(player: Player) {
        if (IS_EDIT || Sandbox.getEnabled()) return;

        const connection = player.CharacterRemoving.Connect(() => {
            this.refreshSpawn();
        });

        eat(connection, "Disconnect");
    }

    onStart() {
        Players.RespawnTime = 0.5;
        if (IS_EDIT || Sandbox.getEnabled()) return;

        Packets.loadCharacter.fromClient((player) => {
            this.refreshSpawn();
            player?.LoadCharacter();
            return true;
        });

        if (!IS_PUBLIC_SERVER) {
            Players.CharacterAutoLoads = true;
            this.refreshSpawn();
            for (const player of Players.GetPlayers()) {
                player.LoadCharacter();
            }
        }
    }
}
