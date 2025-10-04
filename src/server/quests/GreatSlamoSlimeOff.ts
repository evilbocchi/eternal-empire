import { Dialogue } from "server/interactive/npc/NPC";
import SlamoMcManager from "server/interactive/npc/Slamo McManager";
import Quest, { Stage } from "server/quests/Quest";
import { Server } from "shared/api/APIExpose";
import { emitEffect, playSound } from "shared/asset/GameAssets";
import { WAYPOINTS } from "shared/constants";

export = new Quest(script.Name)
    .setName("The Great Slamo Slime-Off")
    .setLength(8)
    .setLevel(5)
    .setOrder(9)
    .createQuestRequirement("ToTheVillage")
    .addStage(
        new Stage()
            .setDescription(`Talk to Slamo McManager at the festival grounds at %coords%.`)
            .setNPC(SlamoMcManager, true)
            .setDialogue(
                new Dialogue(
                    SlamoMcManager,
                    "BRO! OH MY GOD, YOU GOTTA HELP ME! This is literally the worst day of my LIFE!",
                )
                    .monologue(
                        "So like, the annual Slamo Slime-Off is TODAY, right? And our STAR attraction, the Mega-Slime, just... YEETED itself outta the pen!",
                    )
                    .monologue(
                        "I blinked for ONE SECOND—literally ONE SECOND—and it just SLID outta here! Like fr fr, it just said 'aight imma head out' and dipped!",
                    )
                    .monologue(
                        "And get this—it SPLIT INTO 5 MINI-SLIMES! They're scattered all over the village now, vibing in random spots!",
                    )
                    .monologue(
                        "Everyone here is either too lazy or too busy to help. Like, I asked Chad over there and he was like 'nah bruh, that's a you problem.'",
                    )
                    .monologue(
                        "Can you PLEASE help me find all 5 Mini-Slimes? They're hiding around the village—I think I saw one near the fountain but I was too stressed to check!",
                    )
                    .monologue(
                        "If we don't get them back, the festival is CANCELLED and I'm gonna lose my job! The whole village is counting on this, no cap!",
                    ).root,
            )
            .onReached((stage) => {
                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === stage.dialogue) {
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Find the Mini-Slime hiding near the fountain.`)
            .setDialogue(new Dialogue(SlamoMcManager, "I think I saw one vibing near the fountain! Check there first!"))
            .onReached((stage) => {
                new Dialogue(
                    SlamoMcManager,
                    "Okay so like, I'm pretty sure one of them is chilling near the fountain. Go check it out!",
                ).talk();

                const connection = Server.Event.addCompletionListener("FoundFountainSlime", (isCompleted) => {
                    if (isCompleted) {
                        new Dialogue(
                            SlamoMcManager,
                            "YOOO you found one! That's 1 down, 4 to go! You're doing amazing sweetie!",
                        ).talk();
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Find the Mini-Slime hiding behind the market stall.`)
            .setDialogue(
                new Dialogue(
                    SlamoMcManager,
                    "I bet another one is hiding behind that market stall—they love dark spots!",
                ),
            )
            .onReached((stage) => {
                new Dialogue(
                    SlamoMcManager,
                    "There's definitely one behind the market stall. Those slimes LOVE hiding in the shade!",
                ).talk();

                const connection = Server.Event.addCompletionListener("FoundStallSlime", (isCompleted) => {
                    if (isCompleted) {
                        new Dialogue(
                            SlamoMcManager,
                            "LETS GOOO! Another one! You're literally carrying this whole operation rn!",
                        ).talk();
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Find the Mini-Slime hiding in the well.`)
            .setDialogue(
                new Dialogue(
                    SlamoMcManager,
                    "Check the well! I heard some squishy sounds coming from there earlier...",
                ),
            )
            .onReached((stage) => {
                new Dialogue(
                    SlamoMcManager,
                    "The well! Check the well! I'm like 99% sure there's one down there!",
                ).talk();

                const connection = Server.Event.addCompletionListener("FoundWellSlime", (isCompleted) => {
                    if (isCompleted) {
                        new Dialogue(
                            SlamoMcManager,
                            "SHEEEESH! Three down! You're on FIRE! Well, not literally, but you know what I mean!",
                        ).talk();
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Find the Mini-Slime hiding on the rooftop.`)
            .setDialogue(
                new Dialogue(
                    SlamoMcManager,
                    "One of them somehow got onto a rooftop. Don't ask me how, slimes are just built different!",
                ),
            )
            .onReached((stage) => {
                new Dialogue(
                    SlamoMcManager,
                    "Bro, one of them is literally on a ROOFTOP. Like HOW?! Anyway, go get it!",
                ).talk();

                const connection = Server.Event.addCompletionListener("FoundRooftopSlime", (isCompleted) => {
                    if (isCompleted) {
                        new Dialogue(
                            SlamoMcManager,
                            "NO WAY! You actually got the rooftop one! One more to go and we're golden!",
                        ).talk();
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Find the last Mini-Slime hiding behind a tree.`)
            .setDialogue(
                new Dialogue(
                    SlamoMcManager,
                    "The last one is probably behind one of those big trees. They love nature and stuff!",
                ),
            )
            .onReached((stage) => {
                new Dialogue(
                    SlamoMcManager,
                    "Okay last one! I think it's behind one of those thicc trees. Go find it!",
                ).talk();

                const connection = Server.Event.addCompletionListener("FoundTreeSlime", (isCompleted) => {
                    if (isCompleted) {
                        new Dialogue(
                            SlamoMcManager,
                            "YESSSS! You found all of them! Now we just gotta get them back to the pen. This is gonna be EPIC!",
                        ).talk();
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Herd all 5 Mini-Slimes back to the festival pen.`)
            .setDialogue(
                new Dialogue(
                    SlamoMcManager,
                    "Alright, now for the fun part—we gotta herd these slippery bois back to the pen!",
                )
                    .monologue(
                        "They're kinda bouncy and might try to run away, but just guide them toward the pen. Use your skills!",
                    )
                    .monologue("I believe in you! Get them all in the pen and the magic will do the rest!").root,
            )
            .onReached((stage) => {
                new Dialogue(
                    SlamoMcManager,
                    "Okay, herding time! Just guide them into the pen. They're slippery but you got this!",
                ).talk();

                const connection = Server.Event.addCompletionListener("AllSlimesHerded", (isCompleted) => {
                    if (isCompleted) {
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Watch the Mini-Slimes fuse back into the Mega-Slime!`)
            .setNPC(SlamoMcManager, true)
            .setDialogue(
                new Dialogue(SlamoMcManager, "YOOO THEY'RE FUSING! THIS IS SO HYPE! Look at them go!")
                    .monologue("THE MEGA-SLIME IS BACK! THE FESTIVAL IS SAVED!")
                    .monologue(
                        "Dude, you literally just saved the ENTIRE Slamo Slime-Off! The whole village is gonna be SO pumped!",
                    )
                    .monologue(
                        "As a token of our appreciation, take this exclusive Slime Hat! It's dripping with style, literally!",
                    )
                    .monologue(
                        "You're a legend! The festival can now proceed as planned. Everyone's gonna be talking about this for YEARS!",
                    )
                    .monologue("Thanks again! You're invited to the Slime-Off VIP section anytime!").root,
            )
            .onReached((stage) => {
                // Play fusion effects
                task.wait(1);
                playSound("MagicPowerUp.mp3");
                task.wait(0.5);
                emitEffect("ExpandingWhirls", SlamoMcManager.rootPart!, 10);
                task.wait(1);

                new Dialogue(SlamoMcManager, "AND THE MEGA-SLIME IS BACK! LET'S GOOOOO!").talk();

                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === stage.dialogue) {
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .setReward({
        xp: 450,
        area: "SlamoVillage",
    });
