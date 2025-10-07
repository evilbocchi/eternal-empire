import { OnStart, Service } from "@flamework/core";
import { CollectionService } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import { IS_EDIT } from "shared/Context";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";

@Service()
export default class AreaService implements OnStart {
    constructor(private dataService: DataService) {}

    onStart() {
        Packets.tpToArea.fromClient((player, areaId) => {
            const character = player.Character;
            const area = AREAS[areaId];
            const spawnLocation = area.spawnLocationWorldNode?.getInstance();

            if (
                character === undefined ||
                !this.dataService.empireData.unlockedAreas.has(areaId) ||
                spawnLocation === undefined
            ) {
                return false;
            }

            character.PivotTo(spawnLocation.CFrame);
            return true;
        });

        if (!IS_EDIT) {
            for (const instance of CollectionService.GetTagged("Unanchored")) {
                if (instance.IsA("BasePart")) {
                    instance.Anchored = false;
                }
            }
        }
    }
}
