import { RunService } from "@rbxts/services";
import { Dialogue } from "shared/NPC";
import Price from "shared/Price";
import Quest, { Stage } from "shared/Quest";
import SkillPod from "shared/items/miscellaneous/SkillPod";
import GrassConveyor from "shared/items/negative/friendliness/GrassConveyor";
import Prest from "shared/npcs/Prest";
import Tria from "shared/npcs/Tria";

const prestAnnoyance = new Dialogue(Prest, "If you don't want to purchase anything, then scram. I have other customers waiting for me.");

export = new Quest(script.Name)
.setName("Friendly Negotiations")
.setLength(1)
.setLevel(2)
.addStage(new Stage()
    .setDescription(`Talk to %npc% again at %coords%.`)
    .setNPC("Tria", true)
    .setDialogue(new Dialogue(Tria, `Hey! I see that you've made quite the name for yourself around here. Your reputation precedes you, and that's exactly why I need your help with something.`)
        .monologue("I have something to ask of you... You know that guy selling crates and logs outside of my house?")
        .monologue("Normally, I wouldn't mind someone doing business on my turf, but the problem is he's selling them at ridiculous prices!")
        .monologue("It would be fine if it didn't paint me as one of his associates too. Though, honestly, I'd rather he just stop trying.")
        .monologue("Can you find a way to make him change his prices for good? Whether you negotiate with him, convince him of a fair deal, or find some other creative solution, I trust you can handle it.")
        .root
    )
    .onStart((utils, stage) => {
        const replacement = new Dialogue(Prest, "Buy your crates and logs here! Wait, nevermind. We're out of stock.");
        utils.addDialogue(Prest, replacement);
        const connection = utils.dialogueFinished.connect((dialogue) => {
            if (dialogue === stage.dialogue)
                stage.completed.fire();
        });
        return () => {
            connection.disconnect();
            utils.removeDialogue(Prest, replacement);
        };
    })
)
.addStage(new Stage()
    .setDescription(`Negotiate with %npc% at %coords%.`)
    .setNPC("Prest", true)
    .setDialogue(new Dialogue(Prest, `Buy your crates and logs here! Seriously, only for ${new Price().setCost("Funds", 1e+18).tostring()}! These are the best quality you'll find anywhere.`)
        .monologue("Hey, customer! What are you waiting for? Give me your money and get some crates and logs! This is a once-in-a-lifetime offer, so don't miss out!")
        .monologue("What, you want the prices lowered? No can do. They're already the cheapest they can be! You won't find a better deal, I promise you.")
        .monologue(`...Unless, you have a ${GrassConveyor.name}. Hah, I know you don't.`)
        .root
    )
    .onStart((utils, stage) => {
        const replacement = new Dialogue(Tria, "Find a way to make him change his prices for good!");
        utils.addDialogue(Tria, replacement);
        const connection = utils.dialogueFinished.connect((dialogue) => {
            if (dialogue === stage.dialogue)
                stage.completed.fire();
        });
        return () => {
            connection.disconnect();
            utils.removeDialogue(Tria, replacement);
        };
    })
)
.addStage(new Stage()
    .setDescription(`Get a ${GrassConveyor.name}.`)
    .setDialogue(new Dialogue(Tria, `He says he wants a ${GrassConveyor.name}?`)
        .monologue("What a jerk... Unfortunately, I don't think he'll bend any other way.")
        .monologue("You'll have to do this yourself, sorry. It costs quite a bit, but I'm sure you can make it.")
        .root
    )
    .onStart((utils, stage) => {
        utils.addDialogue(Prest, prestAnnoyance);
        let t = 0;
        const connection = RunService.Heartbeat.Connect((dt) => {
            t += dt;
            if (t < 0.5)
                return;
            t = 0;
            if (utils.getBoughtAmount(GrassConveyor.id) > 0) {
                stage.completed.fire();
            }
        });
        return () => {
            connection.Disconnect();
            utils.removeDialogue(Prest, prestAnnoyance);
        };
    })
)
.addStage(new Stage()
    .setDescription(`Return to Prest with the ${GrassConveyor.name}.`)
    .setDialogue(new Dialogue(Prest, "Can you stop bothering me already?")
        .root
    )
    .setNPC("Prest", true)
    .onStart((utils, stage) => {
        const replacement = new Dialogue(Tria, "Find a way to make him change his prices for good!");
        utils.addDialogue(Tria, replacement);
        const continuation = new Dialogue(Prest, "Wait... Is that actually it?")
        .monologue("...")
        .monologue("......")
        .monologue(`Actually, I also said I wanted a ${SkillPod.name}. I'll be taking that ${GrassConveyor.name} though.`)
        .monologue(`I know you don't have a ${SkillPod.name}, but I'm gonna be nice and hold onto your ${GrassConveyor.name} for you.`)
        .monologue("See you again never!")
        .root;
        const connection = utils.dialogueFinished.connect((dialogue) => {
            if (dialogue === stage.dialogue && utils.takeQuestItem(GrassConveyor.id, 1) === true) {
                utils.talk(continuation);
                stage.completed.fire();
            }
        });
        return () => {
            connection.disconnect();
            utils.removeDialogue(Tria, replacement);
        };
    })
)
.addStage(new Stage()
    .setDescription("Negotiating with him any further would be futile. Get assistance from %npc%.")
    .setNPC("Tria", true)
    .setDialogue(new Dialogue(Tria, "That guy... Ugh. To be fair, you can't blame him. He just wants to get out of here, like the rest of us.")
        .monologue(`But the way he's doing it is wrong. Here, a ${SkillPod.name}.`)
        .monologue("Use this to convince him. This may be overkill, but it will definitely work.")
        .root
    )
    .onStart((utils, stage) => {
        utils.addDialogue(Prest, prestAnnoyance);
        const connection = utils.dialogueFinished.connect((dialogue) => {
            if (dialogue === stage.dialogue) {
                utils.giveQuestItem(SkillPod.id, 1);
                stage.completed.fire();
            }
                
        });
        return () => {
            connection.disconnect();
            utils.removeDialogue(Prest, prestAnnoyance);
        };
    })
)
.addStage(new Stage()
    .setDescription(`Talk to %npc% again.`)
    .setNPC("Prest", true)
    .setDialogue(new Dialogue(Prest, "Buy your crates and logs here! ...No, really. Please just leave.")
        .monologue(`Wait. Is that... A ${SkillPod.name?.upper()}!?!?`)
        .monologue("And for ME!?!? Thank you, thank you! Take my entire stock!")
        .monologue("You don't want it? If that's so, I'm just gonna give away everything on me!")
        .monologue(`This ${SkillPod.name} is gonna change my life... Thank you, from the bottom of my heart!`)
        .root
    )
    .onStart((utils, stage) => {
        const replacement = new Dialogue(Tria, `Use that ${SkillPod.name} to help with your negotiations!`);
        utils.addDialogue(Tria, replacement);
        const connection = utils.dialogueFinished.connect((dialogue) => {
            if (dialogue === stage.dialogue) {
                utils.takeQuestItem(SkillPod.id, 1);
                stage.completed.fire();
            }
        });
        return () => {
            connection.disconnect();
            utils.removeDialogue(Tria, replacement);
        };
    })
)
.setCompletionDialogue(new Dialogue(Prest, "Selling my last crates and logs for free! I'm gonna be a success now!"))
.setReward({
    xp: 170
});