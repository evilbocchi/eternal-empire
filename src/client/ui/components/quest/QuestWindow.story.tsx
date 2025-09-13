import React, { StrictMode, useEffect } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import QuestWindow from "client/ui/components/quest/QuestWindow";
import { SidebarManager } from "client/ui/components/sidebar/SidebarButtons";
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
                SidebarManager.openWindow("Quests");
            } else {
                SidebarManager.closeWindow("Quests");
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
