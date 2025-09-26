/**
 * @fileoverview Chest loot notification manager.
 * Listens for chest loot packets and displays smooth loot collection animations.
 */

import React, { Fragment, useEffect, useState } from "@rbxts/react";
import Packets from "shared/Packets";
import ChestLootNotification from "./ChestLootNotification";

/**
 * Manager component that handles chest loot notifications
 */
export default function ChestLootManager({ viewportManagement }: { viewportManagement?: ItemViewportManagement }) {
    const [currentNotification, setCurrentNotification] = useState<
        { loot: Array<LootInfo>; visible: boolean } | undefined
    >(undefined);

    // Listen for loot packets and directly show notifications
    useEffect(() => {
        const connection = Packets.showLoot.fromServer((lootArray) => {
            setCurrentNotification({
                loot: lootArray,
                visible: true,
            });
        });

        return () => {
            connection.Disconnect();
        };
    }, []);

    const handleNotificationComplete = () => {
        setCurrentNotification(undefined);
    };

    if (!currentNotification) {
        return <Fragment />;
    }

    return (
        <ChestLootNotification
            loot={currentNotification.loot}
            visible={currentNotification.visible}
            onComplete={handleNotificationComplete}
            viewportManagement={viewportManagement}
        />
    );
}
