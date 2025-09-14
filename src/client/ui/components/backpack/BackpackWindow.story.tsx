import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import BackpackWindow from "client/ui/components/backpack/BackpackWindow";
import StoryMocking from "client/ui/components/StoryMocking";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
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
        useVisibility("Backpack", props.controls.visible);

        return (
            <StrictMode>
                <BackpackWindow />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
