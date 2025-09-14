import React, { StrictMode, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import SettingsWindow from "client/ui/components/settings/SettingsWindow";
import { SingleDocumentManager } from "client/ui/components/sidebar/SidebarButtons";
import StoryMocking from "client/ui/components/StoryMocking";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
        },
    },
    (props) => {
        StoryMocking.mockData();

        useEffect(() => {
            if (props.controls.visible) {
                SingleDocumentManager.openWindow("Settings");
            } else {
                SingleDocumentManager.closeWindow("Settings");
            }
        }, [props.controls.visible]);

        return <SettingsWindow />;
    },
);
