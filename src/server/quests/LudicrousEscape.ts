import { OnoeNum } from "@rbxts/serikanum";
import { convertToMMSS, spawnExplosion } from "@antivivi/vrldk";
import { RunService, TweenService, Workspace } from "@rbxts/services";
import Andy from "server/interactive/npc/Andy";
import { Dialogue, EMPTY_NPC } from "server/interactive/npc/NPC";
import PoliceOfficer from "server/interactive/npc/Police Officer";
import Simpul from "server/interactive/npc/Simpul";
import SlamoReceptionist from "server/interactive/npc/Slamo Receptionist";
import SlamoBook from "server/interactive/object/SlamoBook";
import Quest, { Stage } from "server/quests/Quest";
import { Server } from "shared/api/APIExpose";
import { emitEffect, playSound } from "shared/asset/GameAssets";
import { WAYPOINTS } from "shared/constants";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import { RESET_LAYERS } from "shared/currency/mechanics/ResetLayer";
import ThisEmpire from "shared/data/ThisEmpire";
import SkillPod from "shared/items/0/millisecondless/SkillPod";
import SlamoStatue from "shared/items/0/millisecondless/SlamoStatue";
import Stone from "shared/items/0/millisecondless/Stone";
import Wood from "shared/items/0/millisecondless/Wood";
import SlamoBoardAutomater from "shared/items/0/winsome/SlamoBoardAutomater";
import WinsomeBucket from "shared/items/0/winsome/WinsomeBucket";
import WinsomeSpeck from "shared/items/0/winsome/WinsomeSpeck";
import Crystal from "shared/items/excavation/Crystal";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import Gold from "shared/items/excavation/Gold";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import Iron from "shared/items/excavation/Iron";
import Apple from "shared/items/negative/a/Apple";
import FlimsyBars from "shared/world/nodes/FlimsyBars";

Simpul.rootPart!.Anchored = true;

const simpulToOut = Simpul.createPathfindingOperation(Simpul.startingCFrame, WAYPOINTS.LudicrousEscapeSimpulOut.CFrame);

const slamoReceptionistToHiding = SlamoReceptionist.createPathfindingOperation(
    SlamoReceptionist.startingCFrame,
    WAYPOINTS.LudicrousEscapeSlamoReceptionistHiding.CFrame,
    false,
);

const slamoReceptionistToReveal = SlamoReceptionist.createPathfindingOperation(
    WAYPOINTS.LudicrousEscapeSlamoReceptionistHiding.CFrame,
    WAYPOINTS.LudicrousEscapeSlamoReceptionistReveal.CFrame,
);

const ring = WAYPOINTS.LudicrousEscapeSlamoReceptionistHiding.LudicrousEscapeRing;
const toggleRing = (enabled: boolean) => {
    for (const beam of ring.GetChildren()) if (beam.IsA("Beam")) beam.Enabled = enabled;
};
toggleRing(false);

const decal = Simpul.model!.WaitForChild("Head").FindFirstChildOfClass("Decal")!;
const sadDecal = decal.Texture;
const heheDecal = "http://www.roblox.com/asset/?id=6531524856";

const finishing = new Dialogue(SlamoReceptionist, "That just happened... Good job stopping him in his tracks!")
    .monologue(
        "You know what? You can do whatever you want with Simpul. It's not like we have much we can do with him, anyways. And it'll be a hassle to feed him daily.",
    )
    .monologue(
        "We've actually taken quite a bit of notice to your mine in the middle of our village, and we are grateful that you are developing what we can't!",
    )
    .monologue(
        "I'll give you something pretty special, chaining Simpul to a mini-board. He'll be helping you with your Upgrade Board I from now on.",
    )
    .monologue("Anyways, that's all for now. See you soon.").root;

