import { spawnExplosion } from "@antivivi/vrldk";
import { RunService, TweenService, Workspace } from "@rbxts/services";
import Librarian from "server/interactive/npc/Librarian";
import LibraryNoob1 from "server/interactive/npc/Library Noob 1";
import LibraryNoob2 from "server/interactive/npc/Library Noob 2";
import { Dialogue, EMPTY_NPC } from "server/interactive/npc/NPC";
import OldNoob from "server/interactive/npc/Old Noob";
import Pasal from "server/interactive/npc/Pasal";
import OldBooks1 from "server/interactive/object/OldBooks1";
import SuspiciousWall from "server/interactive/object/SuspiciousWall";
import Quest, { Stage } from "server/quests/Quest";
import { emitEffect, playSound } from "shared/asset/GameAssets";
import { WAYPOINTS } from "shared/constants";
import { Server } from "shared/item/ItemUtils";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import IrregularlyShapedKey from "shared/items/negative/skip/IrregularlyShapedKey";
import { AREAS } from "shared/world/Area";

const suspiciousWall = AREAS.BarrenIslands.map.WaitForChild("SuspiciousWall") as BasePart;

const oldNoobToApproachingPasal = OldNoob.createPathfindingOperation(
    OldNoob.startingCFrame,
    WAYPOINTS.LearningThePastOldNoobApproachingPasal.CFrame,
);

const oldNoobToApproachingWall = OldNoob.createPathfindingOperation(
    WAYPOINTS.LearningThePastOldNoobApproachingPasal.CFrame,
    WAYPOINTS.LearningThePastOldNoobApproachingWall.CFrame,
);

const pasalToApproachingWall = Pasal.createPathfindingOperation(
    Pasal.startingCFrame,
    WAYPOINTS.LearningThePastPasalApproachingWall.CFrame,
);

const oldNoobToEnteredCave = OldNoob.createPathfindingOperation(
    WAYPOINTS.LearningThePastEnterCave.CFrame,
    WAYPOINTS.LearningThePastOldNoobEnteredCave.CFrame,
);

const oldNoobToViewingLight = OldNoob.createPathfindingOperation(
    WAYPOINTS.LearningThePastOldNoobEnteredCave.CFrame,
    WAYPOINTS.LearningThePastOldNoobViewingLight.CFrame,
);

const pasalToViewingLight = Pasal.createPathfindingOperation(
    WAYPOINTS.LearningThePastPasalEnteredCave.CFrame,
    WAYPOINTS.LearningThePastPasalViewingLight.CFrame,
);

const oldNoobToEnterCave = OldNoob.createPathfindingOperation(
    WAYPOINTS.LearningThePastOldNoobViewingLight.CFrame,
    WAYPOINTS.LearningThePastEnterCave.CFrame,
    false,
);

const unlockWall = () => {
    const keyhole = suspiciousWall.WaitForChild("Keyhole") as BasePart;
    const inc = new Vector3(90, 0, 0);
    const keyModel = IrregularlyShapedKey.MODEL?.Clone();
    if (keyModel === undefined) return;
    keyModel.PrimaryPart!.CFrame = WAYPOINTS.LearningThePastKey.CFrame;
    keyModel.Parent = Workspace;
    const tweenInfo = new TweenInfo(0.5);
    TweenService.Create(keyModel.PrimaryPart!, tweenInfo, {
        Orientation: keyModel.PrimaryPart!.Orientation.add(inc),
    }).Play();
    TweenService.Create(keyhole, tweenInfo, { Orientation: keyhole.Orientation.sub(inc) }).Play();
    task.delay(1, () => {
        keyModel.Destroy();
        keyhole.Destroy();
        suspiciousWall.FindFirstChildOfClass("ProximityPrompt")?.Destroy();
        suspiciousWall.Transparency = 1;
        suspiciousWall.CanCollide = false;
        spawnExplosion(suspiciousWall.Position);
        emitEffect("Sparks", suspiciousWall, 2);
        playSound("ExplosiveUnlock.mp3", suspiciousWall);
        Server.Event.setEventCompleted("SuspiciousWallOpened", true);
    });
};

