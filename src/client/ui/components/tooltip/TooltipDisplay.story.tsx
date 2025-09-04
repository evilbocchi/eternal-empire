import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { CreateReactStory } from "@rbxts/ui-labs";
import SidebarButtons from "client/ui/components/sidebar/SidebarButtons";
import { TooltipDisplay } from "client/ui/components/tooltip/TooltipManager";

export = CreateReactStory(
    {
        react: React,
        reactRoblox: ReactRoblox,
    },
    () => {
        return (
            <StrictMode>
                <TooltipDisplay />
                <SidebarButtons />
            </StrictMode>
        );
    },
);
