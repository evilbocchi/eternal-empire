import { OnInit, Service } from "@flamework/core";
import { DataService } from "server/services/serverdata/DataService";
import Quest from "server/Quest";
import { WAYPOINTS } from "shared/constants";
import Packets from "shared/network/Packets";

@Service()
export class QuestsService implements OnInit {

    constructor(private dataService: DataService) {

    }

    setStagePerQuest(quests: Map<string, number>) {
        this.dataService.empireData.quests = quests;
        Packets.quests.set(quests);
    }

    completeStage(quest: Quest, current: number) {
        const stagePerQuest = this.dataService.empireData.quests;
        const currentStage = stagePerQuest.get(quest.id);
        if (currentStage === -1) {
            return;
        }
        const stageSize = quest.stages.size();
        const newStage = (currentStage ?? 0) + 1;
        if (newStage !== current + 1) {
            return;
        }
        const n = newStage > stageSize - 1 ? -1 : newStage;
        stagePerQuest.set(quest.id, n);
        this.setStagePerQuest(stagePerQuest);
        return n;
    }

    onInit() {
        for (const waypoint of WAYPOINTS.GetChildren()) {
            (waypoint as BasePart).Transparency = 1;
        }
        Packets.quests.set(this.dataService.empireData.quests);
    }
}