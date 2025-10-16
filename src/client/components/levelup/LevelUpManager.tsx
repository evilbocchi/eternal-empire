/**
 * @fileoverview Manager component for level-up notifications.
 *
 * This component handles the triggering and state management of level-up notifications.
 * It listens to level changes and displays the animated notification when appropriate.
 */

import React, { useEffect, useState } from "@rbxts/react";
import LevelUpNotification, { LevelUpData } from "client/components/levelup/LevelUpNotification";
import Packets from "shared/Packets";

export default function LevelUpManager() {
    const [levelUpData, setLevelUpData] = useState<LevelUpData>({
        level: 0,
        visible: false,
    });
    const [previousLevel, setPreviousLevel] = useState<number | undefined>(undefined);

    // Listen to level changes from the server
    useEffect(() => {
        const connection = Packets.level.observe((newLevel) => {
            if (previousLevel !== undefined && newLevel > previousLevel && newLevel !== 1) {
                // Player leveled up! Show notification
                setLevelUpData({
                    level: newLevel,
                    visible: true,
                });
            }
            setPreviousLevel(newLevel);
        });

        return () => connection.disconnect();
    }, [previousLevel]);

    // Handle notification completion
    const handleNotificationComplete = () => {
        setLevelUpData((prev) => ({
            ...prev,
            visible: false,
        }));
    };

    return <LevelUpNotification data={levelUpData} onComplete={handleNotificationComplete} />;
}
