import { OnInit, Service } from "@flamework/core";
import { DataService } from "server/services/serverdata/DataService";
import { AREAS } from "shared/constants";
import Packets from "shared/network/Packets";

@Service()
export class UnlockedAreasService implements OnInit {

    constructor(private dataService: DataService) {

    }

    unlockArea(area: AreaId) {
        const areas = this.dataService.empireData.unlockedAreas;
        areas.add(area);
        AREAS[area].unlocked.Value = true;
        Packets.areaUnlocked.fireAll(area);
        return true;
    }

    lockArea(area: AreaId) {
        const areas = this.dataService.empireData.unlockedAreas;
        areas.delete(area);
        this.dataService.empireData.unlockedAreas = areas;
        AREAS[area].unlocked.Value = false;
        return true;
    }

    onInit() {
        const unlockedAreas = this.dataService.empireData.unlockedAreas;
        for (const [id, area] of pairs(AREAS)) {
            area.unlocked.Value = unlockedAreas.has(id);
        }
    }
}