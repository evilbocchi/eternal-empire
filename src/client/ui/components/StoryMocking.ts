import { OnoeNum } from "@antivivi/serikanum";
import { useEffect } from "@rbxts/react";
import { HttpService, ReplicatedStorage } from "@rbxts/services";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import PlayerProfileTemplate from "shared/data/PlayerProfileTemplate";
import Unique from "shared/item/traits/Unique";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

class StoryMocking {
    static mockData() {
        const mockPlayerData = table.clone(PlayerProfileTemplate);

        Packets.buyItem.fromClient((player, itemId) => {
            print(player.Name + " is buying item " + itemId);
            const inventory = Packets.inventory.get();
            inventory.set(itemId, (inventory.get(itemId) ?? 0) + 1);
            const bought = Packets.bought.get();
            bought.set(itemId, (bought.get(itemId) ?? 0) + 1);
            Packets.inventory.set(inventory);
            Packets.bought.set(bought);
            return true;
        });

        useEffect(() => {
            const setSetting = Packets.setSetting.fromClient((player, setting, value) => {
                (mockPlayerData.settings as { [key: string]: unknown })[setting] = value;
                Packets.settings.setFor(player, mockPlayerData.settings);
            });

            const setHotkey = Packets.setHotkey.fromClient((player, key, action) => {
                mockPlayerData.settings.hotkeys[key] = action;
                Packets.settings.setFor(player, mockPlayerData.settings);
            });

            return () => {
                setSetting.Disconnect();
                setHotkey.Disconnect();
            };
        }, []);

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
            stages: [{ description: "Complete the first task." }, { description: "Complete the second task." }],
        });
        questInfos.set("Quest2", {
            name: "Second Quest",
            colorR: 25,
            colorG: 66,
            colorB: 200,
            level: 4,
            length: 3,
            reward: { xp: 500, items: new Map([["TheFirstDropper", 1]]) },
            order: 2,
            stages: [{ description: "Complete the first task." }, { description: "Complete the second task." }],
        });
        questInfos.set("Quest3", {
            name: "Third Quest",
            colorR: 250,
            colorG: 20,
            colorB: 100,
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
            colorR: 6,
            colorG: 6,
            colorB: 200,
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

        useEffect(() => {
            const keys = new Array<string>();
            for (const [id, questInfo] of questInfos) {
                for (let stage = 0; stage < questInfo.stages.size(); stage++) {
                    const key = id + stage;
                    keys.push(key);
                    ReplicatedStorage.SetAttribute(key, new Vector3(stage * 10, 0, stage * 10));
                }
            }
            return () => {
                for (const key of keys) {
                    ReplicatedStorage.SetAttribute(key, undefined);
                }
            };
        }, []);

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

        Packets.balance.set(this.mockCurrencies().amountPerCurrency);
        Packets.revenue.set(this.mockCurrencies().amountPerCurrency);
    }

    private static mockCurrencies() {
        const balance = new CurrencyBundle();
        for (const [currency] of pairs(CURRENCY_DETAILS)) {
            balance.set(currency, OnoeNum.fromSerika(math.random(1, 100), math.random(1, 500)));
        }
        return balance;
    }
}

export = StoryMocking;
