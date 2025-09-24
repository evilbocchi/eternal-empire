import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import PortableBeaconWindow from "client/ui/components/item/PortableBeaconWindow";
import useVisibility from "client/ui/hooks/useVisibility";
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
