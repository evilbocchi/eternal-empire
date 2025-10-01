import React, { Fragment, useEffect } from "@rbxts/react";
import { ReplicatedStorage } from "@rbxts/services";
import Shaker from "client/components/effect/Shaker";
import { playSound } from "shared/asset/GameAssets";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";
import SlamoVillageConnection from "shared/world/nodes/SlamoVillageConnection";

export default function AreaEffectManager() {
    useEffect(() => {
        if (Sandbox.getEnabled()) return;

        // Listen for area unlock event
        const unlockConnection = Packets.areaUnlocked.fromServer(() => {
            Shaker.shake();
            playSound("Thunder.mp3");
        });

        // Manage SlamoVillage connection parenting
        const connectionInstance = SlamoVillageConnection.waitForInstance();
        const areaConnection = Packets.unlockedAreas.observe((areas) => {
            if (areas.has("SlamoVillage")) {
                connectionInstance.Parent = SlamoVillageConnection.originalParent;
            } else {
                connectionInstance.Parent = ReplicatedStorage;
            }
        });

        // Cleanup on unmount
        return () => {
            unlockConnection.Disconnect();
            areaConnection.disconnect();
            connectionInstance.Parent = SlamoVillageConnection.originalParent;
        };
    }, []);

    return <Fragment />;
}
