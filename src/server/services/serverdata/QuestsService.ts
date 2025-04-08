//!native
//!optimize 2

import { OnInit, Service } from "@flamework/core";
import Quest from "server/Quest";
import { DataService } from "server/services/serverdata/DataService";
import { WAYPOINTS } from "shared/constants";
import Sandbox from "shared/Sandbox";
import Packets from "shared/Packets";

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
        if (Sandbox.getEnabled())
            return;

        for (const waypoint of WAYPOINTS.GetChildren()) {
            if (!waypoint.IsA("BasePart"))
                continue;
            waypoint.Transparency = 1;
            waypoint.CanCollide = false;
            waypoint.CanTouch = false;
            waypoint.CanQuery = false;
        }
        Packets.quests.set(this.dataService.empireData.quests);
    }
}