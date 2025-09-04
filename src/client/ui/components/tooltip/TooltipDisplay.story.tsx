import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import SidebarButtons from "client/ui/components/sidebar/SidebarButtons";
import { TooltipDisplay } from "client/ui/components/tooltip/TooltipManager";

export = {
    react: React,
    reactRoblox: ReactRoblox,
    story: () => {
        return (
            <StrictMode>
                <TooltipDisplay />
                <SidebarButtons />
            </StrictMode>
        );
    },
};
