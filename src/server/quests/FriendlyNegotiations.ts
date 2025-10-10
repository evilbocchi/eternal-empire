import { RunService } from "@rbxts/services";
import Quest, { Stage } from "server/quests/Quest";
import SkillPod from "shared/items/0/millisecondless/SkillPod";
import GrassConveyor from "shared/items/negative/friendliness/GrassConveyor";
import { Dialogue } from "server/interactive/npc/NPC";
import Prest from "server/interactive/npc/Prest";
import Tria from "server/interactive/npc/Tria";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { Server } from "shared/api/APIExpose";

const prestAnnoyance = new Dialogue(
    Prest,
    "If you don't want to purchase anything, then scram. I have other customers waiting for me.",
);

export = new Quest(script.Name)
    .setName("Friendly Negotiations")
    .setLength(1)
    .setLevel(2)
    .addStage(
        new Stage()
            .setDescription(`Talk to Tria again at %coords%.`)
            .setNPC(Tria, true)
            .setDialogue(
                new Dialogue(
                    Tria,
                    `O-Oh! Hi again... Uh, I... I see you've been... doing well around here? I guess... people know your name now.`,
                )
                    .monologue(
                        "Um... so... I have a... something to ask you... You know that guy... selling crates and logs outside my place?",
                    )
                    .monologue(
                        "Normally, I wouldn't mind... I mean, it's not like it's huge deal... but... he's charging... um... kinda ridiculous prices!",
                    )
                    .monologue(
                        "It... it kinda makes me look like I'm one of his... associates too... which is... ugh... not great.",
                    )
                    .monologue(
                        "Could you maybe... find a way to... make him change his prices? Uh... however you want... I trust you... I think.",
                    ).root,
            )
            .onReached((stage) => {
                const replacement = new Dialogue(
                    Prest,
                    "Buy your crates and logs here! Wait, nevermind. We're out of stock.",
                );
                replacement.add();
                const connection = stage.dialogue!.finished.connect(() => {
                    stage.complete();
                });
                return () => {
                    connection.disconnect();
                    replacement.remove();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Negotiate with Prest at %coords%.`)
            .setNPC(Prest, true)
            .setDialogue(
                new Dialogue(
                    Prest,
                    `Buy your crates and logs here! Seriously, only for ${new CurrencyBundle().set("Funds", 1e18).toString()}! These are the best quality you'll find anywhere.`,
                )
                    .monologue(
                        "Hey, customer! What are you waiting for? Give me your money and get some crates and logs! This is a once-in-a-lifetime offer, so don't miss out!",
                    )
                    .monologue(
                        "What, you want the prices lowered? No can do. They're already the cheapest they can be! You won't find a better deal, I promise you.",
                    )
                    .monologue(`...Unless, you have a ${GrassConveyor.name}. Hah, I know you don't.`).root,
            )
            .onReached((stage) => {
                const replacement = new Dialogue(
                    Tria,
                    "O-oh! Uh... y-you're... you're not supposed to... um... be talking to me right now, I... I mean... sorry! I... I didn't mean to... ugh, never mind!",
                );
                replacement.add();

                const replacement2 = new Dialogue(
                    Tria,
                    "I... I just... uh... wanted to say something, but... maybe I shouldn't...",
                ).monologue("P-please... just... come back later, okay? I... I'll explain then...").root;

                const replacementConn = replacement.finished.connect(() => {
                    replacement.remove();
                    replacement2.add();
                });
                const stageDialogueConn = stage.dialogue!.finished.connect(() => {
                    stage.complete();
                });
                return () => {
                    replacementConn.disconnect();
                    stageDialogueConn.disconnect();
                    replacement.remove();
                    replacement2.remove();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Get a ${GrassConveyor.name}.`)
            .setDialogue(
                new Dialogue(Tria, `H-He said he wants a ${GrassConveyor.name}? Uh... wow.`)
                    .monologue(
                        "What a... um... jerk, right? Unfortunately... I don't think he'll... bend any other way.",
                    )
                    .monologue(
                        "You... you'll have to do this yourself... sorry. It costs a bit, but... I believe in you, maybe...",
                    ).root,
            )
            .onReached((stage) => {
                prestAnnoyance.add();
                let t = 0;
                const ItemService = Server.Item;
                const connection = RunService.Heartbeat.Connect((dt) => {
                    t += dt;
                    if (t < 0.5) return;
                    t = 0;
                    if (ItemService.getBoughtAmount(GrassConveyor.id) > 0) {
                        stage.complete();
                    }
                });
                return () => {
                    connection.Disconnect();
                    prestAnnoyance.remove();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Return to Prest with the ${GrassConveyor.name}.`)
            .setDialogue(new Dialogue(Prest, "Can you stop bothering me already?").root)
            .setNPC(Prest, true)
            .onReached((stage) => {
                const replacement = new Dialogue(
                    Tria,
                    "O-okay... uh... I... I hope this is... fine? I mean... I don't know if it's fine... ugh...",
                )
                    .monologue(
                        "W-wait... did I... say the wrong thing? I... I just... uh... hope he doesn't get mad...",
                    )
                    .monologue("P-please... don't mess this up... I... I believe in you, maybe...").root;
                replacement.add();

                const continuation = new Dialogue(Prest, "Wait... Is that actually it?")
                    .monologue("...")
                    .monologue("......")
                    .monologue(
                        `Actually, I also said I wanted a ${SkillPod.name}. I'll be taking that ${GrassConveyor.name} though.`,
                    )
                    .monologue(
                        `I know you don't have a ${SkillPod.name}, but I'm gonna be nice and hold onto your ${GrassConveyor.name} for you.`,
                    )
                    .monologue("See you again never!").root;
                const stageDialogueConn = stage.dialogue!.finished.connect(() => {
                    continuation.talk();
                });
                const continuationConn = continuation.finished.connect(() => {
                    if (Server.Quest.takeQuestItem(GrassConveyor.id, 1) === true) {
                        stage.complete();
                    }
                });
                return () => {
                    stageDialogueConn.disconnect();
                    continuationConn.disconnect();
                    replacement.remove();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription("Negotiating with him any further would be futile. Get assistance from Tria.")
            .setNPC(Tria, true)
            .setDialogue(
                new Dialogue(
                    Tria,
                    "That guy... ugh... I can't really blame him. He just... wants to get out of here, I guess... like the rest of us.",
                )
                    .monologue("But... the way he's doing it... it's kinda wrong, haha... I think.")
                    .monologue(`Here... uh... take this ${SkillPod.name}.`)
                    .monologue("It's... a bit much, maybe, but... it should... probably work?").root,
            )
            .onReached((stage) => {
                prestAnnoyance.add();
                const connection = stage.dialogue!.finished.connect(() => {
                    Server.Quest.giveQuestItem(SkillPod.id, 1);
                    stage.complete();
                });
                return () => {
                    connection.disconnect();
                    prestAnnoyance.remove();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Talk to Prest again.`)
            .setNPC(Prest, true)
            .setDialogue(
                new Dialogue(Prest, "Buy your crates and logs here! ...No, really. Please just leave.")
                    .monologue(`Wait. Is that... A ${SkillPod.name?.upper()}!?!?`)
                    .monologue("And for ME!?!? Thank you, thank you! Take my entire stock!")
                    .monologue("You don't want it? If that's so, I'm just gonna give away everything on me!")
                    .monologue(
                        `This ${SkillPod.name} is gonna change my life... Thank you, from the bottom of my heart!`,
                    ).root,
            )
            .onReached((stage) => {
                const replacement = new Dialogue(
                    Tria,
                    `Uh... okay... use that ${SkillPod.name} to... help with your... negotiations... I guess.`,
                ).monologue("I... I hope it works... fingers crossed...").root;
                replacement.add();
                const connection = stage.dialogue!.finished.connect(() => {
                    Server.Quest.takeQuestItem(SkillPod.id, 1);
                    stage.complete();
                });
                return () => {
                    connection.disconnect();
                    replacement.remove();
                };
            }),
    )
    .setCompletionDialogue(new Dialogue(Prest, "Selling my last crates and logs for free! I'm gonna be a success now!"))
    .setReward({
        xp: 170,
    });