export = new Quest(script.Name)
    .setName("Learning The Past")
    .setLength(2)
    .setLevel(5)
    .setOrder(7)
    .addStage(
        new Stage()
            .setDescription("Talk to the Old Noob at %coords%.")
            .setNPC(OldNoob, true)
            .setDialogue(
                new Dialogue(OldNoob, "Just sit back and relax...")
                    .monologue("You want to learn about the history of the Barren Islands, huh? It's quite a tale.")
                    .monologue("It's been so long- the catastrophe that reduced the great 'Miner Haven' to this state.")
                    .monologue(
                        "I'll spare you the details for now, but if you're truly curious and want to delve deeper into the history, you should head to the library.",
                    ).root,
            )
            .onReached((stage) => {
                OldNoob.rootPart!.CFrame = OldNoob.startingCFrame;
                Pasal.rootPart!.CFrame = Pasal.startingCFrame;
                OldNoob.playAnimation("Default");
                Pasal.playAnimation("Default");

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
            .setDescription("Find details about the history of Barren Islands in the library at %coords%.")
            .setFocus(WAYPOINTS.LearningThePastLibraryEntrance)
            .onReached((stage) => {
                OldNoob.rootPart!.CFrame = OldNoob.startingCFrame;
                Pasal.rootPart!.CFrame = Pasal.startingCFrame;
                OldNoob.playAnimation("Default");
                Pasal.playAnimation("Default");

                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === OldBooks1.dialogue) {
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage().setDescription("Ask around the library for clues about the 'strike'.").onReached((stage) => {
            OldNoob.rootPart!.CFrame = OldNoob.startingCFrame;
            Pasal.rootPart!.CFrame = Pasal.startingCFrame;
            OldNoob.playAnimation("Default");
            Pasal.playAnimation("Default");

            const pasalDialogue = new Dialogue(Pasal, "Yahallo! ...You want that shiny green orb behind me?")
                .monologue("Sorry, I can't do that for you. It's not on sale.")
                .monologue("Why would you want that anyways?").root;
            const librarianDialogue = new Dialogue(Librarian, "About the strike... Well, it's actually pretty simple.")
                .monologue("This place is but a fragment of what the legendary 'Miner Haven' used to be.")
                .monologue(
                    "It was a thriving, bustling hub of activity, with miners working day and night, extracting valuable resources from the earth.",
                )
                .monologue(
                    "Then, one day, everything changed. It was business as usual until a comet came flying down from the sky.",
                )
                .monologue("The impact was devastating, as if the world came to a stop.")
                .monologue(
                    "The explosion rocked the foundations of Miner Haven, and in an instant, all that might and power was gone.",
                )
                .monologue("The comet's strike turned this prosperous land into the Barren Islands you see today.")
                .monologue("...")
                .monologue("The thing is, no one really knows where the comet came from.")
                .monologue("We've just assumed it came from space, but is that really true?")
                .monologue("Would the great Miner Haven make such a grave oversight?")
                .monologue("I don't think we have the full story.")
                .monologue("Listen. I've seen what you've been up to, and I have massive faith in you.")
                .monologue(
                    "Here's a key that'll let you enter a specific hideout. Maybe you can learn something we haven't.",
                ).root;
            const dialogues = [
                new Dialogue(LibraryNoob1, "The strike? I don't really know much about that.")
                    .monologue("Try asking the librarian instead. He's crazy about this kind of stuff.")
                    .monologue(
                        "If I had to put my finger on something though, maybe try looking for that Shopkeeper behind the library with a huge glowing green orb.",
                    )
                    .monologue(
                        "Every time I ask him about that, he only gives vague responses about some weird stuff related to time and this place.",
                    )
                    .monologue("Definitely suspicious to me, if I do say so myself.").root,
                new Dialogue(LibraryNoob2, "What's this thing about some weird collapse?").monologue(
                    "You might want to ask the librarian about that. I got no clue what you're talking about.",
                ).root,
            ];

            const continuation = new Dialogue(Pasal, "...")
                .monologue("Hey. How did you get that key?")
                .monologue("You'll tell me, right? Right?")
                .monologue("...Nevermind. It seems that you prefer to stay mute.")
                .monologue("I won't pry into what you've been up to, but let me tell you something.")
                .monologue(
                    "That key you have right now seethes of the aura of Skill. Even I can feel it. How in the world are you unfazed?",
                )
                .monologue(
                    "You know what it reminds me of? My green orb that came from literally nowhere. It's my soulmate... I love it so much... Wait. That's not the point.",
                )
                .monologue(
                    "Maybe you can find out where these weird objects were originally from. I'm honestly a little excited too, but I'll be waiting here for our next steps.",
                )
                .monologue(
                    "My name's Pasal. Try to consult the creepy old man at the docks. He's lived so long he probably saw that thing come into life.",
                ).root;

            for (const dialogue of dialogues) {
                dialogue.add();
            }
            librarianDialogue.add();
            pasalDialogue.add();
            const connection = Dialogue.finished.connect((dialogue) => {
                if (dialogue === librarianDialogue) {
                    Server.Quest.takeQuestItem(IrregularlyShapedKey.id, 1);
                    Server.Quest.giveQuestItem(IrregularlyShapedKey.id, 1);
                    librarianDialogue.remove();
                } else if (
                    dialogue === pasalDialogue &&
                    Server.Quest.takeQuestItem(IrregularlyShapedKey.id, 1) === true
                ) {
                    continuation.talk();
                } else if (dialogue === continuation) {
                    stage.complete();
                    Server.Event.setEventCompleted("PasalReveal", true);
                    Server.Quest.giveQuestItem(IrregularlyShapedKey.id, 1);
                }
            });
            return () => {
                connection.disconnect();
                for (const dialogue of dialogues) {
                    dialogue.remove();
                }
            };
        }),
    )
    .addStage(
        new Stage()
            .setDescription("Ask the Old Noob about the key.")
            .setNPC(OldNoob, true)
            .setDialogue(
                new Dialogue(OldNoob, "Just relax and sit back... Oops, got it wrong again.")
                    .monologue("I see you're back, kid. This time, with only the most esoteric of keys.")
                    .monologue(
                        "I'm sure you're dying to know how to use that and learn the past, but why don't you help me out with some stuff?",
                    )
                    .monologue(
                        `The task's pretty simple. Just give me 20 ${ExcavationStone.name}. If you already have the items, just hand them over.`,
                    )
                    .monologue(`Once you do, I'll tell you the inner workings of that key... heh heh.`).root,
            )
            .onReached((stage) => {
                OldNoob.rootPart!.CFrame = OldNoob.startingCFrame;
                Pasal.rootPart!.CFrame = Pasal.startingCFrame;
                OldNoob.playAnimation("Default");
                Pasal.playAnimation("Default");

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
            .setDescription(`Collect 20 ${ExcavationStone.name}.`)
            .setDialogue(new Dialogue(OldNoob, `Report back to me once you're done. I just... need that stone...`))
            .onReached((stage) => {
                OldNoob.rootPart!.CFrame = OldNoob.startingCFrame;
                Pasal.rootPart!.CFrame = Pasal.startingCFrame;
                OldNoob.playAnimation("Default");
                Pasal.playAnimation("Default");

                let t = 0;
                const connection = RunService.Heartbeat.Connect((dt) => {
                    t += dt;
                    if (t < 0.5) return;
                    t = 0;
                    if (Server.Item.getItemAmount(ExcavationStone.id) >= 15) {
                        stage.complete();
                    }
                });
                return () => {
                    connection.Disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Give the ${ExcavationStone.name} back to the Old Noob.`)
            .setNPC(OldNoob, true)
            .setDialogue(new Dialogue(OldNoob, `Do you have 20 ${ExcavationStone.name}?`))
            .onReached((stage) => {
                OldNoob.rootPart!.CFrame = OldNoob.startingCFrame;
                Pasal.rootPart!.CFrame = Pasal.startingCFrame;
                OldNoob.playAnimation("Default");
                Pasal.playAnimation("Default");

                const continuation = new Dialogue(
                    OldNoob,
                    "Yup, sure do. Alright, let's get going. I won't waste either of our time.",
                );
                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === stage.dialogue && Server.Quest.takeQuestItem(ExcavationStone.id, 20) === true) {
                        stage.complete();
                        continuation.talk();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Follow the Old Noob to use the key.`)
            .setFocus(WAYPOINTS.LearningThePastOldNoobApproachingPasal)
            .setNPC(OldNoob)
            .setDialogue(new Dialogue(OldNoob, `I'll lead the way. My body can still move, after all.`))
            .onReached((stage) => {
                OldNoob.model?.FindFirstChildOfClass("Tool")?.Destroy();
                OldNoob.rootPart!.CFrame = OldNoob.startingCFrame;
                Pasal.rootPart!.CFrame = Pasal.startingCFrame;
                Pasal.playAnimation("Default");
                OldNoob.stopAnimation("Default");

                const intro = new Dialogue(
                    OldNoob,
                    "You. I don't know how you got your hands on that orb, but you're coming with us.",
                )
                    .next(new Dialogue(Pasal, "Uh... yeah, sure. Wait, why?"))
                    .next(new Dialogue(OldNoob, "Just stay quiet and come.")).root;
                const teaching = new Dialogue(
                    OldNoob,
                    "Well, we're here. I don't know why your first thought wasn't to just put the key into the obviously comformable hole, but maybe something was stopping you. Who knows.",
                )
                    .monologue("Anyways, just stick that key in and see what happens. I guarantee your safety.")
                    .next(
                        new Dialogue(
                            Pasal,
                            "The fact that you have to say that it's safe kinda concerns me... Whatever. Come on, let's see something happen!",
                        ),
                    ).root;

                task.wait(1);
                oldNoobToApproachingPasal().onComplete(() => {
                    intro.talk();
                });

                const oldNoobAwaiting = new Dialogue(OldNoob, "Just stick that key in and see what happens.");
                const pasalAwaiting = new Dialogue(Pasal, "Come on, let's see something happen!");

                const connection1 = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === intro) {
                        Pasal.stopAnimation("Default");
                        task.wait(0.5);
                        pasalToApproachingWall().onComplete(() => {});
                        oldNoobToApproachingWall().onComplete(() => {
                            teaching.talk();
                            Server.Event.setEventCompleted("IrregularlyShapedKeyUsable", true);
                            oldNoobAwaiting.add();
                            pasalAwaiting.add();
                        });
                    }
                });
                const connection2 = Server.Event.addCompletionListener("SuspiciousWallOpened", (isCompleted) => {
                    if (isCompleted) {
                        stage.complete();
                    }
                });
                return () => {
                    oldNoobAwaiting.remove();
                    pasalAwaiting.remove();
                    connection1.disconnect();
                    connection2.disconnect();
                };
            }),
    )
    .addStage(
        new Stage().setDescription(`Discover the depths of the hidden cave.`).onReached((stage) => {
            task.wait(0.5);
            if (Server.Event.isEventCompleted("SuspiciousWallOpened") === false) {
                unlockWall();
            }
            OldNoob.playAnimation("Default");
            Pasal.stopAnimation("Default");
            OldNoob.model?.FindFirstChildOfClass("Tool")?.Destroy();
            Pasal.rootPart!.Anchored = false;
            OldNoob.rootPart!.Anchored = false;
            Pasal.rootPart!.CFrame = WAYPOINTS.LearningThePastPasalApproachingWall.CFrame;
            OldNoob.rootPart!.CFrame = WAYPOINTS.LearningThePastOldNoobApproachingWall.CFrame;
            const intro = new Dialogue(Pasal, "...what in the world?")
                .next(new Dialogue(OldNoob, "This place has some pretty neat tricks, as you can see."))
                .monologue("Let's get in before anyone else notices.")
                .next(new Dialogue(Pasal, "I must be tripping... I don't know what I'm seeing...")).root;
            intro.talk();

            const continuation = new Dialogue(OldNoob, "Well? Surprised?")
                .next(new Dialogue(Pasal, "This was beneath us the whole time? How did no one find this?"))
                .next(
                    new Dialogue(
                        OldNoob,
                        "No one dared to. They wouldn't dare go near the same thing that killed Miner Haven, after all.",
                    ),
                ).root;
            const ending = new Dialogue(
                OldNoob,
                "This is but a remnant of the latent amounts of Skill that civilization once had.",
            )
                .monologue(
                    "This exact cave was where the remaining citizens hid away to. As you can see though, they are long gone.",
                )
                .next(new Dialogue(Pasal, "Aren't these... the same as my orb..."))
                .next(
                    new Dialogue(
                        OldNoob,
                        "Yes. Now, if you could tell me how you got your hands on such an item, that would be great.",
                    ),
                )
                .next(
                    new Dialogue(
                        Pasal,
                        "I actually don't know. It appeared in front of my eyes one time while I was asleep.",
                    ),
                )
                .next(
                    new Dialogue(
                        OldNoob,
                        "If you aren't lying, it could be that you are a descendant of the Miners. Such people had so much latent Skill in them it would leak out.",
                    ),
                )
                .monologue(
                    "And you, Player. I can sense that you're not from this world. That Skill in you... it's abnormal.",
                )
                .monologue(
                    "I don't know how you came to exist, but it seems that you don't have bad intentions. Quite the contrary, actually.",
                )
                .monologue(
                    "Ever since that fateful day in Miner Haven, the corruption has only become more and more rapid. If you want to do something about it, I suggest heading to Slamo Village first.",
                )
                .monologue(
                    "There, you can hopefully get better items, which can help you progress faster than you ever would here.",
                )
                .monologue("I wish you the best of luck. See you again.").root;
            const connection = Dialogue.finished.connect((dialogue) => {
                if (dialogue === intro) {
                    Pasal.humanoid!.MoveToFinished.Once(() => {
                        Pasal.rootPart!.CFrame = WAYPOINTS.LearningThePastEnterCave.CFrame;
                        task.wait(0.5);
                        Pasal.humanoid!.MoveTo(WAYPOINTS.LearningThePastPasalEnteredCave.Position);
                    });
                    OldNoob.humanoid!.MoveToFinished.Once(() => {
                        OldNoob.rootPart!.CFrame = WAYPOINTS.LearningThePastEnterCave.CFrame;
                        task.wait(0.5);
                        oldNoobToEnteredCave().onComplete(() => {
                            continuation.talk(false);
                            oldNoobToViewingLight().onComplete(() => {
                                ending.talk();
                            });
                            pasalToViewingLight();
                        });
                    });
                    Pasal.humanoid!.MoveTo(suspiciousWall.Position);
                    OldNoob.humanoid!.MoveTo(suspiciousWall.Position);
                } else if (dialogue === ending) {
                    oldNoobToEnterCave().onComplete(() => {
                        OldNoob.rootPart!.CFrame = OldNoob.startingCFrame;
                    });
                    new Dialogue(Pasal, "What am I witnessing...").add(69);
                    task.delay(1, () => new Dialogue(Pasal, "I'll stay back for a bit. I'm just... shocked...").talk());
                    stage.complete();
                }
            });
            return () => connection.disconnect();
        }),
    )
    .setCompletionDialogue(
        new Dialogue(
            Pasal,
            "I'm still kinda bewildered from what just happened, but I think I should just stop thinking about whatever that was.",
        ),
    )
    .onInit(() => {
        const keyUsed = new Dialogue(EMPTY_NPC, "You place the key in the keyhole.");
        Server.Event.addCompletionListener("PasalReveal", (isCompleted) => {
            if (isCompleted) Pasal.revealActualName();
        });
        Server.Event.addCompletionListener("IrregularlyShapedKeyUsable", (isCompleted) => {
            if (!isCompleted) return;
            SuspiciousWall.dialogueUponInteract(keyUsed);
        });
        Server.Event.setEventCompleted("SuspiciousWallOpened", false);
        Dialogue.finished.connect((dialogue) => {
            if (dialogue === keyUsed) {
                unlockWall();
            }
        });
    })
    .setReward({
        xp: 300,
    });
