import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import HotkeyProvider from "shared/ui/components/hotkeys/HotkeyProvider";
import SettingsManager from "shared/ui/components/settings/SettingsManager";
import { mockData } from "shared/ui/components/StoryMocking";
import TooltipProvider from "shared/ui/components/tooltip/TooltipProvider";

const controls = {
    visible: true
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: (props: InferProps<typeof controls>) => {
        mockData();

        return (
            <HotkeyProvider>
                <TooltipProvider>
                    <SettingsManager defaultVisible={true} />
                </TooltipProvider>
            </HotkeyProvider>
        );
    }
};
