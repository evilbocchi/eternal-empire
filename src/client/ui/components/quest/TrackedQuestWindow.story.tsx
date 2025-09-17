import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import { questState } from "client/ui/components/quest/QuestState";
import TrackedQuestWindow from "client/ui/components/quest/TrackedQuestWindow";
import StoryMocking from "client/ui/components/StoryMocking";
import useVisibility from "client/ui/hooks/useVisibility";

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
