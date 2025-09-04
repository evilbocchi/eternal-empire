import { HttpService } from "@rbxts/services";
import PlayerProfileTemplate from "shared/data/PlayerProfileTemplate";
import Unique from "shared/item/traits/Unique";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

class StoryMocking {
    static mockData() {
        const mockPlayerData = table.clone(PlayerProfileTemplate);

        Packets.setSetting.fromClient((player, setting, value) => {
            (mockPlayerData.settings as { [key: string]: unknown })[setting] = value;
            Packets.settings.setFor(player, mockPlayerData.settings);
        });

        Packets.setHotkey.fromClient((player, key, action) => {
            mockPlayerData.settings.hotkeys[key] = action;
            Packets.settings.setFor(player, mockPlayerData.settings);
        });

        const questInfos = new Map<string, QuestInfo>();
        questInfos.set("Quest1", {
            name: "First Quest",
            colorR: 255 / 255,
            colorG: 223 / 255,
            colorB: 62 / 255,
            level: 1,
            length: 1,
            reward: { xp: 100 },
            order: 1,
            stages: [{ description: "Complete the first task." }, { description: "Complete the second task." }],
        });
        questInfos.set("Quest2", {
            name: "Second Quest",
            colorR: 25 / 255,
            colorG: 66 / 255,
            colorB: 200 / 255,
            level: 4,
            length: 3,
            reward: { xp: 500, items: new Map([["TheFirstDropper", 1]]) },
            order: 2,
            stages: [{ description: "Complete the first task." }, { description: "Complete the second task." }],
        });
        questInfos.set("Quest3", {
            name: "Third Quest",
            colorR: 250 / 255,
            colorG: 20 / 255,
            colorB: 100 / 255,
            level: 4,
            length: 2,
            reward: { xp: 6000, items: new Map([["TheFirstConveyor", 1]]) },
            order: 3,
            stages: [
                { description: "Complete the first task." },
                { description: "Complete the second task." },
                { description: "Complete the third task." },
            ],
        });
        questInfos.set("Quest4", {
            name: "Fourth Quest",
            colorR: 6 / 255,
            colorG: 6 / 255,
            colorB: 200 / 255,
            level: 1,
            length: 4,
            reward: { xp: 6000 },
            order: 3,
            stages: [
                { description: "Complete the first task." },
                { description: "Complete the second task." },
                { description: "Complete the third task." },
            ],
        });
        Packets.questInfo.set(questInfos);

        const stagePerQuest = new Map<string, number>();
        stagePerQuest.set("Quest1", 1);
        stagePerQuest.set("Quest3", -1);
        stagePerQuest.set("Quest4", 2);
        Packets.stagePerQuest.set(stagePerQuest);

        Packets.level.set(2);
        Packets.xp.set(50);

        const random = new Random(42);
        const quantityPerItem = new Map<string, number>();
        const uniqueInstances = new Map<string, UniqueItemInstance>();

        for (const [id, item] of Items.itemsPerId) {
            if (item.isA("Unique")) {
                const pots = new Map<string, number>();
                for (const [id, _] of item.trait(Unique).getPotConfigs()) {
                    pots.set(id, random.NextNumber());
                }
                uniqueInstances.set(HttpService.GenerateGUID(false), {
                    baseItemId: id,
                    pots,
                    created: 0,
                });
            } else {
                quantityPerItem.set(id, random.NextInteger(1, 100));
            }
        }
        Packets.inventory.set(quantityPerItem);
        Packets.uniqueInstances.set(uniqueInstances);
    }
}

export = StoryMocking;
