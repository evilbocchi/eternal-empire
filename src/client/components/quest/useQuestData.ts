import { combineHumanReadable } from "@antivivi/vrldk";
import React, { useEffect, useState, useMemo, useCallback } from "@rbxts/react";
import Packets from "shared/Packets";
import Items from "shared/items/Items";
import { questState } from "client/components/quest/QuestState";

export interface QuestHookData {
    questInfo: Map<string, QuestInfo>;
    stagePerQuest: Map<string, number>;
    level: number;
    xp: number;
}

export interface QuestActions {
    onTrackQuest: (questId: string | undefined) => void;
}

/**
 * Hook to manage quest data and interactions
 */
export function useQuestData(): QuestHookData & QuestActions & { trackedQuest: string | undefined } {
    const [questInfo, setQuestInfo] = useState(Packets.questInfo.get() || new Map<string, QuestInfo>());
    const [stagePerQuest, setStagePerQuest] = useState(Packets.stagePerQuest.get() || new Map<string, number>());
    const [level, setLevel] = useState(Packets.level.get() || 0);
    const [xp, setXp] = useState(Packets.xp.get() || 0);
    const [trackedQuest, setTrackedQuest] = useState<string | undefined>(questState.getTrackedQuest());

    // Set up packet observers
    useEffect(() => {
        const connections = [
            Packets.questInfo.observe((value) => setQuestInfo(value)),
            Packets.stagePerQuest.observe((value) => setStagePerQuest(value)),
            Packets.level.observe((value) => setLevel(value)),
            Packets.xp.observe((value) => setXp(value)),
            // Listen to shared quest state changes
            questState.trackedQuestChanged.connect((questId) => setTrackedQuest(questId)),
        ];

        return () => {
            connections.forEach((conn) => conn.disconnect());
        };
    }, []);

    const onTrackQuest = useCallback((questId: string | undefined) => {
        // Update shared quest state
        questState.setTrackedQuest(questId);
    }, []);

    return {
        questInfo,
        stagePerQuest,
        level,
        xp,
        trackedQuest,
        onTrackQuest,
    };
}

export function getLengthName(length: number) {
    switch (length) {
        case 0:
            return "Tiny";
        case 1:
            return "Short";
        case 2:
            return "Medium";
        case 3:
            return "Long";
        case 4:
            return "Journey";
        default:
            return "???";
    }
}

export function getLengthColor(length: number) {
    switch (length) {
        case 0:
            return Color3.fromRGB(143, 255, 115);
        case 1:
            return Color3.fromRGB(0, 255, 56);
        case 2:
            return Color3.fromRGB(255, 250, 0);
        case 3:
            return Color3.fromRGB(255, 123, 28);
        case 4:
            return Color3.fromRGB(255, 20, 20);
        default:
            return Color3.fromRGB(255, 255, 255);
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
