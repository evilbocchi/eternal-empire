import React from "@rbxts/react";
import ReactRoblox from "@rbxts/react-roblox";
import PlayerProfileTemplate from "shared/data/PlayerProfileTemplate";
import Packets from "shared/Packets";
import App from "shared/ui/components/App";

const controls = {
    Visible: true,
};

export = {
    react: React,
    reactRoblox: ReactRoblox,
    controls: controls,
    story: () => {
        const mockPlayerData = table.clone(PlayerProfileTemplate);



        Packets.setSetting.fromClient((player, setting, value) => {
            (mockPlayerData.settings as { [key: string]: unknown; })[setting] = value;
            Packets.settings.setFor(player, mockPlayerData.settings);
        });

        const component = <App />;
        return component;
    },
};