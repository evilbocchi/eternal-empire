import React, { StrictMode } from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import SidebarButtons from "shared/ui/components/sidebar/SidebarButtons";
import { TooltipDisplay } from "shared/ui/components/tooltip/TooltipManager";

export = {
    react: React,
    reactRoblox: ReactRoblox,
    story: () => {
        return (
            <StrictMode>
                <HotkeyProvider>
                    <TooltipDisplay />
                    <SidebarButtons />
                </HotkeyProvider>
            </StrictMode>
        );
    },
};
