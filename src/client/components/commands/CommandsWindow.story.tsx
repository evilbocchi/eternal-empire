import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import CommandsWindow from "client/components/commands/CommandsWindow";
import { useSingleDocumentVisibility } from "client/hooks/useVisibility";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            userPermissionLevel: 4,
        },
    },
    (props) => {
        useSingleDocumentVisibility("Commands", props.controls.visible);
        useEffect(() => {
            Packets.permLevel.set(props.controls.userPermissionLevel);
        }, [props.controls.userPermissionLevel]);

        return <CommandsWindow />;
    },
);
