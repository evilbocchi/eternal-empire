import { Dialogue } from "server/interactive/npc/NPC";
import Ricarg from "server/interactive/npc/Ricarg";
import Quest, { Stage } from "server/quests/Quest";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import countItemEverywhere from "shared/item/utils/countItemEverywhere";
import RustyFactory from "shared/items/negative/negativity/RustyFactory";
import TheFirstUpgraderBooster from "shared/items/negative/tfd/TheFirstUpgraderBooster";

const minFundsAmount = 10000;
const req = new CurrencyBundle().set("Funds", minFundsAmount);

export = new Quest(script.Name)
    .setName("Earning Capital")
    .setLength(1)
    .setLevel(1)
    .setOrder(3)
    .addStage(
        new Stage()
            .setDescription("Talk with Ricarg at %coords%.")
            .setNPC(Ricarg, true)
            .setDialogue(
                new Dialogue(Ricarg, "I need money...")
                    .monologue(
                        `I saw you started a mine in the middle of the island. Truthfully... everyone who has tried to make it profitable has failed.`,
                    )
                    .monologue(`But you... you might be different. I can give you a special item to help you out.`)
                    .monologue(
                        `Here it is, ${TheFirstUpgraderBooster.name}. Use it wisely... or don't. If you can make ${req.toString()}, I'll be impressed.`,
                    ).root,
            )
            .onReached((stage) => {
                Ricarg.rootPart!.CFrame = Ricarg.startingCFrame;
                Ricarg.playAnimation("Default");

                const connection = stage.dialogue!.finished.connect(() => {
                    Server.Quest.giveQuestItem(TheFirstUpgraderBooster, 1);
                    stage.complete();
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Get ${req.toString()} and give it to Ricarg.`)
            .setNPC(Ricarg, true)
            .setDialogue(new Dialogue(Ricarg, `Please... I need ${req.toString()}...`))
            .onReached((stage) => {
                Ricarg.rootPart!.CFrame = Ricarg.startingCFrame;
                Ricarg.playAnimation("Default");

                const continuation = new Dialogue(Ricarg, "Wait. You actually have the money!?")
                    .monologue("Thank you so much! You know what? I'll give you my most prized possession.")
                    .monologue(
                        `Here it is, a ${RustyFactory.name}. I don't have a mine to use it, but you obviously do.`,
                    )
                    .monologue("What are you waiting for? Go wild with it!").root;

                const stageDialogueConn = stage.dialogue!.finished.connect(() => {
                    if (Server.Currency.purchase(req)) {
                        continuation.talk();
                    }
                });

                const continuationConn = continuation.finished.connect(() => {
                    stage.complete();
                });

                return () => {
                    stageDialogueConn.disconnect();
                    continuationConn.disconnect();
                };
            }),
    )
    .setCompletionDialogue(
        new Dialogue(
            Ricarg,
            `What's up? I don't have another ${RustyFactory.name}, but I do have some tools that might be useful to you!`,
        ),
    )
    .onInit((quest) => {
        if (quest.completionDialogue) {
            quest.completionDialogue.finished.connect(() => {
                const items = Server.empireData.items;
                const [invCount, placedCount] = countItemEverywhere(
                    items.inventory,
                    items.worldPlaced,
                    RustyFactory.id,
                );
                if (invCount + placedCount === 0) Server.Quest.giveQuestItem(RustyFactory, 1);
            });
        }
    })
    .setReward({
        xp: 80,
        items: new Map([[RustyFactory.id, 1]]),
    });
