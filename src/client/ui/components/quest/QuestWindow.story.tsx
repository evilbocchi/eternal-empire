import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import StoryMocking from "client/ui/components/StoryMocking";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import { useSingleDocumentVisibility } from "client/ui/hooks/useVisibility";

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
                <QuestWindow />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
