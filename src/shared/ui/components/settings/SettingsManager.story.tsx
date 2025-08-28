import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import PlayerProfileTemplate from "shared/data/PlayerProfileTemplate";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import SettingsManager from "shared/ui/components/settings/SettingsManager";
import TooltipProvider from "shared/ui/components/tooltip/TooltipProvider";

const controls = {
    visible: true
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: typeof controls) => {
        return (
            <HotkeyProvider defaultEnabled={true}>
                <TooltipProvider>
                    <SettingsManager />
                </TooltipProvider>
            </HotkeyProvider>
        );
    }
};
