import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import { questState } from "shared/ui/components/quest/QuestState";
import TrackedQuestWindow from "shared/ui/components/quest/TrackedQuestWindow";
import StoryMocking from "shared/ui/components/StoryMocking";
import TooltipProvider from "shared/ui/components/tooltip/TooltipProvider";

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

        return (
            <HotkeyProvider>
                <TooltipProvider>
                    <TrackedQuestWindow />
                </TooltipProvider>
            </HotkeyProvider>
        );
    },
};
