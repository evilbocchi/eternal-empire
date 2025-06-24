import { playSoundAtPart, spawnExplosion } from "@antivivi/vrldk";
import { RunService, TweenService, Workspace } from "@rbxts/services";
import Quest, { Stage } from "server/Quest";
import { AREAS } from "shared/Area";
import { getNPCModel, getWaypoint } from "shared/constants";
import { emitEffect, getSound } from "shared/GameAssets";
import InteractableObject from "shared/InteractableObject";
import { GameUtils } from "shared/item/ItemUtils";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import IrregularlyShapedKey from "shared/items/negative/skip/IrregularlyShapedKey";
import { Dialogue, EMPTY_NPC } from "shared/NPC";
import Librarian from "shared/npcs/Librarian";
import LibraryNoob1 from "shared/npcs/Library Noob 1";
import LibraryNoob2 from "shared/npcs/Library Noob 2";
import OldNoob from "shared/npcs/Old Noob";
import Pasal from "shared/npcs/Pasal";

const pasalModel = getNPCModel("Pasal");
const pasalHumanoid = pasalModel.FindFirstChildOfClass("Humanoid")!;
const oldNoobModel = getNPCModel("Old Noob");
const oldNoobHumanoid = oldNoobModel.FindFirstChildOfClass("Humanoid")!;
const suspiciousWall = AREAS.BarrenIslands.map.WaitForChild("SuspiciousWall") as BasePart;

const unlockWall = () => {
    const keyhole = suspiciousWall.WaitForChild("Keyhole") as BasePart;
    const inc = new Vector3(90, 0, 0);
    const keyModel = IrregularlyShapedKey.MODEL?.Clone();
    if (keyModel === undefined)
        return;
    keyModel.PrimaryPart!.CFrame = getWaypoint("LearningThePastKey").CFrame;
    keyModel.Parent = Workspace;
    const tweenInfo = new TweenInfo(0.5);
    TweenService.Create(keyModel.PrimaryPart!, tweenInfo, { Orientation: keyModel.PrimaryPart!.Orientation.add(inc) }).Play();
    TweenService.Create(keyhole, tweenInfo, { Orientation: keyhole.Orientation.sub(inc) }).Play();
    task.delay(1, () => {
        keyModel.Destroy();
        keyhole.Destroy();
        suspiciousWall.FindFirstChildOfClass("ProximityPrompt")?.Destroy();
        suspiciousWall.Transparency = 1;
        suspiciousWall.CanCollide = false;
        spawnExplosion(suspiciousWall.Position);
        emitEffect("Sparks", suspiciousWall, 2);
        playSoundAtPart(suspiciousWall, getSound("ExplosiveUnlock"));
        GameUtils.setEventCompleted("SuspiciousWallOpened", true);
    });
};

