import { OnStart, Service } from "@flamework/core";
import { CollectionService } from "@rbxts/services";
import DataService from "server/services/data/DataService";
import { IS_EDIT } from "shared/Context";
import Packets from "shared/Packets";
import { AREAS } from "shared/world/Area";

@Service()
export default class AreaService implements OnStart {
    private readonly UNLOCKED_AREAS: Set<AreaId>;

    constructor(private dataService: DataService) {
        this.UNLOCKED_AREAS = this.dataService.empireData.unlockedAreas;
    }

    /**
     * Unlocks a given area, updates state, and notifies clients.
     * @param area The area ID to unlock.
     * @return True if the area was newly unlocked, false if it was already unlocked.
     */
    unlockArea(area: AreaId) {
        const areas = this.UNLOCKED_AREAS;
        if (areas.has(area)) {
            return false;
        }

        areas.add(area);
        Packets.unlockedAreas.set(areas);
        Packets.areaUnlocked.toAllClients(area);
        return true;
    }

    /**
     * Locks a given area, updates state, and disables it in the world.
     * @param area The area ID to lock.
     * @return True if the area was locked, false if it was not previously unlocked.
     */
    lockArea(area: AreaId) {
        const areas = this.UNLOCKED_AREAS;
        const success = areas.delete(area);
        Packets.unlockedAreas.set(areas);
        return success;
    }

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

        for (const [areaId, area] of pairs(AREAS)) {
            if (area.defaultUnlocked) {
                this.UNLOCKED_AREAS.add(areaId);
            }
        }
        Packets.unlockedAreas.set(this.UNLOCKED_AREAS);

        if (!IS_EDIT) {
            for (const instance of CollectionService.GetTagged("Unanchored")) {
                if (instance.IsA("BasePart")) {
                    instance.Anchored = false;
                }
            }
        }
    }
}
