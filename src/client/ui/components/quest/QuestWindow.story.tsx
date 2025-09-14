import React, { StrictMode, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import SingleDocumentManager from "../sidebar/SingleDocumentManager";
import StoryMocking from "client/ui/components/StoryMocking";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";

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

        useEffect(() => {
            if (props.controls.visible) {
                SingleDocumentManager.openWindow("Quests");
            } else {
                SingleDocumentManager.closeWindow("Quests");
            }
        }, [props.controls.visible]);

        return (
            <StrictMode>
                <QuestWindow />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
