import { RunService } from "@rbxts/services";
import Quest, { Stage } from "server/Quest";
import RustyFactory from "shared/items/miscellaneous/RustyFactory";
import ToolShop from "shared/items/tools/ToolShop";
import { Dialogue } from "shared/NPC";
import Ricarg from "shared/npcs/Ricarg";
import Price from "shared/Price";
import { GameUtils } from "shared/utils/ItemUtils";

const minFundsAmount = 10000;
const req = new Price().setCost("Funds", minFundsAmount);

export = new Quest(script.Name)
    .setName("Earning Capital")
    .setLength(1)
    .setLevel(1)
    .setOrder(3)
    .addStage(new Stage()
        .setDescription("Talk with %npc% at %coords%.")
        .setNPC("Ricarg", true)
        .setDialogue(new Dialogue(Ricarg, "I need money...")
            .monologue(`Could you spare ${req.toString()} for me? Please?`)
            .root
        )
        .onStart((stage) => {
            const connection = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue)
                    stage.completed.fire();
            });
            return () => connection.disconnect();
        }, (stage) => {
            stage.npcHumanoid!.RootPart!.Anchored = true;
            return () => { };
        })
    )
    .addStage(new Stage()
        .setDescription(`Get ${req.toString()} and give it to %npc%.`)
        .setNPC("Ricarg", true)
        .onStart((stage) => {
            const CurrencyService = GameUtils.currencyService;
            const unmetDialogue = new Dialogue(Ricarg, `Please... I need ${req.toString()}...`);
            const metDialogue = new Dialogue(Ricarg, "You actually have the money!?")
                .monologue("Thank you so much! You know what? I'll give you my most prized possession.")
                .monologue(`Here it is, a ${RustyFactory.name}. I don't have a mine to use it, but you obviously do.`)
                .monologue("What are you waiting for? Go wild with it!")
                .root;
            let t = 0;
            const c1 = RunService.Heartbeat.Connect((dt) => {
                t += dt;
                if (t < 0.5)
                    return;
                t = 0;
                const funds = CurrencyService.getCost("Funds");
                if (funds.lessThan(minFundsAmount)) {
                    GameUtils.addDialogue(unmetDialogue);
                    GameUtils.removeDialogue(metDialogue);
                }
                else {
                    GameUtils.addDialogue(metDialogue);
                    GameUtils.removeDialogue(unmetDialogue);
                }
            });
            const c2 = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue !== metDialogue)
                    return;
                if (CurrencyService.purchase(req))
                    stage.completed.fire();
            });
            return () => {
                c1.Disconnect();
                c2.disconnect();
            };
        })
    )
    .setCompletionDialogue(new Dialogue(Ricarg, `What's up? I don't have another ${RustyFactory.name}, but I do have some tools that might be useful to you!`))
    .onInit((quest) => {
        GameUtils.dialogueFinished.connect((dialogue) => {
            if (dialogue === quest.completionDialogue) {
                if (GameUtils.itemsService.getItemAmount(RustyFactory.id) === 0)
                    GameUtils.giveQuestItem(RustyFactory.id, 1);
                GameUtils.openShop(ToolShop.id);
            }
        });
    })
    .setReward({
        xp: 80,
        items: new Map([
            [RustyFactory.id, 1]
        ])
    });