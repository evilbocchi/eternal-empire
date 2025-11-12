import type { Profile } from "@antivivi/profileservice/globals";
import { afterEach, beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import Quest, { Stage } from "server/quests/Quest";
import ThisEmpire from "shared/data/ThisEmpire";

describe("quest progression", () => {
    let originalProfile: Profile<EmpireData>;
    let originalEmpireId: string;
    let originalQuestMap: Map<string, number>;
    let originalQuests: Array<[string, Quest]>;
    let quest: Quest;
    let stage: Stage;
    let reachedCount: number;
    let empireData: EmpireData;

    beforeEach(() => {
        originalProfile = ThisEmpire.profile;
        empireData = ThisEmpire.data;
        originalEmpireId = ThisEmpire.id;

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
        ThisEmpire.loadWith({
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
        ThisEmpire.data = undefined as never;
        ThisEmpire.profile = undefined as never;
        ThisEmpire.id = undefined as never;

        Quest.reachStages();

        expect(reachedCount).toBe(0);

        ThisEmpire.loadWith({
            empireProfile: originalProfile,
            empireData,
            empireId: originalEmpireId,
        });

        expect(reachedCount).toBe(1);
    });
});
