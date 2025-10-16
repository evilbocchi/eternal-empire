import { OnStart, Service } from "@flamework/core";
import { Players } from "@rbxts/services";
import MinerHaven from "server/quests/MinerHaven";
import DataService from "server/services/data/DataService";
import { IS_EDIT, IS_PUBLIC_SERVER } from "shared/Context";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";
import { AREAS } from "shared/world/Area";

@Service()
export default class CharacterSpawnService implements OnStart {
    constructor(private dataService: DataService) {}

    refreshSpawn() {
        const isBarrenIslands = this.dataService.empireData.quests.get(MinerHaven.id) === -1;

        for (const [, area] of pairs(AREAS)) {
            const spawnLocation = area.spawnLocationWorldNode?.getInstance();
            if (!spawnLocation) continue;
            if (isBarrenIslands) {
                spawnLocation.Enabled = area.id === AREAS.BarrenIslands.id;
            } else {
                spawnLocation.Enabled = area.id === AREAS.MinerHaven.id;
            }
        }
    }

    onStart() {
        if (IS_EDIT) return;

        Packets.loadCharacter.fromClient((player) => {
            this.refreshSpawn();
            player?.LoadCharacter();
            return true;
        });

        if (!Sandbox.getEnabled() && !IS_PUBLIC_SERVER) {
            Players.CharacterAutoLoads = true;
            this.refreshSpawn();
            for (const player of Players.GetPlayers()) {
                player.LoadCharacter();
            }
        }
    }
}
