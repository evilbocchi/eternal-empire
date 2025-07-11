import { RunService } from "@rbxts/services";
import { Dialogue } from "shared/NPC";
import Price from "shared/Price";
import Quest, { Stage } from "shared/Quest";
import RustyFactory from "shared/items/miscellaneous/RustyFactory";
import Ricarg from "shared/npcs/Ricarg";

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
        .monologue(`Could you spare ${req.tostring()} for me? Please?`)
        .root
    )
    .onStart((utils, stage) => {
        const connection = utils.dialogueFinished.connect((dialogue) => {
            if (dialogue === stage.dialogue)
                stage.completed.fire();
        });
        return () => connection.disconnect();
    }, (_utils, stage) => {
        stage.npcHumanoid!.RootPart!.Anchored = true;
        return () => {};
    })
)
.addStage(new Stage()
    .setDescription(`Get ${req.tostring()} and give it to %npc%.`)
    .setNPC("Ricarg", true)
    .onStart((utils, stage) => {
        const unmetDialogue = new Dialogue(Ricarg, `Please... I need ${req.tostring()}...`);
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
            const funds = utils.getBalance().getCost("Funds");
            if (funds === undefined || funds.lessThan(minFundsAmount)) {
                utils.addDialogue(Ricarg, unmetDialogue);
                utils.removeDialogue(Ricarg, metDialogue);
            }
            else {
                utils.addDialogue(Ricarg, metDialogue);
                utils.removeDialogue(Ricarg, unmetDialogue);
            }
        });
        const c2 = utils.dialogueFinished.connect((dialogue) => {
            if (dialogue !== metDialogue)
                return;
            const balance = utils.getBalance();
            const funds = balance.getCost("Funds");
            if (funds === undefined || funds.lessThan(minFundsAmount))
                return;
            utils.setBalance(balance.setCost("Funds", funds.sub(minFundsAmount)));
            stage.completed.fire();
        });
        return () => {
            c1.Disconnect();
            c2.disconnect();
        };
    })
)
.setReward({
    xp: 80,
    items: new Map([
        [RustyFactory, 1]
    ])
});