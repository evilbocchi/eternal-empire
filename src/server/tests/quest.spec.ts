import type { Profile } from "@antivivi/profileservice/globals";
import { afterEach, beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import Quest, { Stage } from "server/quests/Quest";
import { Server } from "shared/api/APIExpose";
import ThisEmpire from "shared/data/ThisEmpire";

type WritableThisEmpire = {
    profile?: Profile<EmpireData>;
    data?: EmpireData;
    id?: string;
    loadWith: typeof ThisEmpire.loadWith;
};

const writableEmpire = ThisEmpire as unknown as WritableThisEmpire;
const questsAvailable = Server.Quest !== undefined && writableEmpire.data !== undefined;
const describeQuests = questsAvailable ? describe : describe.skip;

describeQuests("quest progression", () => {
    let originalProfile: Profile<EmpireData>;
    let originalEmpireId: string;
    let originalQuestMap: Map<string, number>;
    let originalQuests: Array<[string, Quest]>;
    let quest: Quest;
    let stage: Stage;
    let reachedCount: number;
    let empireData: EmpireData;

    beforeEach(() => {
        originalProfile = writableEmpire.profile!;
        empireData = writableEmpire.data!;
        originalEmpireId = writableEmpire.id!;

        originalQuestMap = empireData.quests;
        empireData.quests = new Map();

        const registry = Quest.REGISTRY;
        originalQuests = [];
        for (const entry of registry.OBJECTS) {
            originalQuests.push(entry);
        }
        registry.OBJECTS.clear();

        reachedCount = 0;
        quest = new Quest("TestQuest").setName("Test Quest").setOrder(0).setLevel(0).setLength(1);
        stage = new Stage()
            .setDescription("Reachable test stage")
            .setPosition(new Vector3())
            .onReached(() => {
                reachedCount += 1;
                return () => {};
            });
        quest.addStage(stage);

        registry.OBJECTS.set(quest.id, quest);
    });

    afterEach(() => {
        const registry = Quest.REGISTRY;
        registry.OBJECTS.clear();
        for (const [id, originalQuest] of originalQuests) {
            registry.OBJECTS.set(id, originalQuest);
        }

        const cleanupMap = Quest.CLEANUP_PER_STAGE;
        const cleanup = cleanupMap.get(stage);
        cleanup?.();
        cleanupMap.delete(stage);

        empireData.quests = originalQuestMap;
        writableEmpire.loadWith({
            empireProfile: originalProfile,
            empireData,
            empireId: originalEmpireId,
        });
    });

    it("reaches the active stage when data is loaded", () => {
        expect(reachedCount).toBe(0);

        Quest.reachStages();

        expect(reachedCount).toBe(1);
    });

    it("defers stage reach until data becomes available", () => {
        writableEmpire.data = undefined;
        writableEmpire.profile = undefined;
        writableEmpire.id = undefined;

        Quest.reachStages();

        expect(reachedCount).toBe(0);

        writableEmpire.loadWith({
            empireProfile: originalProfile,
            empireData,
            empireId: originalEmpireId,
        });

        expect(reachedCount).toBe(1);
    });
});
