import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import Packets from "shared/Packets";
import App from "client/ui/components/App";
import { questState } from "client/ui/components/quest/QuestState";
import StoryMocking from "client/ui/components/StoryMocking";
import { TooltipDisplay } from "client/ui/components/tooltip/TooltipManager";

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
