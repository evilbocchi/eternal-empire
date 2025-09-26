import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import BuildManager from "client/components/build/BuildManager";
import BuildWindow from "client/components/build/BuildWindow";
import StoryMocking from "client/components/StoryMocking";
import useVisibility from "client/hooks/useVisibility";
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
