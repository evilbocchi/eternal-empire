/**
 * @fileoverview Chest loot notification manager.
 * Listens for chest loot packets and displays smooth loot collection animations.
 */

import React, { Fragment, useEffect, useState } from "@rbxts/react";
import useCIViewportManagement from "client/ui/components/item/useCIViewportManagement";
import Packets from "shared/Packets";
import ChestLootNotification, { ChestLootData } from "./ChestLootNotification";

interface LootQueueItem {
    id: string;
    loot: Array<{
        id: string | "xp";
        amount: number;
    }>;
    timestamp: number;
}

/**
 * Manager component that handles chest loot notifications
 */
export default function ChestLootManager() {
    const [currentNotification, setCurrentNotification] = useState<ChestLootData | undefined>(undefined);
    const [lootQueue, setLootQueue] = useState<LootQueueItem[]>([]);
    const viewportManagement = useCIViewportManagement({ enabled: true });

    // Listen for loot packets
    useEffect(() => {
        const connection = Packets.showLoot.fromServer((lootArray) => {
            const newLoot: LootQueueItem = {
                id: `loot_${tick()}_${math.random()}`,
                loot: lootArray,
                timestamp: tick(),
            };

            setLootQueue((prev) => [...prev, newLoot]);
        });

        return () => {
            connection.Disconnect();
        };
    }, []);

    // Process queue when no notification is currently showing
    useEffect(() => {
        if (!currentNotification && lootQueue.size() > 0) {
            const nextLoot = lootQueue[0];
            setCurrentNotification({
                loot: nextLoot.loot,
                visible: true,
            });

            // Remove from queue
            setLootQueue((prev) => prev.filter((item) => item.id !== nextLoot.id));
        }
    }, [currentNotification, lootQueue]);

    const handleNotificationComplete = () => {
        setCurrentNotification(undefined);
    };

    if (!currentNotification) {
        return <Fragment />;
    }

    return (
        <ChestLootNotification
            data={currentNotification}
            onComplete={handleNotificationComplete}
            viewportManagement={viewportManagement}
        />
    );
}
