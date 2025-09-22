import { playSoundAtPart } from "@antivivi/vrldk";
import { TweenService, Workspace } from "@rbxts/services";
import Freddy from "server/interactive/npc/Freddy";
import { Dialogue } from "server/interactive/npc/NPC";
import SlamoReceptionist from "server/interactive/npc/Slamo Receptionist";
import SlamoRefugee from "server/interactive/npc/Slamo Refugee";
import Quest, { Stage } from "server/quests/Quest";
import { getEffect, getSound, playSound } from "shared/asset/GameAssets";
import { WAYPOINTS } from "shared/constants";
import { Server } from "shared/api/APIExpose";
import ChargedEmpoweredBrick from "shared/items/negative/instantwin/ChargedEmpoweredBrick";
import EmpoweredBrick from "shared/items/negative/instantwin/EmpoweredBrick";
import XLWool from "shared/items/negative/relax/XLWool";
import FreddysCauldron from "shared/world/nodes/FreddysCauldron";
import SlamoVillageConnection from "shared/world/nodes/SlamoVillageConnection";

const cauldron = FreddysCauldron.waitForInstance();
const linkway = SlamoVillageConnection.waitForInstance();

const instantWinEffects = new Array<BasePart>();
for (const child of cauldron.GetChildren()) {
    if (child.Name === "InstantWin" && child.IsA("BasePart")) {
        instantWinEffects.push(child);
    }
}
const explosionEffect = cauldron.PrimaryPart!.FindFirstChildOfClass("ParticleEmitter")!;
const instantWinBlock = cauldron.WaitForChild("InstantWinBlock") as BasePart;
const hideInstantWinBlock = () => {
    instantWinBlock.Transparency = 1;
    for (const decal of instantWinBlock.GetChildren()) {
        if (decal.IsA("Decal")) {
            decal.Transparency = 1;
        }
    }
};
const showInstantWinBlock = () => {
    instantWinBlock.Transparency = 0;
    for (const decal of instantWinBlock.GetChildren()) {
        if (decal.IsA("Decal")) {
            decal.Transparency = 0;
        }
    }
};

const refugeeToWaiting = SlamoRefugee.createPathfindingOperation(
    SlamoRefugee.startingCFrame,
    WAYPOINTS.ToTheVillageRefugeeWaiting.CFrame,
);

const refugeeToBrewing = SlamoRefugee.createPathfindingOperation(
    WAYPOINTS.ToTheVillageRefugeeWaiting.CFrame,
    WAYPOINTS.ToTheVillageRefugeeBrewing.CFrame,
);

const refugeeToIntermittent = SlamoRefugee.createPathfindingOperation(
    WAYPOINTS.ToTheVillageRefugeeBrewing.CFrame,
    WAYPOINTS.ToTheVillageRefugeeIntermittentIsles.CFrame,
);

const refugeeToEnteringSlamoVillage = SlamoRefugee.createPathfindingOperation(
    WAYPOINTS.ToTheVillageRefugeeIntermittentIsles.CFrame,
    WAYPOINTS.ToTheVillageRefugeeEnteringSlamoVillage.CFrame,
);

const refugeeToEnteringPoliceStation = SlamoRefugee.createPathfindingOperation(
    WAYPOINTS.ToTheVillageRefugeeEnteringSlamoVillage.CFrame,
    WAYPOINTS.ToTheVillageRefugeeEnteringPoliceStation.CFrame,
    false,
);