export = new Quest(script.Name)
    .setName("Learning The Past")
    .setLength(2)
    .setLevel(5)
    .setOrder(7)
    .addStage(new Stage()
        .setDescription("Talk to the Old Noob at %coords%.")
        .setNPC("Old Noob", true)
        .setDialogue(new Dialogue(OldNoob, "Just sit back and relax...")
            .monologue("You want to learn about the history of the Barren Islands, huh? It's quite a tale.")
            .monologue("It's been so long- the catastrophe that reduced the great 'Miner Haven' to this state.")
            .monologue("I'll spare you the details for now, but if you're truly curious and want to delve deeper into the history, you should head to the library.")
            .root
        )
        .onStart((stage) => {
            const connection = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue) {
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription("Find details about the history of Barren Islands in the library at %coords%.")
        .setFocus(getWaypoint("LearningThePast2"))
        .onStart((stage) => {
            const connection = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue === InteractableObject.OldBooks1.dialogue) {
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription("Ask around the library for clues about the 'strike'.")
        .onStart((stage) => {
            const pasalDialogue = new Dialogue(Pasal, "Yahallo! ...You want that shiny green orb behind me?")
                .monologue("Sorry, I can't do that for you. It's not on sale.")
                .monologue("Why would you want that anyways?")
                .root;
            const librarianDialogue = new Dialogue(Librarian, "About the strike... Well, it's actually pretty simple.")
                .monologue("This place is but a fragment of what the legendary 'Miner Haven' used to be.")
                .monologue("It was a thriving, bustling hub of activity, with miners working day and night, extracting valuable resources from the earth.")
                .monologue("Then, one day, everything changed. It was business as usual until a comet came flying down from the sky.")
                .monologue("The impact was devastating, as if the world came to a stop.")
                .monologue("The explosion rocked the foundations of Miner Haven, and in an instant, all that might and power was gone.")
                .monologue("The comet's strike turned this prosperous land into the Barren Islands you see today.")
                .monologue("...")
                .monologue("The thing is, no one really knows where the comet came from.")
                .monologue("We've just assumed it came from space, but is that really true?")
                .monologue("Would the great Miner Haven make such a grave oversight?")
                .monologue("I don't think we have the full story.")
                .monologue("Listen. I've seen what you've been up to, and I have massive faith in you.")
                .monologue("Here's a key that'll let you enter a specific hideout. Maybe you can learn something we haven't.")
                .root;
            const dialogues = [
                new Dialogue(LibraryNoob1, "The strike? I don't really know much about that.")
                    .monologue("Try asking the librarian instead. He's crazy about this kind of stuff.")
                    .monologue("If I had to put my finger on something though, maybe try looking for that Shopkeeper behind the library with a huge glowing green orb.")
                    .monologue("Every time I ask him about that, he only gives vague responses about some weird stuff related to time and this place.")
                    .monologue("Definitely suspicious to me, if I do say so myself.")
                    .root,
                new Dialogue(LibraryNoob2, "What's this thing about some weird collapse?")
                    .monologue("You might want to ask the librarian about that. I got no clue what you're talking about.")
                    .root
            ];

            const continuation = new Dialogue(Pasal, "...")
                .monologue("Hey. How did you get that key?")
                .monologue("You'll tell me, right? Right?")
                .monologue("...Nevermind. It seems that you prefer to stay mute.")
                .monologue("I won't pry into what you've been up to, but let me tell you something.")
                .monologue("That key you have right now seethes of the aura of Skill. Even I can feel it. How in the world are you unfazed?")
                .monologue("You know what it reminds me of? My green orb that came from literally nowhere. It's my soulmate... I love it so much... Wait. That's not the point.")
                .monologue("Maybe you can find out where these weird objects were originally from. I'm honestly a little excited too, but I'll be waiting here for our next steps.")
                .monologue("My name's Pasal. Try to consult the creepy old man at the docks. He's lived so long he probably saw that thing come into life.")
                .root;

            for (const dialogue of dialogues) {
                GameUtils.addDialogue(dialogue);
            }
            GameUtils.addDialogue(librarianDialogue);
            GameUtils.addDialogue(pasalDialogue);
            const connection = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue === librarianDialogue) {
                    GameUtils.takeQuestItem(IrregularlyShapedKey.id, 1);
                    GameUtils.giveQuestItem(IrregularlyShapedKey.id, 1);
                    GameUtils.removeDialogue(librarianDialogue);
                }
                else if (dialogue === pasalDialogue && GameUtils.takeQuestItem(IrregularlyShapedKey.id, 1) === true) {
                    GameUtils.talk(continuation);
                }
                else if (dialogue === continuation) {
                    stage.completed.fire();
                    GameUtils.setEventCompleted("PasalReveal", true);
                    GameUtils.giveQuestItem(IrregularlyShapedKey.id, 1);
                }
            });
            return () => {
                connection.disconnect();
                for (const dialogue of dialogues) {
                    GameUtils.removeDialogue(dialogue);
                }
            };
        })
    )
    .addStage(new Stage()
        .setDescription("Ask the Old Noob about the key.")
        .setNPC("Old Noob", true)
        .setDialogue(new Dialogue(OldNoob, "Just relax and sit back... Oops, got it wrong again.")
            .monologue("I see you're back, kid. This time, with only the most esoteric of keys.")
            .monologue("I'm sure you're dying to know how to use that and learn the past, but why don't you help me out with some stuff?")
            .monologue(`The task's pretty simple. Just give me 20 ${ExcavationStone.name}. If you already have the items, just hand them over.`)
            .monologue(`Once you do, I'll tell you the inner workings of that key... heh heh.`)
            .root
        )
        .onStart((stage) => {
            const connection = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue) {
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Collect 20 ${ExcavationStone.name}.`)
        .setDialogue(new Dialogue(OldNoob, `Report back to me once you're done. I just... need that stone...`))
        .onStart((stage) => {
            let t = 0;
            const connection = RunService.Heartbeat.Connect((dt) => {
                t += dt;
                if (t < 0.5)
                    return;
                t = 0;
                if (GameUtils.itemsService.getItemAmount(ExcavationStone.id) >= 15) {
                    stage.completed.fire();
                }
            });
            return () => {
                connection.Disconnect();
            };
        })
    )
    .addStage(new Stage()
        .setDescription(`Give the ${ExcavationStone.name} back to the Old Noob.`)
        .setNPC("Old Noob", true)
        .setDialogue(new Dialogue(OldNoob, `Do you have 20 ${ExcavationStone.name}?`))
        .onStart((stage) => {
            const continuation = new Dialogue(OldNoob, "Yup, sure do. Alright, let's get going. I won't waste either of our time.");
            const connection = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue && GameUtils.takeQuestItem(ExcavationStone.id, 20) === true) {
                    stage.completed.fire();
                    GameUtils.talk(continuation);
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Follow the Old Noob to use the key.`)
        .setFocus(getWaypoint("LearningThePastOldNoob1"))
        .setNPC("Old Noob")
        .setDialogue(new Dialogue(OldNoob, `I'll lead the way. My body can still move, after all.`))
        .onStart((stage) => {
            oldNoobModel.FindFirstChildOfClass("Tool")?.Destroy();
            const intro = new Dialogue(OldNoob, "You. I don't know how you got your hands on that orb, but you're coming with us.")
                .next(new Dialogue(Pasal, "Uh... yeah, sure. Wait, why?"))
                .next(new Dialogue(OldNoob, "Just stay quiet and come."))
                .root;
            const teaching = new Dialogue(OldNoob, "Well, we're here. I don't know why your first thought wasn't to just put the key into the obviously comformable hole, but maybe something was stopping you. Who knows.")
                .monologue("Anyways, just stick that key in and see what happens. I guarantee your safety.")
                .next(new Dialogue(Pasal, "The fact that you have to say that it's safe kinda concerns me... Whatever. Come on, let's see something happen!"))
                .root;

            GameUtils.stopNPCAnimation(OldNoob, "Default");
            task.wait(1);
            GameUtils.leadToPoint(oldNoobHumanoid, getWaypoint("LearningThePastOldNoob1").CFrame, () => {
                GameUtils.talk(intro);
            });

            const oldNoobAwaiting = new Dialogue(OldNoob, "Just stick that key in and see what happens.");
            const pasalAwaiting = new Dialogue(Pasal, "Come on, let's see something happen!");

            const connection1 = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue === intro) {
                    GameUtils.stopNPCAnimation(Pasal, "Default");
                    task.wait(0.5);
                    GameUtils.leadToPoint(pasalHumanoid, getWaypoint("LearningThePastPasal1").CFrame, () => { });
                    GameUtils.leadToPoint(oldNoobHumanoid, getWaypoint("LearningThePastOldNoob2").CFrame, () => {
                        GameUtils.talk(teaching);
                        GameUtils.setEventCompleted("IrregularlyShapedKeyUsable", true);
                        GameUtils.addDialogue(oldNoobAwaiting);
                        GameUtils.addDialogue(pasalAwaiting);
                    });
                }
            });
            const connection2 = GameUtils.addCompletionListener("SuspiciousWallOpened", (isCompleted) => {
                if (isCompleted) {
                    stage.completed.fire();
                }
            });
            return () => {
                connection1.disconnect();
                connection2.disconnect();
            };
        })
    )
    .addStage(new Stage()
        .setDescription(`Discover the depths of the hidden cave.`)
        .onStart((stage) => {
            task.wait(0.5);
            if (GameUtils.isEventCompleted("SuspiciousWallOpened") === false) {
                unlockWall();
            }
            GameUtils.stopNPCAnimation(OldNoob, "Default");
            GameUtils.stopNPCAnimation(Pasal, "Default");
            oldNoobModel.FindFirstChildOfClass("Tool")?.Destroy();
            pasalHumanoid.RootPart!.Anchored = false;
            oldNoobHumanoid.RootPart!.Anchored = false;
            pasalHumanoid.RootPart!.CFrame = getWaypoint("LearningThePastPasal1").CFrame;
            oldNoobHumanoid.RootPart!.CFrame = getWaypoint("LearningThePastOldNoob2").CFrame;
            const intro = new Dialogue(Pasal, "...what in the world?")
                .next(new Dialogue(OldNoob, "This place has some pretty neat tricks, as you can see."))
                .monologue("Let's get in before anyone else notices.")
                .next(new Dialogue(Pasal, "I must be tripping... I don't know what I'm seeing..."))
                .root;
            GameUtils.talk(intro);

            const continuation = new Dialogue(OldNoob, "Well? Surprised?")
                .next(new Dialogue(Pasal, "This was beneath us the whole time? How did no one find this?"))
                .next(new Dialogue(OldNoob, "No one dared to. They wouldn't dare go near the same thing that killed Miner Haven, after all."))
                .root;
            const ending = new Dialogue(OldNoob, "This is but a remnant of the latent amounts of Skill that civilization once had.")
                .monologue("This exact cave was where the remaining citizens hid away to. As you can see though, they are long gone.")
                .next(new Dialogue(Pasal, "Aren't these... the same as my orb..."))
                .next(new Dialogue(OldNoob, "Yes. Now, if you could tell me how you got your hands on such an item, that would be great."))
                .next(new Dialogue(Pasal, "I actually don't know. It appeared in front of my eyes one time while I was asleep."))
                .next(new Dialogue(OldNoob, "If you aren't lying, it could be that you are a descendant of the Miners. Such people had so much latent Skill in them it would leak out."))
                .monologue("And you, Player. I can sense that you're not from this world. That Skill in you... it's abnormal.")
                .monologue("I don't know how you came to exist, but it seems that you don't have bad intentions. Quite the contrary, actually.")
                .monologue("Ever since that fateful day in Miner Haven, the corruption has only become more and more rapid. If you want to do something about it, I suggest heading to Slamo Village first.")
                .monologue("There, you can hopefully get better items, which can help you progress faster than you ever would here.")
                .monologue("I wish you the best of luck. See you again.")
                .root;
            const connection = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue === intro) {
                    pasalHumanoid.MoveToFinished.Once(() => {
                        pasalHumanoid.RootPart!.CFrame = getWaypoint("LearningThePastEnterCave").CFrame;
                        pasalHumanoid.MoveTo(getWaypoint("LearningThePastPasal2").Position);
                    });
                    oldNoobHumanoid.MoveToFinished.Once(() => {
                        oldNoobHumanoid.RootPart!.CFrame = getWaypoint("LearningThePastEnterCave").CFrame;
                        GameUtils.leadToPoint(oldNoobHumanoid, getWaypoint("LearningThePastOldNoob3").CFrame, () => {
                            GameUtils.talk(continuation, false);
                            GameUtils.leadToPoint(oldNoobHumanoid, getWaypoint("LearningThePastOldNoob4").CFrame, () => {
                                GameUtils.talk(ending);
                            });
                        });
                        GameUtils.leadToPoint(pasalHumanoid, getWaypoint("LearningThePastPasal3").CFrame, () => { });
                    });
                    pasalHumanoid.MoveTo(suspiciousWall.Position);
                    oldNoobHumanoid.MoveTo(suspiciousWall.Position);
                }
                else if (dialogue === ending) {
                    GameUtils.gameAssetService.pathfind(oldNoobHumanoid, getWaypoint("LearningThePastEnterCave").Position, () => {
                        oldNoobHumanoid.RootPart!.CFrame = GameUtils.getDefaultLocation(OldNoob)!;
                    });
                    GameUtils.addDialogue(new Dialogue(Pasal, "What am I witnessing..."), 69);
                    task.delay(1, () => GameUtils.talk(new Dialogue(Pasal, "I'll stay back for a bit. I'm just... shocked...")));
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        }))
    .setCompletionDialogue(new Dialogue(Pasal, "I'm still kinda bewildered from what just happened, but I think I should just stop thinking about whatever that was."))
    .onInit(() => {
        const keyUsed = new Dialogue(EMPTY_NPC, "You place the key in the keyhole.");
        GameUtils.addCompletionListener("PasalReveal", (isCompleted) => {
            if (isCompleted)
                pasalHumanoid.DisplayName = "";
        });
        GameUtils.addCompletionListener("IrregularlyShapedKeyUsable", (isCompleted) => {
            if (!isCompleted)
                return;
            InteractableObject.SuspiciousWall.dialogueUponInteract(keyUsed);
        });
        GameUtils.setEventCompleted("SuspiciousWallOpened", false);
        GameUtils.dialogueFinished.connect((dialogue) => {
            if (dialogue === keyUsed) {
                unlockWall();
            }
        });
    })
    .setReward({
        xp: 300
    });