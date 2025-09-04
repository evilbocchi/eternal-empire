import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import Packets from "shared/Packets";
import App from "shared/ui/components/App";
import { questState } from "shared/ui/components/quest/QuestState";
import StoryMocking from "shared/ui/components/StoryMocking";
import { TooltipDisplay } from "shared/ui/components/tooltip/TooltipManager";

const controls = {
    visible: true,
    hasItems: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        StoryMocking.mockData();
        questState.setTrackedQuest("Quest1");

        if (!props.controls.hasItems) {
            Packets.inventory.set(new Map());
        }

        return (
            <StrictMode>
                <App />
                {/** Ensure tooltips work in stories **/}
                <TooltipDisplay />
            </StrictMode>
        );
    },
};
