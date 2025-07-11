import { OnInit, OnStart, Service } from "@flamework/core";
import { Profile } from "@rbxts/profileservice/globals";
import { DataService, EmpireProfileTemplate } from "server/services/serverdata/DataService";
import Quest from "shared/Quest";
import { WAYPOINTS } from "shared/constants";
import { Fletchette, RemoteProperty, RemoteSignal } from "@antivivi/fletchette";

declare global {
    interface FletchetteCanisters {
        QuestCanister: typeof QuestCanister;
    }
}

export const QuestCanister = Fletchette.createCanister("QuestCanister", {
    quests: new RemoteProperty<Map<string, number>>(new Map()),
    questCompleted: new RemoteSignal<(questId: string) => void>(),
});

@Service()
export class QuestsService implements OnInit, OnStart {

    constructor(private dataService: DataService) {

    }

    getStagePerQuest() {
        return this.dataService.empireProfile?.Data.quests;
    }

    setStagePerQuest(quests: Map<string, number>) {
        if (this.dataService.empireProfile !== undefined) {
            this.dataService.empireProfile.Data.quests = quests;
            QuestCanister.quests.set(quests);
        }
    }

    completeStage(quest: Quest, current: number) {
        const stagePerQuest = this.getStagePerQuest();
        if (stagePerQuest === undefined) {
            warn("Profile not loaded");
            return;
        }
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
    }

    onStart() {
        const onProfile = (profile: Profile<typeof EmpireProfileTemplate>) => {
            QuestCanister.quests.set(profile.Data.quests);
        }
        if (this.dataService.empireProfile !== undefined) {
            onProfile(this.dataService.empireProfile);
        }
        this.dataService.empireProfileLoaded.connect((profile) => onProfile(profile));
    }
}