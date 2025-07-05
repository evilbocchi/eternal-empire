import { playSoundAtPart } from "@antivivi/vrldk";
import { TweenService, Workspace } from "@rbxts/services";
import Quest, { Stage } from "server/Quest";
import { AREAS } from "shared/Area";
import { getNPCModel, getWaypoint } from "shared/constants";
import { getEffect, getSound } from "shared/asset/GameAssets";
import { Server } from "shared/item/ItemUtils";
import ChargedEmpoweredBrick from "shared/items/negative/instantwin/ChargedEmpoweredBrick";
import EmpoweredBrick from "shared/items/negative/instantwin/EmpoweredBrick";
import XLWool from "shared/items/negative/relax/XLWool";
import { Dialogue } from "shared/NPC";
import Freddy from "shared/npcs/Freddy";
import SlamoReceptionist from "shared/npcs/Slamo Receptionist";
import SlamoRefugee from "shared/npcs/Slamo Refugee";

const cauldron = AREAS.BarrenIslands.map.WaitForChild("Cauldron") as Model;
const linkway = AREAS.IntermittentIsles.areaFolder.WaitForChild("SlamoVillageConnection");

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

export = new Quest(script.Name)
    .setName("To The Village")
    .setLength(3)
    .setLevel(4)
    .setOrder(8)
    .addStage(new Stage()
        .setNPC("Slamo Refugee", true)
        .setDescription(`Talk to the Slamo Refugee at %coords%.`)
        .setDialogue(new Dialogue(SlamoRefugee, "Sigh... I miss my village.")
            .monologue("Did you know that there used to be a linkway between this barren wasteland and Slamo Village? It collapsed long ago, and I've been stuck here ever since.")
            .monologue("Say, if you could help me get back to Slamo Village, I would be forever grateful.")
            .monologue("To start, can you give me an Empowered Brick? You can craft one at that weird blacksmith's place.")
            .root
        )
        .onStart((stage) => {
            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue) {
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Craft an Empowered Brick and give it to the Slamo Refugee.`)
        .setFocus(getWaypoint("CraftingTable"))
        .setDialogue(new Dialogue(SlamoRefugee, "Do you have that Empowered Brick?"))
        .onStart((stage) => {
            const continuation = new Dialogue(SlamoRefugee, "Thank you so much! I feel the power of the brick already!")
                .monologue("In order to fully manifest the power of the Empowered Brick, I need to infuse it with Instant Win energy.")
                .monologue("To start, can you obtain 2 XL Wool? You can get it from that guy selling wool in the marketplace.")
                .root;
            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue && Server.Item.getItemAmount(EmpoweredBrick.id) >= 1) {
                    Server.Dialogue.talk(continuation);
                }
                if (dialogue === continuation && Server.Quest.takeQuestItem(EmpoweredBrick.id, 1)) {
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Obtain 2 XL Wool from the marketplace and give it to the Slamo Refugee.`)
        .setDialogue(new Dialogue(SlamoRefugee, "Do you have the 2 XL Wool?"))
        .onStart((stage) => {
            const continuation = new Dialogue(SlamoRefugee, "This is some high-quality wool. We can use this to absorb the Instant Win energy.")
                .monologue("I know Freddy has a cauldron that has a bunch of Instant Win energy, but he won't let me use it. I hope you can convince him to let us borrow it.")
                .root;

            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue && Server.Item.getItemAmount("XLWool") >= 2) {
                    Server.Dialogue.talk(continuation);
                }
                if (dialogue === continuation && Server.Quest.takeQuestItem("XLWool", 2)) {
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setNPC("Freddy", true)
        .setDescription(`Talk to Freddy at %coords%.`)
        .setDialogue(new Dialogue(SlamoRefugee, "Please talk to Freddy. He has a cauldron that can dissolve the XL Wool in Instant Win energy."))
        .onStart((stage) => {
            getNPCModel("Freddy").PivotTo(getWaypoint("ToTheVillage1").CFrame);
            const refugee = getNPCModel("Slamo Refugee");
            const continuation = new Dialogue(Freddy, "Oh, my friend! How can I help you?")
                .monologue("You need to borrow my cauldron? Of course, you can use it!")
                .next(new Dialogue(SlamoRefugee, "What the... how did you get him to agree so easily?"))
                .monologue("I guess he just really likes you. Anyways, let's get in his house. We can get started right away.")
                .root;

            refugee.FindFirstChild("FishingRod")?.Destroy();
            const moving = Server.NPC.Navigation.leadToPoint(refugee.WaitForChild("Humanoid"), getWaypoint("ToTheVillage2").CFrame, () => { }, false);
            task.spawn(() => {
                while (!Server.Quest.isQuestCompleted("AHelpingHand")) {
                    task.wait(0.1);
                }
                Server.Dialogue.addDialogue(continuation, 4);
            });

            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === continuation) {
                    stage.completed.fire();
                }
            });
            return () => {
                connection.disconnect();
                moving.Disconnect();
            };
        })
    )
    .addStage(new Stage()
        .setDescription(`Fill the cauldron with Instant Win energy.`)
        .setFocus(cauldron.PrimaryPart!)
        .onStart((stage) => {
            const refugee = getNPCModel("Slamo Refugee");
            refugee.FindFirstChild("FishingRod")?.Destroy();
            const moving = Server.NPC.Navigation.leadToPoint(refugee.WaitForChild("Humanoid"), getWaypoint("ToTheVillage3").CFrame, () => { }, false);

            const proximityPrompt = cauldron.WaitForChild("ProximityPrompt") as ProximityPrompt;
            proximityPrompt.Enabled = true;
            const connection = proximityPrompt.Triggered.Connect(() => {
                for (const effect of instantWinEffects) {
                    effect.Transparency = 0;
                }
                explosionEffect.Emit(2);
                playSoundAtPart(cauldron.PrimaryPart, getSound("MagicSprinkle"));
                proximityPrompt.Enabled = false;
                stage.completed.fire();
            });

            return () => {
                connection.Disconnect();
                moving.Disconnect();
            };
        })
    )
    .addStage(new Stage()
        .setDescription(`Let the Slamo Refugee use the cauldron to infuse the Empowered Brick with Instant Win energy.`)
        .setFocus(cauldron.PrimaryPart!)
        .onStart((stage) => {
            for (const effect of instantWinEffects) {
                effect.Transparency = 0;
            }
            const refugee = getNPCModel("Slamo Refugee");
            refugee.FindFirstChild("FishingRod")?.Destroy();

            Server.Dialogue.talk(new Dialogue(SlamoRefugee, "Let me handle this."));
            const continuation = new Dialogue(SlamoRefugee, "Wow... it's raw Instant Win energy. It's so potent!")
                .monologue("Now, I can infuse the Empowered Brick with this energy. Just give me a moment.")
                .root;
            const continuation2 = new Dialogue(SlamoRefugee, "It's beautiful! I can feel the power radiating from it.")
                .monologue("Let's go repair the linkway to Slamo Village. I can't wait to get back home!")
                .root;

            refugee.PivotTo(getWaypoint("ToTheVillage3").CFrame);
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
                    CFrame: part.CFrame.add(new Vector3(0, -4, 0))
                }).Play();
            }
            task.wait(1);
            playSoundAtPart(cauldron.PrimaryPart, getSound("SpellCardAttack"));
            wool.Destroy();
            const effect = explosionEffect.Clone();
            effect.Parent = instantWinBlock;
            effect.Emit(4);
            for (const effect of instantWinEffects) {
                effect.Transparency = 1;
            }
            showInstantWinBlock();
            task.wait(1);
            Server.Dialogue.talk(continuation);

            const empoweredBrick = EmpoweredBrick.MODEL!.Clone();
            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === continuation) {
                    empoweredBrick.PivotTo(getWaypoint("ToTheVillageEmpoweredBrick").CFrame);
                    empoweredBrick.Parent = Workspace;
                    // tween the empowered brick inside the instant win block
                    for (const part of empoweredBrick.GetDescendants()) {
                        if (part.IsA("BasePart")) {
                            part.CanCollide = false;
                            part.Anchored = true;
                            task.delay(1, () => {
                                TweenService.Create(part, new TweenInfo(1), {
                                    CFrame: instantWinBlock.CFrame
                                }).Play();
                            });

                        }
                    }
                    task.wait(2);
                    playSoundAtPart(instantWinBlock, getSound("MagicSprinkle"));
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
                    Server.Dialogue.talk(continuation2);
                }
                else if (dialogue === continuation2) {
                    stage.completed.fire();
                    Server.Quest.giveQuestItem(ChargedEmpoweredBrick.id, 1);
                    empoweredBrick.Destroy();
                }
            });
            return () => {
                connection.disconnect();
            };
        })
    )
    .addStage(new Stage()
        .setDescription(`Go to the Slamo Village linkway with the Charged Empowered Brick at %coords%.`)
        .setFocus(getWaypoint("ToTheVillage4"))
        .onStart((stage) => {
            const refugee = getNPCModel("Slamo Refugee");
            refugee.FindFirstChild("FishingRod")?.Destroy();

            const particlePart = linkway.WaitForChild("Particle");
            const linkwayEffect = getEffect("MassiveMagicExplosion").Clone();
            linkwayEffect.Enabled = false;
            linkwayEffect.Parent = particlePart.WaitForChild("Attachment");

            const dialogue = new Dialogue(SlamoRefugee, "We're here. All you need to do is place the Charged Empowered Brick down. Once you do that, the linkway will be repaired and we can finally go home."); const moving = Server.NPC.Navigation.leadToPoint(refugee.WaitForChild("Humanoid"), getWaypoint("ToTheVillage4").CFrame, () => {
                Server.Dialogue.talk(dialogue);
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
                    Brightness: 0
                }).Play();

                linkwayEffect.Emit(4);
                playSoundAtPart(particlePart, getSound("MagicExplosion"), 2);
                Server.UnlockedAreas.unlockArea("SlamoVillage");
                stage.completed.fire();
            });

            return () => {
                connection.disconnect();
                moving.Disconnect();
            };
        })
    )
    .addStage(new Stage()
        .setNPC("Slamo Refugee", true)
        .setDescription(`Follow the Slamo Refugee to the village.`)
        .onStart((stage) => {
            const refugee = getNPCModel("Slamo Refugee");
            refugee.FindFirstChild("FishingRod")?.Destroy();
            refugee.PivotTo(getWaypoint("ToTheVillage4").CFrame);

            const continuation = new Dialogue(SlamoRefugee, "Hey.")
                .monologue("I bet you're wondering why I was in the Barren Islands in the first place.")
                .monologue("To tell you the truth, I was exiled from Slamo Village for being too... different.")
                .monologue("And now that I'm back... It's time to take my revenge.")
                .root;

            const moving = Server.NPC.Navigation.leadToPoint(refugee.WaitForChild("Humanoid"), getWaypoint("ToTheVillage5").CFrame, () => {
                Server.Dialogue.talk(continuation);
            });
            task.wait(2);
            Server.Dialogue.talk(new Dialogue(SlamoRefugee, "Finally! The linkway is repaired!"), false);
            task.wait(6);
            Server.Dialogue.talk(new Dialogue(SlamoRefugee, "After all these years, I can finally see home again."), false);
            task.wait(6);
            Server.Dialogue.talk(new Dialogue(SlamoRefugee, "The village is right up ahead!"), false);
            task.wait(6);
            Server.Dialogue.talk(new Dialogue(SlamoRefugee, "It's just as I remembered it... Small, cozy, and full of life."), false);
            task.wait(10);
            Server.Dialogue.talk(new Dialogue(SlamoRefugee, "..."), false);

            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue !== continuation) {
                    return;
                }

                const humanoid = refugee.WaitForChild("Humanoid") as Humanoid;
                humanoid.WalkSpeed = 30;
                Server.NPC.Navigation.pathfind(humanoid, getWaypoint("ToTheVillage6").Position, () => {
                    refugee.PivotTo(getWaypoint("ToTheVillage7").CFrame);
                    humanoid.RootPart!.Anchored = true;
                    stage.completed.fire();
                });
            });

            return () => {
                connection.disconnect();
                moving.Disconnect();
            };
        })
    )
    .addStage(new Stage()
        .setDescription(`Chase after the Slamo Refugee.`)
        .setFocus(getWaypoint("ToTheVillage6"))
        .setDialogue(new Dialogue(SlamoReceptionist, "Did you really let that exiled refugee back into the village?")
            .monologue("Sigh... Well, we locked him in jail. He'll be dealt with soon enough.")
            .monologue("I guess you kind of helped us out, since we didn't have to deal with him ourselves.")
            .monologue("I mean, he literally ran to the police station all by himself. What was he expecting? A warm welcome?")
            .root
        )
        .onStart((stage) => {
            Server.Event.setEventCompleted("ImprisonedSlamoRefugee", true);

            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue) {
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Talk to the Slamo Refugee.`)
        .setFocus(getWaypoint("ToTheVillage7"))
        .setDialogue(new Dialogue(SlamoRefugee, "Damn them. I didn't know they invented a police force here.")
            .monologue("I guess I should have expected it. They always were a bit too strict.")
            .monologue("But I will not give up. Once I'm out of here, I will take back what's mine. Mark my words.")
            .monologue("You know that mine in the middle of the village? I own that place. I built it myself.")
            .monologue("And I will use that mine to rule this village. No one will stop me.")
            .monologue("But for now, I will wait here. I have nothing left to lose.")
            .root
        )
        .onStart((stage) => {
            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue) {
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        })
    )
    .setCompletionDialogue(new Dialogue(SlamoRefugee, "Even though I am imprisoned, I will not give up. I will make my way back to the village and take back what is mine."))
    .onInit(() => {
        for (const effect of instantWinEffects) {
            effect.Transparency = 1;
        }
        explosionEffect.Enabled = false;
        hideInstantWinBlock();
        instantWinBlock.CanCollide = false;
        Server.Event.addCompletionListener("ImprisonedSlamoRefugee", () => {
            const refugee = getNPCModel("Slamo Refugee");
            refugee.FindFirstChild("FishingRod")?.Destroy();
            const humanoid = refugee.WaitForChild("Humanoid") as Humanoid;
            humanoid.RootPart!.Anchored = true;
            refugee.PivotTo(getWaypoint("ToTheVillage7").CFrame);
        });
    })
    .setReward({
        xp: 410,
        area: "SlamoVillage"
    });