export = new Quest(script.Name)
    .setName("Ludicrous Escape")
    .setLength(2)
    .setLevel(6)
    .setOrder(2)
    .addStage(
        new Stage()
            .setDescription(`Head to the Slamo Police and talk to the prisoner held there at %coords%.`)
            .setNPC(Simpul, true)
            .setDialogue(
                new Dialogue(Simpul, "Sniff... sniff... Wait. You're a Player.")
                    .monologue(
                        "Aren't Players those species that can, like, do crazy things and are really smart and stuff?",
                    )
                    .monologue("Please, I'm begging you. Help me out of this prison!")
                    .monologue(
                        "Let me introduce myself. I'm Simpul, former religious leader. You don't need to know which religion.",
                    )
                    .monologue(
                        "You'll need to find where the keys are located. It's somewhere here, but... yeah. I don't where they can hide the keys in such a cramped place.",
                    )
                    .monologue("Anyways, I'm counting on you. Set me free!").root,
            )
            .onReached((stage) => {
                Simpul.rootPart!.Position = stage.position!;
                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === stage.dialogue) {
                        Server.Event.setEventCompleted("SimpulReveal", true);
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Find the keys to the prison bars.`)
            .setDialogue(new Dialogue(Simpul, "Set me free for the sake of world peace!"))
            .onReached((stage) => {
                const dialogues = [
                    new Dialogue(
                        SlamoReceptionist,
                        "Hey, I don't remember allowing you to talk to the prisoner we have on board.",
                    )
                        .monologue(
                            "Let me make this clear, he's not a safe individual to be around. He was arrested because of his connections with the underworld, you know?",
                        )
                        .monologue(
                            "He sold innocent children for the sake of profit. Don't get associated with that guy, or else we might have to capture you too.",
                        ).root,
                    new Dialogue(PoliceOfficer, "Did you talk with that Simpul?")
                        .monologue(
                            "He was a good friend of mine until I realised what he was doing to make money. It gives me the shivers to know that our poor community was being leeched off by him.",
                        )
                        .monologue(
                            "...You want to know where the keys are? Don't tell me you're planning on setting him free or something.",
                        )
                        .monologue(
                            "They're totally not behind a secret wall near those crates or anything. Why would they be?",
                        )
                        .monologue(
                            "Anyways, just give it up. Our security is pretty high here, so we'll catch you if you do anything suspicious.",
                        ).root,
                ];
                for (const dialogue of dialogues) dialogue.add();
                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === SlamoBook.dialogue) stage.complete();
                });
                return () => {
                    for (const dialogue of dialogues) dialogue.remove();
                    connection.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Confront Simpul about his past.`)
            .setNPC(Simpul)
            .setDialogue(
                new Dialogue(Simpul, "I see you do not have the keys. Haah, you're useless.")
                    .monologue("Um... considering you're here without any reason... why?")
                    .monologue("Ah. I know. You found out.")
                    .monologue("Nevermind this whole charade anymore.").root,
            )
            .onReached((stage) => {
                const continuation = new Dialogue(
                    Simpul,
                    "You thought these puny bars could stop me? Yeah, right. See you never!",
                );

                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === stage.dialogue) {
                        Server.Event.setEventCompleted("FlimsyBarsDestroyed", true);
                        task.delay(1, () => {
                            simpulToOut().onComplete(() => {
                                continuation.talk();
                            });
                        });
                    } else if (dialogue === continuation) {
                        Simpul.rootPart!.Anchored = true;
                        TweenService.Create(Simpul.rootPart!, new TweenInfo(0.5), {
                            CFrame: WAYPOINTS.LudicrousEscapeSimpulOut.CFrame.add(new Vector3(0, 150, 0)),
                        }).Play();
                        task.delay(2, () => stage.complete());
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Help the police find and re-capture Simpul.`)
            .setNPC(Simpul)
            .setDialogue(
                new Dialogue(PoliceOfficer, "Wow, Simpul really escaped just like that.").monologue(
                    "I would care more, but I don't care.",
                ).root,
            )
            .onReached((stage) => {
                Simpul.rootPart!.CFrame = WAYPOINTS.LudicrousEscapeSimpulOut.CFrame.add(new Vector3(0, 150, 0));

                const ItemService = Server.Item;
                const start = new Dialogue(
                    SlamoReceptionist,
                    "So, about that explosion above... Simpul escaped, didn't he.",
                )
                    .monologue(
                        "Come on! What's wrong with you? Seriously, I even replaced the key with that dumb book so that you wouldn't let him loose, and yet he's now roaming around like nothing ever happened.",
                    )
                    .monologue(
                        "Ugh... If you feel sorry, then help us out here. You'll need to lure him out and trap him in his own creation.",
                    )
                    .monologue(
                        "You'll need some stuff for the lure. Get 5 jWood and 3 jRock from the store and head back to me. I'll put some stuff together based on some model Slamos.",
                    )
                    .monologue(
                        "For the trap, I think a nice bucket of Winsome would do the trick. Just harvest 10 Winsome Specks from intruding into people's homes and taking the Winsome residue from their beds!",
                    )
                    .monologue(
                        "You might need a good hoe for that, though. I bet that one weird Bacon Hair with those scraps on his table has some. Well, that's your problem, not mine. Actually, it is mine. But it's yours.",
                    ).root;
                const checking = new Dialogue(SlamoReceptionist, "Do you have the 5 jWood and 3 jRock?");
                const getStatue = new Dialogue(
                    SlamoReceptionist,
                    "Perfect. Let me just do this... and do that...",
                ).monologue(
                    "Brilliant. Here it is. You'll still need the trap, though. The 10 Winsome Specks you need can be found on people's beds. Make sure to harvest them with a good hoe.",
                ).root;
                const checking2 = new Dialogue(SlamoReceptionist, "Do you have the 10 Winsome Specks?");
                const fetchBucket = new Dialogue(
                    SlamoReceptionist,
                    "Perfect. Wait. It's not perfect. How do I make a bucket of Winsome again?",
                )
                    .monologue(
                        "Uh... uh... well. I don't really know, but maybe you can make it somehow. I don't know, are you perhaps good at crafting or something? That could help.",
                    )
                    .monologue(
                        "I know one of the essential resources for a bucket of Winsome is a Skill Pod. So, here you go? I don't really need it.",
                    ).root;
                const checking3 = new Dialogue(SlamoReceptionist, "Do you have the bucket of Winsome?");
                const ending = new Dialogue(
                    SlamoReceptionist,
                    "Now that is actually perfect. Well, let's head to the village centre and try to catch that monster!",
                );
                if (ItemService.getItemAmount(SlamoStatue.id) > 0) {
                    if (ItemService.getItemAmount(WinsomeBucket.id) > 0) {
                        ending.talk();
                    } else {
                        checking2.add();
                    }
                } else {
                    start.add();
                }
                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === start) {
                        start.remove();
                        checking.add();
                    } else if (
                        dialogue === checking &&
                        ItemService.getItemAmount(Wood.id) >= 5 &&
                        ItemService.getItemAmount(Stone.id) >= 3
                    ) {
                        getStatue.talk();
                    } else if (dialogue === getStatue) {
                        Server.Quest.takeQuestItem(Wood.id, 5);
                        Server.Quest.takeQuestItem(Stone.id, 3);
                        Server.Quest.giveQuestItem(SlamoStatue.id, 1);
                        checking.remove();
                        checking2.add();
                    } else if (dialogue === checking2 && ItemService.getItemAmount(WinsomeSpeck.id) >= 10) {
                        fetchBucket.talk();
                        checking2.remove();
                        checking3.add();
                    } else if (dialogue === fetchBucket) {
                        Server.Quest.giveQuestItem(SkillPod.id, 1);
                    } else if (dialogue === checking3 && ItemService.getItemAmount(WinsomeBucket.id) >= 1) {
                        checking3.remove();
                        ending.talk();
                    } else if (dialogue === ending) {
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Lure Simpul and trap him.`)
            .setFocus(ring)
            .setNPC(Simpul)
            .setDialogue(new Dialogue(SlamoReceptionist, "Follow my lead.").root)
            .onReached((stage) => {
                toggleRing(true);
                const hint = new Dialogue(
                    SlamoReceptionist,
                    "Come on, get in front of me and place the statue down where Simpul can easily spot it.",
                );
                slamoReceptionistToHiding().onComplete(() => {
                    new Dialogue(
                        SlamoReceptionist,
                        "Alright. I'll stay here and hide to make sure nothing happens. You go in front and place the statue down.",
                    ).talk(false);
                });

                let statue: Model | undefined;

                hint.add();
                const poured = new Dialogue(EMPTY_NPC, "You pour the bucket on Simpul.");
                Simpul.onInteract(() => poured.talk());
                const simpulSad = new Dialogue(Simpul, "This can't be... No... NOO!!!");
                let initiated = false;
                const update = (placementId: string) => {
                    statue = Server.Item.modelPerPlacementId.get(placementId);
                    task.wait(0.5);
                    if (statue === undefined || statue.Parent === undefined || initiated === true) return;

                    initiated = true;
                    const statueCFrame = statue.GetPivot();

                    Simpul.rootPart!.CFrame = statueCFrame.add(new Vector3(0, 100, 0));
                    TweenService.Create(Simpul.rootPart!, new TweenInfo(4), {
                        CFrame: statueCFrame.add(statueCFrame.LookVector.mul(12)).mul(CFrame.Angles(0, math.pi, 0)),
                    }).Play();
                    task.delay(1.5, () =>
                        new Dialogue(Simpul, "Oh my god... You're the perfect Slamo! Come with me, please.").talk(
                            false,
                        ),
                    );
                    task.delay(5, () =>
                        new Dialogue(SlamoReceptionist, "Alright, pour the bucket on him!").talk(false),
                    );
                };
                const placedItems = ThisEmpire.data.items.worldPlaced;
                for (const [placementId, placedItem] of placedItems)
                    if (placedItem.item === SlamoStatue.id) {
                        update(placementId);
                        break;
                    }

                const connection1 = Server.Item.itemsPlaced.connect((_player, placedItems) => {
                    for (const placedItem of placedItems)
                        if (placedItem.item === SlamoStatue.id) {
                            update(placedItem.id);
                            break;
                        }
                });
                const connection2 = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === poured) {
                        const model = WinsomeBucket.MODEL?.Clone();
                        if (model === undefined) return;
                        const bucketCFrame = Simpul.rootPart!.CFrame.add(new Vector3(0, 4, 0));
                        Simpul.onInteract();

                        let t = 0;
                        const c = RunService.Heartbeat.Connect((dt) => {
                            t += dt;
                            if (t > 0.33) {
                                c.Disconnect();
                            }
                            model.PivotTo(bucketCFrame.mul(CFrame.Angles(0, 0, t * 3 * math.pi)));
                        });
                        task.delay(1, () => {
                            emitEffect("ExpandingWhirls", Simpul.rootPart!, 4);
                            model.Destroy();
                            playSound("Splash.mp3", Simpul.rootPart!);
                            const trap = Simpul.model!.WaitForChild("Part") as BasePart;
                            trap.Transparency = 0;
                            trap.FindFirstChildOfClass("Decal")!.Transparency = 0;
                            decal.Texture = sadDecal;
                        });
                        task.delay(2.5, () => simpulSad.talk());
                        model.Parent = Workspace;
                    } else if (dialogue === simpulSad) {
                        const part = new Instance("Part");
                        part.Transparency = 1;
                        part.Anchored = true;
                        part.CanCollide = false;
                        part.Position = Simpul.rootPart!.Position;
                        part.Parent = Workspace;
                        spawnExplosion(part.Position, part);
                        playSound("Explosion.mp3", part);
                        Server.Event.setEventCompleted("SimpulGone", true);
                    }
                });
                const connection3 = Server.Event.addCompletionListener("SimpulGone", (isCompleted) => {
                    if (!isCompleted) return;
                    slamoReceptionistToReveal();
                    stage.complete();
                });
                return () => {
                    connection1.disconnect();
                    connection2.disconnect();
                    connection3.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Serve justice to Simpul.`)
            .setNPC(Simpul)
            .onReached((stage) => {
                finishing.talk();

                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === finishing) {
                        SlamoReceptionist.createPathfindingOperation(
                            SlamoReceptionist.rootPart!.CFrame,
                            SlamoReceptionist.startingCFrame,
                        )();
                        toggleRing(false);
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .onInit(() => {
        const CurrencyService = Server.Currency;
        Server.Event.addCompletionListener("SimpulReveal", (isCompleted) => {
            if (isCompleted) Simpul.revealActualName();
        });
        Server.Event.addCompletionListener("FlimsyBarsDestroyed", (isCompleted) => {
            if (!isCompleted) return;

            decal.Texture = heheDecal;
            const bars = FlimsyBars.waitForInstance();
            bars.PrimaryPart?.FindFirstChildOfClass("Sound")?.Play();
            spawnExplosion(bars.GetPivot().Position);
            for (const bar of bars.GetChildren()) {
                bar.Destroy();
            }
        });
        Server.Event.addCompletionListener("SimpulGone", (isCompleted) => {
            if (!isCompleted) return;
            Simpul.rootPart!.CFrame = new CFrame(0, -200, 0);
        });

        const questMetadata = ThisEmpire.data.questMetadata;

        const start = new Dialogue(
            Andy,
            `It would be great if you could help me out with harvesting these apples. Say, if you bring me 40 Apples, I'll reward you handsomely. Deal?`,
        );
        const done = new Dialogue(Andy, "Wow! Those are some really cool looking apples. Don't mind if I do.");

        Dialogue.finished.connect((dialogue) => {
            if (dialogue === Andy.defaultDialogues[0]) {
                const last = questMetadata.get("Andy") as number | undefined;
                if (last === undefined || last + 3600 < tick()) {
                    if (Server.Quest.takeQuestItem(Apple.id, 40)) {
                        done.talk();
                    } else {
                        start.talk();
                    }
                } else {
                    new Dialogue(
                        Andy,
                        "You can talk with me again in " +
                            convertToMMSS(math.floor(((questMetadata.get("Andy") as number) ?? 0) - tick() + 3600)) +
                            " to help me out again!",
                    ).talk();
                }
            } else if (dialogue === done) {
                questMetadata.set("Andy", tick());
                const rng = math.random(1, 3);
                if (rng === 1) {
                    new Dialogue(Andy, "As your reward, here's a Funds Bomb! Enjoy!").talk();
                    CurrencyService.increment("Funds Bombs", new OnoeNum(1));
                } else if (rng === 2) {
                    const skillDelta = Server.Reset.getResetReward(RESET_LAYERS.Skillification)?.div(5)?.get("Skill");
                    if (skillDelta === undefined || skillDelta.equals(0)) {
                        new Dialogue(
                            Andy,
                            "As your reward, I wanted to give you some Skill... but I'm all out. Here's some resources instead!",
                        ).talk();
                        Server.Quest.giveQuestItem(EnchantedGrass.id, 3);
                        Server.Quest.giveQuestItem(ExcavationStone.id, 15);
                        return;
                    }

                    new Dialogue(
                        Andy,
                        "As your reward, I gave you a bit of my Skill. Hopefully, it'll help you out!",
                    ).talk();
                    CurrencyService.incrementAll(new CurrencyBundle().set("Skill", skillDelta).amountPerCurrency);
                } else if (rng === 3) {
                    new Dialogue(
                        Andy,
                        "As your reward, I gave you some pretty cool resources. Use them wisely!",
                    ).talk();
                    Server.Quest.giveQuestItem(Gold.id, 1);
                    Server.Quest.giveQuestItem(Iron.id, 4);
                    Server.Quest.giveQuestItem(Crystal.id, 10);
                }
            }
        });
    })
    .setCompletionDialogue(new Dialogue(SlamoReceptionist, "What's up?"))
    .setReward({
        xp: 340,
        items: new Map([[SlamoBoardAutomater.id, 1]]),
    });