export = new Quest(script.Name)
    .setName("To The Village")
    .setLength(3)
    .setLevel(4)
    .setOrder(8)
    .createQuestRequirement("AHelpingHand")
    .addStage(
        new Stage()
            .setNPC(SlamoRefugee, true)
            .setDescription(`Talk to the Slamo Refugee at %coords%.`)
            .setDialogue(
                new Dialogue(SlamoRefugee, "Sigh... I miss my village.")
                    .monologue(
                        "Did you know that there used to be a linkway between this barren wasteland and Slamo Village? It collapsed long ago, and I've been stuck here ever since.",
                    )
                    .monologue("Say, if you could help me get back to Slamo Village, I would be forever grateful.")
                    .monologue(
                        "To start, can you give me an Empowered Brick? You can craft one at that weird blacksmith's place.",
                    ).root,
            )
            .onReached((stage) => {
                SlamoRefugee.rootPart!.CFrame = SlamoRefugee.startingCFrame!;

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
            .setDescription(`Craft an Empowered Brick and give it to the Slamo Refugee.`)
            .setFocus(WAYPOINTS.CraftingTable)
            .setDialogue(new Dialogue(SlamoRefugee, "Do you have that Empowered Brick?"))
            .onReached((stage) => {
                SlamoRefugee.rootPart!.CFrame = SlamoRefugee.startingCFrame!;

                const continuation = new Dialogue(SlamoRefugee, "Wow... I feel the power of the brick already!")
                    .monologue(
                        "In order to fully manifest the power of the Empowered Brick, I need to infuse it with Instant Win energy.",
                    )
                    .monologue(
                        "To start, can you obtain 2 XL Wool? You can get it from that guy selling wool in the marketplace.",
                    ).root;
                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === stage.dialogue && Server.Item.getItemAmount(EmpoweredBrick.id) >= 1) {
                        continuation.talk();
                    }
                    if (dialogue === continuation && Server.Quest.takeQuestItem(EmpoweredBrick.id, 1)) {
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Obtain 2 XL Wool from the marketplace and give it to the Slamo Refugee.`)
            .setDialogue(new Dialogue(SlamoRefugee, "Do you have the 2 XL Wool?"))
            .onReached((stage) => {
                SlamoRefugee.rootPart!.CFrame = SlamoRefugee.startingCFrame!;

                const continuation = new Dialogue(
                    SlamoRefugee,
                    "This is some high-quality wool. We can use this to absorb the Instant Win energy.",
                ).monologue(
                    "I know Freddy has a cauldron that has a bunch of Instant Win energy, but he won't let me use it. I hope you can convince him to let us borrow it.",
                ).root;

                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === stage.dialogue && Server.Item.getItemAmount("XLWool") >= 2) {
                        continuation.talk();
                    }
                    if (dialogue === continuation && Server.Quest.takeQuestItem("XLWool", 2)) {
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setNPC(Freddy, true)
            .setDescription(`Talk to Freddy at %coords%.`)
            .setDialogue(
                new Dialogue(
                    SlamoRefugee,
                    "Please talk to Freddy. He has a cauldron that can dissolve the XL Wool in Instant Win energy.",
                ),
            )
            .onReached((stage) => {
                SlamoRefugee.rootPart!.CFrame = SlamoRefugee.startingCFrame!;
                Freddy.rootPart!.CFrame = WAYPOINTS.ToTheVillageFreddyWaiting.CFrame;
                SlamoRefugee.model!.FindFirstChild("FishingRod")?.Destroy();

                const continuation = new Dialogue(Freddy, "Oh, my friend! How can I help you?")
                    .monologue("You need to borrow my cauldron? Of course, you can use it!")
                    .next(new Dialogue(SlamoRefugee, "What the... how did you get him to agree so easily?"))
                    .monologue(
                        "I guess he just really likes you. Anyways, let's get in his house. We can get started right away.",
                    ).root;

                refugeeToWaiting();
                continuation.add(4);

                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === continuation) {
                        stage.complete();
                    }
                });
                return () => {
                    connection.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Fill the cauldron with Instant Win energy.`)
            .setFocus(cauldron.PrimaryPart!)
            .setDialogue(new Dialogue(SlamoRefugee, "Go on, fill the cauldron!"))
            .onReached((stage) => {
                SlamoRefugee.rootPart!.CFrame = WAYPOINTS.ToTheVillageRefugeeWaiting.CFrame;
                Freddy.rootPart!.CFrame = WAYPOINTS.ToTheVillageFreddyWaiting.CFrame;
                SlamoRefugee.model!.FindFirstChild("FishingRod")?.Destroy();

                refugeeToBrewing();

                const proximityPrompt = cauldron.WaitForChild("ProximityPrompt") as ProximityPrompt;
                proximityPrompt.Enabled = true;
                const connection = proximityPrompt.Triggered.Connect(() => {
                    for (const effect of instantWinEffects) {
                        effect.Transparency = 0;
                    }
                    explosionEffect.Emit(2);
                    playSound("MagicSprinkle.mp3", cauldron.PrimaryPart);
                    proximityPrompt.Enabled = false;
                    stage.complete();
                });

                return () => {
                    connection.Disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(
                `Let the Slamo Refugee use the cauldron to infuse the Empowered Brick with Instant Win energy.`,
            )
            .setFocus(cauldron.PrimaryPart!)
            .setDialogue(new Dialogue(SlamoRefugee, "Let me handle this."))
            .onReached((stage) => {
                for (const effect of instantWinEffects) {
                    effect.Transparency = 0;
                }
                SlamoRefugee.rootPart!.CFrame = WAYPOINTS.ToTheVillageRefugeeBrewing.CFrame;
                Freddy.rootPart!.CFrame = WAYPOINTS.ToTheVillageFreddyWaiting.CFrame;
                SlamoRefugee.model!.FindFirstChild("FishingRod")?.Destroy();

                new Dialogue(SlamoRefugee, "Let me handle this.").talk();
                const continuation = new Dialogue(
                    SlamoRefugee,
                    "Wow... it's raw Instant Win energy. It's so potent!",
                ).monologue("Now, I can infuse the Empowered Brick with this energy. Just give me a moment.").root;
                const continuation2 = new Dialogue(
                    SlamoRefugee,
                    "It's beautiful! I can feel the power radiating from it.",
                ).monologue("Let's go repair the linkway to Slamo Village. I can't wait to get back home!").root;

                const wool = XLWool.MODEL!.Clone();
                const parts = new Array<BasePart>();
                for (const part of wool.GetDescendants()) {
                    if (part.IsA("BasePart")) {
                        part.CanCollide = false;
                        part.Anchored = true;
                        parts.push(part);
                    }
                }
                wool.PivotTo(cauldron.PrimaryPart!.CFrame.add(new Vector3(0, 5, 0)));
                wool.Parent = Workspace;

                task.wait(1);
                for (const part of parts) {
                    TweenService.Create(part, new TweenInfo(1), {
                        CFrame: part.CFrame.add(new Vector3(0, -4, 0)),
                    }).Play();
                }
                task.wait(1);
                playSound("MagicPowerUp.mp3", cauldron.PrimaryPart);
                wool.Destroy();
                const effect = explosionEffect.Clone();
                effect.Parent = instantWinBlock;
                effect.Emit(4);
                for (const effect of instantWinEffects) {
                    effect.Transparency = 1;
                }
                showInstantWinBlock();
                task.wait(1);
                continuation.talk();

                const empoweredBrick = EmpoweredBrick.MODEL!.Clone();
                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === continuation) {
                        empoweredBrick.PivotTo(WAYPOINTS.ToTheVillageEmpoweredBrick.CFrame);
                        empoweredBrick.Parent = Workspace;
                        // tween the empowered brick inside the instant win block
                        for (const part of empoweredBrick.GetDescendants()) {
                            if (part.IsA("BasePart")) {
                                part.CanCollide = false;
                                part.Anchored = true;
                                task.delay(1, () => {
                                    TweenService.Create(part, new TweenInfo(1), {
                                        CFrame: instantWinBlock.CFrame,
                                    }).Play();
                                });
                            }
                        }
                        task.wait(2);
                        playSound("MagicSprinkle.mp3", instantWinBlock);
                        const effect = explosionEffect.Clone();
                        effect.Parent = instantWinBlock;
                        effect.Emit(2);
                        hideInstantWinBlock();

                        const light = new Instance("PointLight");
                        light.Color = new Color3(0, 0.27, 1);
                        light.Brightness = 2;
                        light.Range = 10;
                        light.Parent = empoweredBrick.PrimaryPart;

                        task.wait(1);
                        continuation2.talk();
                    } else if (dialogue === continuation2) {
                        stage.complete();
                        Server.Quest.giveQuestItem(ChargedEmpoweredBrick.id, 1);
                        empoweredBrick.Destroy();
                    }
                });
                return () => {
                    connection.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Go to the Slamo Village linkway with the Charged Empowered Brick at %coords%.`)
            .setFocus(WAYPOINTS.ToTheVillageRefugeeIntermittentIsles)
            .setDialogue(
                new Dialogue(
                    SlamoRefugee,
                    "All you need to do is place the Charged Empowered Brick down. Once you do that, the linkway will be repaired and we can finally go home.",
                ),
            )
            .onReached((stage) => {
                SlamoRefugee.rootPart!.CFrame = WAYPOINTS.ToTheVillageRefugeeBrewing.CFrame;
                Freddy.rootPart!.CFrame = WAYPOINTS.ToTheVillageFreddyWaiting.CFrame;
                SlamoRefugee.model!.FindFirstChild("FishingRod")?.Destroy();

                const particlePart = linkway.WaitForChild("Particle");
                const linkwayEffect = getEffect("MassiveMagicExplosion").Clone();
                linkwayEffect.Enabled = false;
                linkwayEffect.Parent = particlePart.WaitForChild("Attachment");

                const dialogue = new Dialogue(
                    SlamoRefugee,
                    "We're here. All you need to do is place the Charged Empowered Brick down. Once you do that, the linkway will be repaired and we can finally go home.",
                );
                refugeeToIntermittent().onComplete(() => {
                    dialogue.talk();
                });

                const connection = Server.Item.itemsPlaced.connect((_, placedItems) => {
                    let placed = false;
                    for (const item of placedItems) {
                        if (item.item === ChargedEmpoweredBrick.id) {
                            placed = true;
                        }
                    }
                    if (placed === false) {
                        return;
                    }

                    // Show the linkway
                    const light = new Instance("PointLight");
                    light.Color = new Color3(0, 0.27, 1);
                    light.Brightness = 5;
                    light.Range = 60;
                    light.Parent = particlePart;
                    TweenService.Create(light, new TweenInfo(1), {
                        Range: 0,
                        Brightness: 0,
                    }).Play();

                    linkwayEffect.Emit(4);
                    playSoundAtPart(particlePart, getSound("LaserExplosion.mp3"), 2);
                    Server.UnlockedAreas.unlockArea("SlamoVillage");
                    stage.complete();
                });

                return () => {
                    connection.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setNPC(SlamoRefugee, true)
            .setDescription(`Follow the Slamo Refugee to the village.`)
            .setDialogue(new Dialogue(SlamoRefugee, "..."))
            .onReached((stage) => {
                SlamoRefugee.rootPart!.CFrame = WAYPOINTS.ToTheVillageRefugeeIntermittentIsles.CFrame;
                Freddy.rootPart!.CFrame = WAYPOINTS.ToTheVillageFreddyWaiting.CFrame;
                SlamoRefugee.model!.FindFirstChild("FishingRod")?.Destroy();

                const continuation = new Dialogue(SlamoRefugee, "Hey.")
                    .monologue("I bet you're wondering why I was in the Barren Islands in the first place.")
                    .monologue("To tell you the truth, I was exiled from Slamo Village for being too... different.")
                    .monologue("And now that I'm back... It's time to take my revenge.").root;

                refugeeToEnteringSlamoVillage().onComplete(() => {
                    continuation.talk();
                });
                task.wait(1);
                new Dialogue(SlamoRefugee, "Finally! The linkway is repaired!").talk(false);
                task.wait(7);
                new Dialogue(SlamoRefugee, "After all these years, I can finally see home again.").talk(false);
                task.wait(6);
                new Dialogue(SlamoRefugee, "The village is right up ahead!").talk(false);
                task.wait(6);
                new Dialogue(SlamoRefugee, "It's just as I remembered it... Small, cozy, and full of life.").talk(
                    false,
                );

                task.wait(10);
                new Dialogue(SlamoRefugee, "...").talk(false);

                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue !== continuation) {
                        return;
                    }

                    SlamoRefugee.humanoid!.WalkSpeed = 30;
                    refugeeToEnteringPoliceStation(false).onComplete(() => {
                        SlamoRefugee.rootPart!.CFrame = WAYPOINTS.ToTheVillageRefugeeImprisoned.CFrame;
                        SlamoRefugee.rootPart!.Anchored = true;
                        stage.complete();
                    });
                });

                return () => {
                    connection.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Chase after the Slamo Refugee.`)
            .setFocus(WAYPOINTS.ToTheVillageRefugeeEnteringPoliceStation)
            .setDialogue(
                new Dialogue(SlamoReceptionist, "Did you really let that exiled refugee back into the village?")
                    .monologue("Sigh... Well, we locked him in jail. He'll be dealt with soon enough.")
                    .monologue("I guess you kind of helped us out, since we didn't have to deal with him ourselves.")
                    .monologue(
                        "I mean, he literally ran to the police station all by himself. What was he expecting? A warm welcome?",
                    ).root,
            )
            .onReached((stage) => {
                Server.Event.setEventCompleted("ImprisonedSlamoRefugee", true);

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
            .setDescription(`Talk to the Slamo Refugee.`)
            .setFocus(WAYPOINTS.ToTheVillageRefugeeImprisoned)
            .setDialogue(
                new Dialogue(SlamoRefugee, "Damn them. I didn't know they invented a police force here.")
                    .monologue("I guess I should have expected it. They always were a bit too strict.")
                    .monologue(
                        "But I will not give up. Once I'm out of here, I will take back what's mine. Mark my words.",
                    )
                    .monologue("You know that mine in the middle of the village? I own that place. I built it myself.")
                    .monologue("And I will use that mine to rule this village. No one will stop me.")
                    .monologue("But for now, I will wait here. I have nothing left to lose.").root,
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
    .setCompletionDialogue(
        new Dialogue(
            SlamoRefugee,
            "Even though I am imprisoned, I will not give up. I will make my way back to the village and take back what is mine.",
        ),
    )
    .onInit(() => {
        for (const effect of instantWinEffects) {
            effect.Transparency = 1;
        }
        explosionEffect.Enabled = false;
        hideInstantWinBlock();
        instantWinBlock.CanCollide = false;
        Server.Event.addCompletionListener("ImprisonedSlamoRefugee", () => {
            SlamoRefugee.model!.FindFirstChild("FishingRod")?.Destroy();
            SlamoRefugee.rootPart!.Anchored = true;
            SlamoRefugee.rootPart!.CFrame = WAYPOINTS.ToTheVillageRefugeeImprisoned.CFrame;
        });
    })
    .setReward({
        xp: 410,
        area: "SlamoVillage",
    });
