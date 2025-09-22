import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import BuildManager from "client/ui/components/build/BuildManager";
import BuildWindow from "client/ui/components/build/BuildWindow";
import StoryMocking from "client/ui/components/StoryMocking";
import useVisibility from "client/ui/hooks/useVisibility";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            hasSelection: true,
            isRestricted: false,
            animationsEnabled: true,
        },
    },
    (props) => {
        StoryMocking.mockData();
        Packets.permLevels.set({ build: -1 });
        useVisibility("Build", props.controls.visible);
        BuildManager.animationsEnabled = props.controls.animationsEnabled;

        return (
            <BuildWindow
                getRestricted={() => props.controls.isRestricted}
                hasSelection={() => props.controls.hasSelection}
            />
        );
    },
);
