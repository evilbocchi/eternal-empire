import { Players, Workspace } from "@rbxts/services";
import { Soliloquy } from "server/interactive/npc/NPC";
import Quest, { Stage } from "server/quests/Quest";
import { Server } from "shared/api/APIExpose";
import { getMaxXp } from "shared/constants";
import AllConsumingTub from "shared/items/2/anguish/AllConsumingTub";
import TimeAccelerator from "shared/items/2/horrific/TimeAccelerator";
import PurpleSyringe from "shared/items/2/unreal/PurpleSyringe";
import Packets from "shared/Packets";

export = new Quest(script.Name)
    .setName("Miner Haven")
    .setLength(1)
    .setLevel(999)
    .setOrder(1)
    .addStage(
        new Stage().setDescription(`...`).onReached((stage) => {
            Packets.serverMusicEnabled.set(false);
            Server.empireData.items.inventory.set(PurpleSyringe.id, 1);
            Server.empireData.items.inventory.set(AllConsumingTub.id, 1);
            Server.Item.requestChanges();

            const dialogue = new Soliloquy("...my mine.").monologue(
                "I haven't checked my inventory in a while. I wonder if I have any new items...",
            ).root;

            const onChildAdded = (child: Instance) => {
                const player = Players.GetPlayerFromCharacter(child);
                if (!player) return;

                task.delay(3.5, () => {
                    dialogue.talk(false, [player]);
                    print("Prompting player to check inventory");
                });
            };

            const childAddedConnection = Workspace.ChildAdded.Connect(onChildAdded);
            for (const child of Workspace.GetChildren()) {
                onChildAdded(child);
            }

            const finishedConnection = dialogue.finished.connect(() => {
                stage.complete();
            });

            return () => {
                childAddedConnection.Disconnect();
                finishedConnection.Disconnect();
            };
        }),
    )
    .addStage(
        new Stage().setDescription("Check your inventory. Earn Time.").onReached((stage) => {
            Packets.serverMusicEnabled.set(true);
            Packets.trackQuest.toAllClients(script.Name);

            let completed = false;
            const connection = Server.Currency.balanceChanged.connect((balance) => {
                if (completed) return;

                if (balance.get("Time")?.moreThan(0)) {
                    stage.complete();
                    completed = true;
                }
            });

            return () => {
                connection.Disconnect();
            };
        }),
    )
    .addStage(
        new Stage().setDescription(`...`).onReached((stage) => {
            const dialogue = new Soliloquy("Time... It's a precious resource.")
                .monologue("I should probably start using it to buy some upgrades for my mine...")
                .monologue("After all, I can't let my competitors get ahead of me.").root;

            dialogue.talk();

            const finishedConnection = dialogue.finished.connect(() => {
                stage.complete();
            });

            return () => {
                finishedConnection.Disconnect();
            };
        }),
    )
    .addStage(
        new Stage().setDescription(`Buy some upgrades from the shop to earn more Time.`).onReached((stage) => {
            let completed = false;
            const connection = Server.Currency.balanceChanged.connect((balance) => {
                if (completed) return;

                if (balance.get("Time")?.moreThan(10000)) {
                    stage.complete();
                    completed = true;
                }
            });

            return () => {
                connection.Disconnect();
            };
        }),
    )
    .addStage(
        new Stage().setDescription(`...`).onReached((stage) => {
            const dialogue = new Soliloquy("Upgrades... They make such a difference.")
                .monologue("With these, I can optimize my mine and increase my Time production.")
                .monologue("The future looks bright for my mining endeavors.").root;

            dialogue.talk();

            const finishedConnection = dialogue.finished.connect(() => {
                stage.complete();
                Server.Item.unplaceItemsInArea(undefined, "MinerHaven");
                Server.Data.empireData.items.inventory.set(PurpleSyringe.id, 0);
                Server.Data.empireData.items.inventory.set(AllConsumingTub.id, 0);
                Server.Data.empireData.items.inventory.set(TimeAccelerator.id, 0);
                Server.Item.setBoughtAmount(PurpleSyringe, 0);
                Server.Item.setBoughtAmount(AllConsumingTub, 0);
                Server.Item.setBoughtAmount(TimeAccelerator, 0);
                Server.Item.requestChanges();
            });

            return () => {
                finishedConnection.Disconnect();
            };
        }),
    )
    .setReward({
        xp: getMaxXp(0),
    });
