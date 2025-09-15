import { Dialogue } from "server/NPC";
import Ricarg from "server/npcs/Ricarg";
import Quest, { Stage } from "server/Quest";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import ItemCounter from "shared/item/ItemCounter";
import { Server } from "shared/item/ItemUtils";
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

                const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                    if (dialogue === stage.dialogue) {
                        Server.Quest.giveQuestItem(TheFirstUpgraderBooster.id, 1);
                        stage.complete();
                    }
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

                const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                    if (dialogue === stage.dialogue && Server.Currency.purchase(req)) {
                        Server.Dialogue.talk(continuation);
                    } else if (dialogue === continuation) {
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .setCompletionDialogue(
        new Dialogue(
            Ricarg,
            `What's up? I don't have another ${RustyFactory.name}, but I do have some tools that might be useful to you!`,
        ),
    )
    .onInit((quest) => {
        Server.Dialogue.dialogueFinished.connect((dialogue) => {
            if (dialogue === quest.completionDialogue) {
                const items = Server.empireData.items;
                const [invCount, placedCount] = ItemCounter.getAmounts(
                    items.inventory,
                    items.worldPlaced,
                    RustyFactory.id,
                );
                if (invCount + placedCount === 0) Server.Quest.giveQuestItem(RustyFactory.id, 1);
            }
        });
    })
    .setReward({
        xp: 80,
        items: new Map([[RustyFactory.id, 1]]),
    });
