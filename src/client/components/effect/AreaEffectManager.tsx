import React, { Fragment, useEffect } from "@rbxts/react";
import { ReplicatedStorage } from "@rbxts/services";
import Shaker from "client/components/effect/Shaker";
import { playSound } from "shared/asset/GameAssets";
import { WAYPOINTS } from "shared/constants";
import { IS_EDIT } from "shared/Context";
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
        let connectionInstance: Instance | undefined;
        let areaConnection: RBXScriptConnection | undefined;
        if (!IS_EDIT) {
            connectionInstance = SlamoVillageConnection.waitForInstance();
            areaConnection = Packets.unlockedAreas.observe((areas) => {
                if (areas.has("SlamoVillage")) {
                    connectionInstance!.Parent = SlamoVillageConnection.originalParent;
                } else {
                    connectionInstance!.Parent = ReplicatedStorage;
                }
            });
        }

        WAYPOINTS.GetChildren().forEach((child) => {
            if (!child.IsA("BasePart")) return;
            child.LocalTransparencyModifier = 1;
        });

        // Cleanup on unmount
        return () => {
            unlockConnection.Disconnect();
            areaConnection?.Disconnect();
            if (connectionInstance !== undefined) {
                connectionInstance.Parent = SlamoVillageConnection.originalParent;
            }

            WAYPOINTS.GetChildren().forEach((child) => {
                if (!child.IsA("BasePart")) return;
                child.LocalTransparencyModifier = 0;
            });
        };
    }, []);

    return <Fragment />;
}
