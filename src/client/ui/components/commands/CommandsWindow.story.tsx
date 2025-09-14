import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import CommandsWindow from "client/ui/components/commands/CommandsWindow";
import SingleDocumentManager from "../sidebar/SingleDocumentManager";

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
                SingleDocumentManager.openWindow("Commands");
            } else {
                SingleDocumentManager.closeWindow("Commands");
            }
        }, [props.controls.visible]);

        return <CommandsWindow defaultPermissionLevel={props.controls.userPermissionLevel} />;
    },
);
