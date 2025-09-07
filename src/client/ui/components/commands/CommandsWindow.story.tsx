import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import CommandsWindow from "client/ui/components/commands/CommandsWindow";
import { SidebarManager } from "client/ui/components/sidebar/SidebarButtons";

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
        useEffect(() => {
            if (props.controls.visible) {
                SidebarManager.openWindow("Commands");
            } else {
                SidebarManager.closeWindow("Commands");
            }
        }, [props.controls.visible]);

        return <CommandsWindow userPermissionLevel={props.controls.userPermissionLevel} />;
    },
);
