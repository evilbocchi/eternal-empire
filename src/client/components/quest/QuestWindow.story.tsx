import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import QuestWindow from "client/components/quest/QuestWindow";
import TrackedQuestWindow from "client/components/quest/TrackedQuestWindow";
import StoryMocking from "client/components/StoryMocking";
import TooltipWindow from "client/components/tooltip/TooltipWindow";
import { useSingleDocumentVisibility } from "client/hooks/useVisibility";

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

        useSingleDocumentVisibility("Quests", props.controls.visible);

        return (
            <StrictMode>
                <TrackedQuestWindow />
                <QuestWindow />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
