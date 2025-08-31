import PlayerProfileTemplate from "shared/data/PlayerProfileTemplate";
import Packets from "shared/Packets";

class StoryMocking {
    static mockData() {
        const mockPlayerData = table.clone(PlayerProfileTemplate);

        Packets.setSetting.fromClient((player, setting, value) => {
            (mockPlayerData.settings as { [key: string]: unknown; })[setting] = value;
            Packets.settings.setFor(player, mockPlayerData.settings);
        });

        Packets.setHotkey.fromClient((player, key, action) => {
            mockPlayerData.settings.hotkeys[key] = action;
            Packets.settings.setFor(player, mockPlayerData.settings);
        });

        const questInfos = new Map<string, QuestInfo>();
        questInfos.set("Quest1", {
            name: "First Quest",
            colorR: 255,
            colorG: 223,
            colorB: 62,
            level: 1,
            length: 1,
            reward: { xp: 100 },
            order: 1,
            stages: [
                { description: "Complete the first task." },
                { description: "Complete the second task." },
            ],
        });
        Packets.questInfo.set(questInfos);
        Packets.level.set(2);
        Packets.xp.set(50);
    }
}

export = StoryMocking;