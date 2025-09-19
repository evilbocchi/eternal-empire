import React from "@rbxts/react";
import useSingleDocument from "client/ui/components/sidebar/useSingleDocumentWindow";
import TechWindow from "client/ui/components/window/TechWindow";
import { getAsset } from "shared/asset/AssetMap";

export default function PortableBeaconWindow() {
    const { id, visible, closeDocument } = useSingleDocument({ id: "PortableBeacon" });

    return (
        <TechWindow icon={getAsset("assets/PortableBeacon.png")} id={id} title="Portable Beacon" visible={visible}>
            <scrollingframe></scrollingframe>
        </TechWindow>
    );
}
