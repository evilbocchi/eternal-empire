import React, { useEffect, useState } from "@rbxts/react";
import useSingleDocument from "client/ui/components/sidebar/useSingleDocumentWindow";
import TechWindow from "client/ui/components/window/TechWindow";
import { getAsset } from "shared/asset/AssetMap";
import Packets from "shared/Packets";
import Area, { AREAS } from "shared/world/Area";

export default function PortableBeaconWindow() {
    const { id, visible, closeDocument } = useSingleDocument({ id: "PortableBeacon" });
    const [areas, setAreas] = useState<Set<Area>>(new Set([AREAS.BarrenIslands]));

    useEffect(() => {
        const connections = new Array<RBXScriptConnection>();
        connections.push(
            Packets.unlockedAreas.observe((areas) => {
                const newAreas = new Set<Area>([AREAS.BarrenIslands]);
                for (const areaId of areas) {
                    newAreas.add(AREAS[areaId]);
                }
                setAreas(newAreas);
            }),
        );

        return () => {
            for (const connection of connections) {
                connection.Disconnect();
            }
        };
    }, []);

    const elements = new Array<JSX.Element>();
    // BarrenIslands, SlamoVillage, SkyPavilion

    getAsset("assets/area/BarrenIslandsLandscape.png");
    getAsset("assets/area/SlamoVillageLandscape.png");
    getAsset("assets/area/SkyPavilionLandscape.png");

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
