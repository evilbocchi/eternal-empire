import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import { questState } from "client/ui/components/quest/QuestState";
import TrackedQuestWindow from "client/ui/components/quest/TrackedQuestWindow";
import StoryMocking from "client/ui/components/StoryMocking";

const controls = {
    visible: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        StoryMocking.mockData();
        questState.setTrackedQuest("Quest1");

        return <TrackedQuestWindow />;
    },
};
