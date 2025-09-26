import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import { questState } from "client/components/quest/QuestState";
import TrackedQuestWindow from "client/components/quest/TrackedQuestWindow";
import StoryMocking from "client/components/StoryMocking";
import useVisibility from "client/hooks/useVisibility";

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
        questState.setTrackedQuest("Quest1");
        useVisibility("TrackedQuest", props.controls.visible);
        return <TrackedQuestWindow />;
    },
);
