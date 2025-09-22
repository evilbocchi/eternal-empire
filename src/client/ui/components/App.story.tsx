import React, { useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import App from "client/ui/components/App";
import { questState } from "client/ui/components/quest/QuestState";
import StoryMocking from "client/ui/components/StoryMocking";
import { setVisibilityMain } from "client/ui/hooks/useVisibility";
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
