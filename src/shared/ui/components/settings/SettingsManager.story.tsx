import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import { InferProps } from "@rbxts/ui-labs";
import PlayerProfileTemplate from "shared/data/PlayerProfileTemplate";
import Packets from "shared/Packets";
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
    story: (props: InferProps<typeof controls>) => {
        const mockPlayerData = table.clone(PlayerProfileTemplate);

        Packets.setSetting.fromClient((player, setting, value) => {
            (mockPlayerData.settings as { [key: string]: unknown; })[setting] = value;
            Packets.settings.setFor(player, mockPlayerData.settings);
        });

        return (
            <HotkeyProvider defaultEnabled={true}>
                <TooltipProvider>
                    <SettingsManager defaultVisible={true} />
                </TooltipProvider>
            </HotkeyProvider>
        );
    }
};
