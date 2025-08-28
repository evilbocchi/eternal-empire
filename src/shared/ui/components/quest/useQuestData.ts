import { combineHumanReadable } from "@antivivi/vrldk";
import React, { useEffect } from "@rbxts/react";
import Packets from "shared/Packets";
import Items from "shared/items/Items";
import { questState } from "shared/ui/components/quest/QuestState";

export interface QuestHookData {
    questInfo: Map<string, QuestInfo>;
    stagePerQuest: Map<string, number>;
    level: number;
    xp: number;
    availableQuests: Set<string>;
}

export interface QuestActions {
    onTrackQuest: (questId: string | undefined) => void;
}

/**
 * Hook to manage quest data and interactions
 */
export function useQuestData(): QuestHookData & QuestActions & { trackedQuest: string | undefined; } {
    const [questInfo, setQuestInfo] = React.useState(Packets.questInfo.get() || new Map<string, QuestInfo>());
    const [stagePerQuest, setStagePerQuest] = React.useState(Packets.stagePerQuest.get() || new Map<string, number>());
    const [level, setLevel] = React.useState(Packets.level.get() || 0);
    const [xp, setXp] = React.useState(Packets.xp.get() || 0);
    const [trackedQuest, setTrackedQuest] = React.useState<string | undefined>(questState.getTrackedQuest());

    // Calculate available quests based on level requirements
    const availableQuests = React.useMemo(() => {
        const available = new Set<string>();

        questInfo.forEach((quest, questId) => {
            const currentStage = stagePerQuest.get(questId) ?? 0;
            const belowLevelRequirement = level < quest.level;

            // Quest is available if it's not completed and meets level requirement
            if (currentStage >= 0 && !belowLevelRequirement) {
                available.add(questId);
            }
        });

        return available;
    }, [questInfo, stagePerQuest, level]);

    // Set up packet observers
    useEffect(() => {
        const connections = [
            Packets.questInfo.observe((value) => setQuestInfo(value)),
            Packets.stagePerQuest.observe((value) => setStagePerQuest(value)),
            Packets.level.observe((value) => setLevel(value)),
            Packets.xp.observe((value) => setXp(value)),
            // Listen to shared quest state changes
            questState.trackedQuestChanged.connect((questId) => setTrackedQuest(questId))
        ];

        return () => {
            connections.forEach(conn => conn.disconnect());
        };
    }, []);

    const onTrackQuest = React.useCallback((questId: string | undefined) => {
        // Update shared quest state
        questState.setTrackedQuest(questId);
    }, []);

    return {
        questInfo,
        stagePerQuest,
        level,
        xp,
        availableQuests,
        trackedQuest,
        onTrackQuest
    };
}

export function getLengthName(length: number) {
    switch (length) {
        case 0: return "Tiny";
        case 1: return "Short";
        case 2: return "Medium";
        case 3: return "Long";
        case 4: return "Journey";
        default: return "???";
    }
}

export function getLengthColor(length: number) {
    switch (length) {
        case 0: return Color3.fromRGB(143, 255, 115);
        case 1: return Color3.fromRGB(0, 255, 56);
        case 2: return Color3.fromRGB(255, 250, 0);
        case 3: return Color3.fromRGB(255, 123, 28);
        case 4: return Color3.fromRGB(255, 20, 20);
        default: return Color3.fromRGB(255, 255, 255);
    }
}

export function getRewardLabel(reward: Reward) {
    const items = new Array<string>();
    if (reward.xp !== undefined) {
        items.push(`${reward.xp} XP`);
    }
    if (reward.items !== undefined) {
        for (const [itemId, amount] of reward.items) {
            const item = Items.getItem(itemId);
            const itemName = item?.name ?? itemId;
            items.push(`${amount} ${itemName}`);
        }
    }
    return combineHumanReadable(...items);
}