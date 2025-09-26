import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import PortableBeaconWindow from "client/components/item/PortableBeaconWindow";
import useVisibility from "client/hooks/useVisibility";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        useVisibility("PortableBeacon", props.controls.visible);

        Packets.tpToArea.fromClient(() => true);

        return <PortableBeaconWindow />;
    },
);
