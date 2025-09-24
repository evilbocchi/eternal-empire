/**
 * @fileoverview Quest completion manager component that handles quest completion events.
 *
 * Features:
 * - Listens to quest completion packets from the server
 * - Manages quest completion notification state
 * - Triggers quest completion animations
 * - Handles multiple quest completions in sequence
 */

import React, { Fragment, useEffect, useState } from "@rbxts/react";
import QuestCompletionNotification, {
    QuestCompletionData,
} from "client/ui/components/quest/QuestCompletionNotification";
import Packets from "shared/Packets";

interface QuestCompletionQueue {
    id: string;
    data: QuestCompletionData;
}

export default function QuestCompletionManager() {
    const [questQueue, setQuestQueue] = useState<QuestCompletionQueue[]>([]);
    const [currentQuest, setCurrentQuest] = useState<QuestCompletionQueue | undefined>();

    // Listen for quest completion events
    useEffect(() => {
        const connections: RBXScriptConnection[] = [];

        // Listen for quest completion packets
        connections.push(
            Packets.questCompleted.fromServer((questId) => {
                const questInfo = Packets.questInfo.get()?.get(questId);
                if (!questInfo) {
                    warn(`Quest info not found for completed quest: ${questId}`);
                    return;
                }

                // Create quest completion data
                const completionData: QuestCompletionData = {
                    questName: questInfo.name,
                    questColor: Color3.fromRGB(questInfo.colorR, questInfo.colorG, questInfo.colorB),
                    reward: questInfo.reward,
                    visible: true,
                };

                // Add to queue
                const queueItem: QuestCompletionQueue = {
                    id: `quest_${questId}_${tick()}`,
                    data: completionData,
                };

                setQuestQueue((prevQueue) => [...prevQueue, queueItem]);
            }),
        );

        return () => {
            connections.forEach((connection) => connection.Disconnect());
        };
    }, []);

    // Process quest queue
    useEffect(() => {
        if (!currentQuest && questQueue.size() > 0) {
            const nextQuest = questQueue[0];
            setCurrentQuest(nextQuest);
            setQuestQueue((prevQueue) => {
                const newQueue = [...prevQueue];
                newQueue.shift();
                return newQueue;
            });
        }
    }, [currentQuest, questQueue]);

    // Handle quest completion finish
    const handleQuestComplete = () => {
        setCurrentQuest(undefined);
    };

    return (
        <Fragment>
            {currentQuest && <QuestCompletionNotification data={currentQuest.data} onComplete={handleQuestComplete} />}
        </Fragment>
    );
}
