import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import App from "client/components/App";
import { questState } from "client/components/quest/QuestState";
import StoryMocking from "client/components/StoryMocking";
import { setVisibilityMain } from "client/hooks/useVisibility";
import Packets from "shared/Packets";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            hasItems: true,
            viewportsEnabled: false,
        },
    },
    (props) => {
        StoryMocking.mockData();
        questState.setTrackedQuest("Quest1");
        if (!props.controls.hasItems) {
            Packets.inventory.set(new Map());
        }

        useEffect(() => {
            setVisibilityMain(props.controls.visible);
        }, [props.controls.visible]);

        return <App viewportsEnabled={props.controls.viewportsEnabled} />;
    },
);
