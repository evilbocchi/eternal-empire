/**
 * @fileoverview Challenge completion notification manager.
 * Listens for challenge completion packets and displays epic completion animations.
 */

import React, { Fragment, useEffect, useState } from "@rbxts/react";
import ChallengeCompletionNotification, {
    ChallengeCompletionData,
} from "client/components/challenge/ChallengeCompletionNotification";
import Packets from "shared/Packets";

interface CompletionQueueItem {
    id: string;
    challengeName: string;
    rewardText: string;
    challengeColors: {
        primary: Color3;
        secondary: Color3;
    };
    timestamp: number;
}

/**
 * Manager component that handles challenge completion notifications
 */
export default function ChallengeCompletionManager() {
    const [currentNotification, setCurrentNotification] = useState<ChallengeCompletionData | undefined>(undefined);
    const [completionQueue, setCompletionQueue] = useState<CompletionQueueItem[]>([]);

    // Listen for challenge completion packets
    useEffect(() => {
        const connection = Packets.challengeCompleted.fromServer((challengeName, rewardText) => {
            const newCompletion: CompletionQueueItem = {
                id: `completion_${tick()}_${math.random()}`,
                challengeName,
                rewardText,
                challengeColors: {
                    // Default epic colors - can be enhanced to get actual challenge colors
                    primary: Color3.fromRGB(255, 215, 0),
                    secondary: Color3.fromRGB(255, 140, 0),
                },
                timestamp: tick(),
            };

            setCompletionQueue((prev) => [...prev, newCompletion]);
        });

        return () => {
            connection.Disconnect();
        };
    }, []);

    // Process queue when no notification is currently showing
    useEffect(() => {
        if (!currentNotification && completionQueue.size() > 0) {
            const nextCompletion = completionQueue[0];
            setCurrentNotification({
                challengeName: nextCompletion.challengeName,
                rewardText: nextCompletion.rewardText,
                challengeColors: nextCompletion.challengeColors,
                visible: true,
            });

            // Remove from queue
            setCompletionQueue((prev) => prev.filter((item) => item.id !== nextCompletion.id));
        }
    }, [currentNotification, completionQueue]);

    const handleNotificationComplete = () => {
        setCurrentNotification(undefined);
    };

    if (!currentNotification) {
        return <Fragment />;
    }

    return <ChallengeCompletionNotification data={currentNotification} onComplete={handleNotificationComplete} />;
}
