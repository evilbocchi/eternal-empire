import React, { useEffect, useState } from "@rbxts/react";
import useSingleDocument from "client/ui/components/sidebar/useSingleDocumentWindow";
import TechWindow from "client/ui/components/window/TechWindow";
import { getAsset } from "shared/asset/AssetMap";
import Packets from "shared/Packets";

export default function PortableBeaconWindow() {
    const { id, visible, closeDocument } = useSingleDocument({ id: "PortableBeacon" });

    useEffect(() => {
        const connections = new Array<RBXScriptConnection>();
        const initial = new Set<string>();
        connections.push(
            Packets.unlockedAreas.observe((areas) => {
                for (const areaId of areas) {
                    initial.add(areaId);
                }
            }),
        );

        return () => {
            for (const connection of connections) {
                connection.Disconnect();
            }
        };
    }, []);

    print();

    return (
        <TechWindow icon={getAsset("assets/PortableBeacon.png")} id={id} title="Portable Beacon" visible={visible}>
            <scrollingframe
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                CanvasSize={new UDim2(1, 0, 0, 0)}
                Size={new UDim2(1, 0, 1, 0)}
            ></scrollingframe>
        </TechWindow>
    );
}
