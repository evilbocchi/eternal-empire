import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import SidebarButtons from "client/ui/components/sidebar/SidebarButtons";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        return (
            <StrictMode>
                <TooltipWindow />
                <SidebarButtons />
            </StrictMode>
        );
    },
);
