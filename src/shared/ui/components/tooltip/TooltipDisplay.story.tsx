import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import SidebarButtons from "shared/ui/components/sidebar/SidebarButtons";
import { TooltipDisplay } from "shared/ui/components/tooltip/TooltipManager";

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
