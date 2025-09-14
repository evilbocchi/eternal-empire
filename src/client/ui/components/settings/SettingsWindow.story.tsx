import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import SettingsWindow from "client/ui/components/settings/SettingsWindow";
import StoryMocking from "client/ui/components/StoryMocking";
import { useSingleDocumentVisibility } from "client/ui/hooks/useVisibility";

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
        useSingleDocumentVisibility("Settings", props.controls.visible);
        return <SettingsWindow />;
    },
);
