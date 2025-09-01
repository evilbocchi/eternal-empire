import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import App from "shared/ui/components/App";
import { questState } from "shared/ui/components/quest/QuestState";
import StoryMocking from "shared/ui/components/StoryMocking";

const controls = {
    Visible: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: () => {
        StoryMocking.mockData();
        questState.setTrackedQuest("Quest1");
        
        const component = <App />;
        return component;
    },
};