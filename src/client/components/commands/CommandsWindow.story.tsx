import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import CommandsWindow from "client/components/commands/CommandsWindow";
import { useSingleDocumentVisibility } from "client/hooks/useVisibility";

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
        return <CommandsWindow defaultPermissionLevel={props.controls.userPermissionLevel} />;
    },
);
