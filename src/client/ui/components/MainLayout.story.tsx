import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import MainLayout from "client/ui/components/MainLayout";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import { useVisibilityMain } from "client/ui/hooks/useVisibility";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
        controls: {
            visible: true,
            hasItems: true,
        },
    },
    (props) => {
        useVisibilityMain(props.controls.visible);

        return (
            <StrictMode>
                <MainLayout />
                <TooltipWindow />
            </StrictMode>
        );
    },
);
