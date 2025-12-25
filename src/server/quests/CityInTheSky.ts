import { Dialogue, Soliloquy } from "server/interactive/npc/NPC";
import SkyBureaucrat from "server/interactive/npc/Sky Bureaucrat";
import Zane from "server/interactive/npc/Zane";
import Quest, { Stage } from "server/quests/Quest";
import { Server } from "shared/api/APIExpose";
import { playSound } from "shared/asset/GameAssets";
import GravityStabilizer from "shared/items/0/millisecondless/GravityStabilizer";
import QuantumGear from "shared/items/0/millisecondless/QuantumGear";
import SkyCrystal from "shared/items/0/millisecondless/SkyCrystal";
import SkyPass from "shared/items/0/millisecondless/SkyPass";

export = new Quest(script.Name)
    .setName("City In The Sky")
    .setLength(8)
    .setLevel(10)
    .setOrder(15)
    .addStage(
        new Stage()
            .setDescription(`Find Zane, the mysterious elevator operator, and learn about the Sky Pavilion.`)
            .setNPC(Zane, true)
            .setDialogue(
                new Dialogue(Zane, "Yo, what's good? Name's Zane. Elevator Guy. Sky Conspiracy Expert.")
                    .monologue(
                        "So like, you ever wonder why the Sky Pavilion just... floats? No? Well, you should. It's literally unhinged.",
                    )
                    .monologue(
                        "The government doesn't want you to know this, but the clouds are free. You can just... go up there. If you have an elevator.",
                    )
                    .monologue(
                        "Problem is, my elevator's kinda... broken. And by kinda, I mean VERY. But that's where you come in, bestie.",
                    )
                    .monologue(
                        "I need three specific parts to fix this bad boy: a Quantum Gear, a Sky Crystal, and a Gravity Stabilizer.",
                    )
                    .monologue(
                        "Don't ask me where to find them. That's your main character moment, not mine. I'll be here vibing.",
                    ).root,
            )
            .onReached((stage) => {
                const connection = stage.dialogue!.finished.connect(() => {
                    stage.complete();
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Find the Quantum Gear. Solve the riddle to reveal its location.`)
            .setDialogue(
                new Soliloquy(
                    "You find a mysterious glowing inscription: 'I tick but have no clock, I move but never walk. What am I?'",
                ).root,
            )
            .onReached((stage) => {
                stage.dialogue?.add();

                const riddleAnswer = new Dialogue(
                    Zane,
                    "Oh, you found my riddle board! Pretty sick, right? The answer is 'gear', obviously.",
                );

                const giveGear = new Dialogue(
                    Zane,
                    "Since you're so smart, here's the Quantum Gear. I had it the whole time lmao. Just testing you.",
                );

                let answerGiven = false;

                const stageDialogueConn = stage.dialogue!.finished.connect(() => {
                    if (!answerGiven) {
                        answerGiven = true;
                        riddleAnswer.talk();
                    }
                });

                const riddleAnswerConn = riddleAnswer.finished.connect(() => {
                    giveGear.talk();
                });

                const giveGearConn = giveGear.finished.connect(() => {
                    Server.Quest.giveQuestItem(QuantumGear, 1);
                    task.wait(1);
                    stage.complete();
                });

                return () => {
                    stageDialogueConn.disconnect();
                    riddleAnswerConn.disconnect();
                    giveGearConn.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Find the Sky Crystal. Navigate the floating platforms to reach it.`)
            .setDialogue(
                new Soliloquy(
                    "A series of floating platforms leads upward. A glowing crystal awaits at the top. This seems safe and not at all sketchy.",
                ).root,
            )
            .onReached((stage) => {
                stage.dialogue?.add();

                // Simulate platforming challenge - in a real implementation, this would involve
                // actual proximity prompts on floating platforms
                const platformChallenge = new Dialogue(
                    Zane,
                    "Yo, I heard you're doing parkour now? That's fire. Don't fall though, that would be cringe.",
                );

                const platformSuccess = new Soliloquy(
                    "You've reached the top! The Sky Crystal floats before you, humming with energy.",
                );

                const getCrystal = new Soliloquy("You carefully take the Sky Crystal. It feels... powerful.");

                // For now, we'll simulate the challenge with a simple timer
                task.wait(3);
                platformChallenge.talk();

                const platformChallengeConn = platformChallenge.finished.connect(() => {
                    task.wait(2);
                    platformSuccess.talk();
                });

                const platformSuccessConn = platformSuccess.finished.connect(() => {
                    getCrystal.talk();
                });

                const getCrystalConn = getCrystal.finished.connect(() => {
                    Server.Quest.giveQuestItem(SkyCrystal, 1);
                    task.wait(1);
                    stage.complete();
                });

                return () => {
                    platformChallengeConn.disconnect();
                    platformSuccessConn.disconnect();
                    getCrystalConn.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Find the Gravity Stabilizer. Face the meme challenge.`)
            .setDialogue(
                new Soliloquy("A strange creature blocks your path. It looks... familiar? Is that a dancing Noob?")
                    .root,
            )
            .onReached((stage) => {
                stage.dialogue?.add();

                const memeEncounter = new Dialogue(
                    Zane,
                    "Oh no, it's the Dancing Noob. This guy's been here since the dawn of Roblox. Literally unkillable.",
                ).monologue(
                    "The only way past him is to... vibe with him. Just stand there and watch. Don't make it weird.",
                ).root;

                const memeComplete = new Dialogue(
                    Zane,
                    "Bro you actually did it. Respect. Here, take this Gravity Stabilizer. The Noob dropped it. RIP legend.",
                );

                const stageDialogueConn = stage.dialogue!.finished.connect(() => {
                    task.wait(1);
                    memeEncounter.talk();
                });

                const memeEncounterConn = memeEncounter.finished.connect(() => {
                    task.wait(5);
                    memeComplete.talk();
                });

                const memeCompleteConn = memeComplete.finished.connect(() => {
                    Server.Quest.giveQuestItem(GravityStabilizer, 1);
                    task.wait(1);
                    stage.complete();
                });

                return () => {
                    stageDialogueConn.disconnect();
                    memeEncounterConn.disconnect();
                    memeCompleteConn.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Bring the parts to Zane and help fix the elevator.`)
            .setNPC(Zane, true)
            .setDialogue(
                new Dialogue(
                    Zane,
                    "Yo, you got all the parts? That's actually insane. I didn't think you'd pull it off.",
                ).monologue("Alright, let's install these bad boys and fire up the elevator. What could go wrong?")
                    .root,
            )
            .onReached((stage) => {
                const ItemService = Server.Item;

                const checkParts = new Dialogue(
                    Zane,
                    "Yo, you got all three parts? Quantum Gear, Sky Crystal, Gravity Stabilizer?",
                );
                const startRepair = new Dialogue(
                    Zane,
                    "Let's goooo! Okay, installing the Quantum Gear... aaaand it's in!",
                )
                    .monologue("Now the Sky Crystal... this thing is actually kinda heavy? Whatever, it's in.")
                    .monologue("And finally, the Gravity Stabilizer. Perfect fit. Chef's kiss.")
                    .monologue("Alright, moment of truth. Let's fire up this elevator!").root;

                const malfunction = new Dialogue(
                    Zane,
                    "Uh... why is it making that noise? That's not supposed to happen. OH NO—",
                ).root;

                if (
                    ItemService.getAvailableAmount(QuantumGear) >= 1 &&
                    ItemService.getAvailableAmount(SkyCrystal) >= 1 &&
                    ItemService.getAvailableAmount(GravityStabilizer) >= 1
                ) {
                    stage.dialogue?.talk();
                } else {
                    checkParts.add();
                }

                const checkPartsConn = checkParts.finished.connect(() => {
                    if (
                        ItemService.getAvailableAmount(QuantumGear) >= 1 &&
                        ItemService.getAvailableAmount(SkyCrystal) >= 1 &&
                        ItemService.getAvailableAmount(GravityStabilizer) >= 1
                    ) {
                        checkParts.remove();
                        startRepair.talk();
                    }
                });

                const stageDialogueConn = stage.dialogue!.finished.connect(() => {
                    startRepair.talk();
                });

                const startRepairConn = startRepair.finished.connect(() => {
                    Server.Quest.takeQuestItem(QuantumGear, 1);
                    Server.Quest.takeQuestItem(SkyCrystal, 1);
                    Server.Quest.takeQuestItem(GravityStabilizer, 1);
                    task.wait(2);
                    malfunction.talk();
                });

                const malfunctionConn = malfunction.finished.connect(() => {
                    task.wait(1);
                    stage.complete();
                });

                return () => {
                    checkPartsConn.disconnect();
                    stageDialogueConn.disconnect();
                    startRepairConn.disconnect();
                    malfunctionConn.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Survive the elevator malfunction! Navigate the zero-gravity chaos.`)
            .setDialogue(
                new Dialogue(
                    Zane,
                    "*Over intercom* BRO I'M SO SORRY! The elevator's going haywire! Just... float? I guess?",
                )
                    .monologue("*Static* Okay so basically gravity is optional now. Just vibe your way to the top!")
                    .monologue("Watch out for the floating junk! I left my lunch in here and it's EVERYWHERE!")
                    .monologue("You're doing great! Keep going! Don't die, that would be so cringe!").root,
            )
            .onReached((stage) => {
                stage.dialogue?.talk();

                // Simulate zero-gravity gauntlet
                const gauntletProgress = new Dialogue(
                    Zane,
                    "*Over intercom* You're halfway there! Is that a floating chair? Yeah that's mine, mb.",
                );

                const nearingTop = new Dialogue(
                    Zane,
                    "*Over intercom* Almost there! I can see the top from here! You're built different fr!",
                );

                const reachedTop = new Dialogue(
                    Zane,
                    "*Over intercom* YOU MADE IT! I knew you would! Well, I hoped. Okay I had no idea. But you're here!",
                );

                const stageDialogueConn = stage.dialogue!.finished.connect(() => {
                    task.wait(4);
                    gauntletProgress.talk();
                });

                const gauntletProgressConn = gauntletProgress.finished.connect(() => {
                    task.wait(4);
                    nearingTop.talk();
                });

                const nearingTopConn = nearingTop.finished.connect(() => {
                    task.wait(3);
                    reachedTop.talk();
                });

                const reachedTopConn = reachedTop.finished.connect(() => {
                    task.wait(1);
                    stage.complete();
                });

                return () => {
                    stageDialogueConn.disconnect();
                    gauntletProgressConn.disconnect();
                    nearingTopConn.disconnect();
                    reachedTopConn.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Pass the Sky Pavilion citizenship test administered by the AI bureaucrat.`)
            .setNPC(SkyBureaucrat, true)
            .setDialogue(
                new Dialogue(SkyBureaucrat, "GREETING. I AM AI-7453. WELCOME TO SKY PAVILION IMMIGRATION PROCESSING.")
                    .monologue("PLEASE COMPLETE CITIZENSHIP EVALUATION. QUESTION ONE: HOW MANY CLOUDS ARE IN THE SKY?")
                    .monologue("ACCEPTABLE RESPONSES: A) ALL OF THEM B) YES C) CLOUD.EXE").root,
            )
            .onReached((stage) => {
                const answer = new Dialogue(
                    SkyBureaucrat,
                    "RESPONSE LOGGED. ANALYZING... ANALYSIS COMPLETE. RESPONSE: CORRECT.",
                )
                    .monologue("QUESTION TWO: DO YOU VIBE?")
                    .monologue("ACCEPTABLE RESPONSES: A) YES B) ABSOLUTELY C) FACTS").root;

                const secondAnswer = new Dialogue(
                    SkyBureaucrat,
                    "RESPONSE: CORRECT. QUESTION THREE: WHY IS THE SKY PAVILION FLOATING?",
                ).monologue("ACCEPTABLE RESPONSES: A) VIBES B) MAGIC C) DON'T WORRY ABOUT IT").root;

                const passTest = new Dialogue(
                    SkyBureaucrat,
                    "ALL RESPONSES: CORRECT. CITIZENSHIP EVALUATION: PASSED. WELCOME TO SKY PAVILION.",
                ).monologue("PLEASE PROCEED TO FINAL VERIFICATION.").root;

                const stageDialogueConn = stage.dialogue!.finished.connect(() => {
                    task.wait(2);
                    answer.talk();
                });

                const answerConn = answer.finished.connect(() => {
                    task.wait(2);
                    secondAnswer.talk();
                });

                const secondAnswerConn = secondAnswer.finished.connect(() => {
                    task.wait(2);
                    passTest.talk();
                });

                const passTestConn = passTest.finished.connect(() => {
                    task.wait(1);
                    stage.complete();
                });

                return () => {
                    stageDialogueConn.disconnect();
                    answerConn.disconnect();
                    secondAnswerConn.disconnect();
                    passTestConn.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Complete the final sky riddle to prove your worth.`)
            .setDialogue(
                new Dialogue(
                    SkyBureaucrat,
                    "FINAL CHALLENGE. SKY RIDDLE: I AM LIGHTER THAN AIR BUT A MILLION MEN CANNOT LIFT ME. WHAT AM I?",
                ).root,
            )
            .onReached((stage) => {
                stage.dialogue?.add();

                const riddleHint = new Dialogue(
                    Zane,
                    "*Over earpiece* Psst, it's a bubble. Or a cloud. Or vibes. Just say something profound, they eat that up.",
                );

                const correctAnswer = new Dialogue(
                    SkyBureaucrat,
                    "ANSWER: ACCEPTABLE. PROCESSING... YOU HAVE PASSED ALL TESTS.",
                ).monologue("GENERATING SKY PASS... COMPLETE. GRANTING AREA ACCESS.").root;

                const stageDialogueConn = stage.dialogue!.finished.connect(() => {
                    task.wait(2);
                    riddleHint.talk();
                });

                const riddleHintConn = riddleHint.finished.connect(() => {
                    task.wait(2);
                    correctAnswer.talk();
                });

                const correctAnswerConn = correctAnswer.finished.connect(() => {
                    task.wait(1);
                    stage.complete();
                });

                return () => {
                    stageDialogueConn.disconnect();
                    riddleHintConn.disconnect();
                    correctAnswerConn.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Welcome to the Sky Pavilion! Enjoy your new access.`)
            .setNPC(Zane, true)
            .setDialogue(
                new Dialogue(
                    Zane,
                    "YOOO YOU DID IT! You're officially a Sky Pavilion citizen now! That's actually so hype!",
                )
                    .monologue(
                        "I genuinely didn't think you'd survive the elevator. That was like, 80% lethal minimum.",
                    )
                    .monologue("Here, take this Sky Pass and some sky loot as a reward. You earned it, main character.")
                    .monologue("Welcome to the sky, bestie. Try not to fall off. No pressure.").root,
            )
            .onReached((stage) => {
                const stageDialogueConn = stage.dialogue!.finished.connect(() => {
                    // Give rewards
                    Server.Quest.giveQuestItem(SkyPass, 1);

                    // Unlock Sky Pavilion area
                    Server.Area.unlockArea("SkyPavilion");

                    // Play victory sound
                    const players = game.GetService("Players").GetPlayers();
                    if (players[0] !== undefined) {
                        const character = players[0].Character;
                        if (character !== undefined) {
                            const rootPart = character.FindFirstChild("HumanoidRootPart");
                            if (rootPart !== undefined && rootPart.IsA("BasePart")) {
                                playSound("QuestComplete.mp3", rootPart);
                            }
                        }
                    }

                    task.wait(1);
                    stage.complete();
                });

                return () => stageDialogueConn.disconnect();
            }),
    )
    .setCompletionDialogue(new Dialogue(Zane, "Sky Pavilion citizen? That's you now. So proud. *Wipes tear*"))
    .setReward({
        xp: 1000,
        items: new Map([
            [SkyPass.id, 1],
            [SkyCrystal.id, 3],
        ]),
    });
