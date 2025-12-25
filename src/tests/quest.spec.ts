import { afterEach, beforeEach, describe, expect, it } from "@rbxts/jest-globals";
import Quest, { Stage } from "server/quests/Quest";
import { Server } from "shared/api/APIExpose";

describe("quest progression", () => {
    let quest: Quest;
    let stage: Stage;
    let reachedCount: number;
    let empireData: EmpireData;

    beforeEach(() => {
        empireData = Server.empireData;
        empireData.quests = new Map();

        Quest.REGISTRY.OBJECTS.clear();
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
        Quest.REGISTRY.OBJECTS.set(quest.id, quest);
    });

    afterEach(() => {
        Quest.REGISTRY.OBJECTS.clear();
        const cleanupMap = Quest.CLEANUP_PER_STAGE;
        const cleanup = cleanupMap.get(stage);
        cleanup?.();
        cleanupMap.delete(stage);
        empireData.quests = new Map();
    });

    it("reaches the active stage when data is loaded", () => {
        expect(reachedCount).toBe(0);

        Quest.reachStages();

        expect(reachedCount).toBe(1);
    });

    it("defers stage reach until data becomes available", () => {
        const originalData = Server.empireData;
        Server.empireData = undefined as never;

        Quest.reachStages();

        expect(reachedCount).toBe(0);

        Server.empireData = originalData;
        task.wait(); // Allow deferred task to run

        expect(reachedCount).toBe(1);
    });
});
