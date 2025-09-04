import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import CommandsWindow from "client/ui/components/commands/CommandsWindow";

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
        return (
            <StrictMode>
                <CommandsWindow {...props.controls} />
            </StrictMode>
        );
    },
);
