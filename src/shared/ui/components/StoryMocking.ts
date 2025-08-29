import PlayerProfileTemplate from "shared/data/PlayerProfileTemplate";
import Packets from "shared/Packets";

export function mockData() {
    const mockPlayerData = table.clone(PlayerProfileTemplate);

    Packets.setSetting.fromClient((player, setting, value) => {
        (mockPlayerData.settings as { [key: string]: unknown; })[setting] = value;
        Packets.settings.setFor(player, mockPlayerData.settings);
    });

    Packets.setHotkey.fromClient((player, key, action) => {
        mockPlayerData.settings.hotkeys[key] = action;
        Packets.settings.setFor(player, mockPlayerData.settings);
    });
}