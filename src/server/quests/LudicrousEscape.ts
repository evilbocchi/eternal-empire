import { OnoeNum } from "@antivivi/serikanum";
import { convertToMMSS, playSoundAtPart, spawnExplosion } from "@antivivi/vrldk";
import { RunService, TweenService, Workspace } from "@rbxts/services";
import Quest, { Stage } from "server/Quest";
import { AREAS } from "shared/Area";
import { emitEffect, getSound } from "shared/asset/GameAssets";
import { getNPCModel, PLACED_ITEMS_FOLDER, WAYPOINTS } from "shared/constants";
import InteractableObject from "shared/InteractableObject";
import { Server } from "shared/item/ItemUtils";
import SkillPod from "shared/items/0/millisecondless/SkillPod";
import SlamoStatue from "shared/items/0/millisecondless/SlamoStatue";
import Stone from "shared/items/0/millisecondless/Stone";
import Wood from "shared/items/0/millisecondless/Wood";
import SlamoBoardAutomater from "shared/items/0/winsome/SlamoBoardAutomater";
import WinsomeBucket from "shared/items/0/winsome/WinsomeBucket";
import Crystal from "shared/items/excavation/Crystal";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import Gold from "shared/items/excavation/Gold";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";
import Iron from "shared/items/excavation/Iron";
import { Dialogue, EMPTY_NPC } from "shared/NPC";
import Andy from "shared/npcs/Andy";
import PoliceOfficer from "shared/npcs/Police Officer";
import Simpul from "shared/npcs/Simpul";
import SlamoReceptionist from "shared/npcs/Slamo Receptionist";
import { RESET_LAYERS } from "shared/ResetLayer";

const simpulModel = getNPCModel("Simpul");
const simpulHumanoid = simpulModel.FindFirstChildOfClass("Humanoid")!;
const simpulRootPart = simpulHumanoid.RootPart!;

const slamoReceptionistHumanoid = getNPCModel("Slamo Receptionist").FindFirstChildOfClass("Humanoid")!;
const slamoReceptionistRootPart = slamoReceptionistHumanoid.RootPart!;

simpulRootPart.Anchored = true;

const simpulToOut = Server.NPC.Navigation.createPathfindingOperation(
    simpulHumanoid,
    simpulRootPart.CFrame,
    WAYPOINTS.LudicrousEscapeSimpulOut.CFrame
);

const slamoReceptionistToHiding = Server.NPC.Navigation.createPathfindingOperation(
    slamoReceptionistHumanoid,
    slamoReceptionistRootPart.CFrame,
    WAYPOINTS.LudicrousEscapeSlamoReceptionistHiding.CFrame,
    false
);

const slamoReceptionistToReveal = Server.NPC.Navigation.createPathfindingOperation(
    slamoReceptionistHumanoid,
    WAYPOINTS.LudicrousEscapeSlamoReceptionistHiding.CFrame,
    WAYPOINTS.LudicrousEscapeSlamoReceptionistReveal.CFrame
);

const ring = WAYPOINTS.LudicrousEscapeSlamoReceptionistHiding.LudicrousEscapeRing;
const toggleRing = (enabled: boolean) => {
    for (const beam of ring.GetChildren())
        if (beam.IsA("Beam"))
            beam.Enabled = enabled;
};
toggleRing(false);

const decal = simpulModel.WaitForChild("Head").FindFirstChildOfClass("Decal")!;
const sadDecal = decal.Texture;
const heheDecal = "http://www.roblox.com/asset/?id=6531524856";

const finishing = new Dialogue(SlamoReceptionist, "That just happened... Good job stopping him in his tracks!")
    .monologue("You know what? You can do whatever you want with Simpul. It's not like we have much we can do with him, anyways. And it'll be a hassle to feed him daily.")
    .monologue("We've actually taken quite a bit of notice to your mine in the middle of our village, and we are grateful that you are developing what we can't!")
    .monologue("I'll give you something pretty special, chaining Simpul to a mini-board. He'll be helping you with your Upgrade Board I from now on.")
    .monologue("Anyways, that's all for now. See you soon.")
    .root;

export = new Quest(script.Name)
    .setName("Ludicrous Escape")
    .setLength(2)
    .setLevel(6)
    .setOrder(2)
    .addStage(new Stage()
        .setDescription(`Head to the Slamo Police and talk to the prisoner held there at %coords%.`)
        .setNPC("Simpul", true)
        .setDialogue(
            new Dialogue(Simpul, "Sniff... sniff... Wait. You're a Player.")
                .monologue("Aren't Players those species that can, like, do crazy things and are really smart and stuff?")
                .monologue("Please, I'm begging you. Help me out of this prison!")
                .monologue("Let me introduce myself. I'm Simpul, former religious leader. You don't need to know which religion.")
                .monologue("You'll need to find where the keys are located. It's somewhere here, but... yeah. I don't where they can hide the keys in such a cramped place.")
                .monologue("Anyways, I'm counting on you. Set me free!")
                .root
        )
        .onStart((stage) => {
            simpulRootPart.Position = stage.position!;
            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue) {
                    Server.Event.setEventCompleted("SimpulReveal", true);
                    stage.complete();
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Find the keys to the prison bars.`)
        .setDialogue(
            new Dialogue(Simpul, "Set me free for the sake of world peace!")
        )
        .onStart((stage) => {
            const dialogues = [
                new Dialogue(SlamoReceptionist, "Hey, I don't remember allowing you to talk to the prisoner we have on board.")
                    .monologue("Let me make this clear, he's not a safe individual to be around. He was arrested because of his connections with the underworld, you know?")
                    .monologue("He sold innocent children for the sake of profit. Don't get associated with that guy, or else we might have to capture you too.")
                    .root,
                new Dialogue(PoliceOfficer, "Did you talk with that Simpul?")
                    .monologue("He was a good friend of mine until I realised what he was doing to make money. It gives me the shivers to know that our poor community was being leeched off by him.")
                    .monologue("...You want to know where the keys are? Don't tell me you're planning on setting him free or something.")
                    .monologue("They're totally not behind a secret wall near those crates or anything. Why would they be?")
                    .monologue("Anyways, just give it up. Our security is pretty high here, so we'll catch you if you do anything suspicious.")
                    .root
            ];
            for (const dialogue of dialogues)
                Server.Dialogue.addDialogue(dialogue);
            stage.onComplete(() => {
                for (const dialogue of dialogues)
                    Server.Dialogue.removeDialogue(dialogue);
            });
            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === InteractableObject.SlamoBook.dialogue)
                    stage.complete();
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Confront Simpul about his past.`)
        .setNPC("Simpul")
        .setDialogue(
            new Dialogue(Simpul, "I see you do not have the keys. Haah, you're useless.")
                .monologue("Um... considering you're here without any reason... why?")
                .monologue("Ah. I know. You found out.")
                .monologue("Nevermind this whole charade anymore.")
                .root
        )
        .onStart((stage) => {
            const continuation = new Dialogue(Simpul, "You thought these puny bars could stop me? Yeah, right. See you never!");

            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue) {
                    Server.Event.setEventCompleted("FlimsyBarsDestroyed", true);
                    task.delay(1, () => {
                        simpulToOut().onComplete(() => {
                            Server.Dialogue.talk(continuation);
                        });
                    });
                }
                else if (dialogue === continuation) {
                    simpulRootPart.Anchored = true;
                    TweenService.Create(simpulRootPart, new TweenInfo(0.5), { CFrame: WAYPOINTS.LudicrousEscapeSimpulOut.CFrame.add(new Vector3(0, 150, 0)) }).Play();
                    task.delay(2, () => stage.complete());
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Help the police find and re-capture Simpul.`)
        .setNPC("Simpul")
        .setDialogue(
            new Dialogue(PoliceOfficer, "Wow, Simpul really escaped just like that.")
                .monologue("I would care more, but I don't care.")
                .root
        )
        .onStart((stage) => {
            simpulRootPart.CFrame = WAYPOINTS.LudicrousEscapeSimpulOut.CFrame.add(new Vector3(0, 150, 0));

            const ItemService = Server.Item;
            const start = new Dialogue(SlamoReceptionist, "So, about that explosion above... Simpul escaped, didn't he.")
                .monologue("Come on! What's wrong with you? Seriously, I even replaced the key with that dumb book so that you wouldn't let him loose, and yet he's now roaming around like nothing ever happened.")
                .monologue("Ugh... If you feel sorry, then help us out here. You'll need to lure him out and trap him in his own creation.")
                .monologue("You'll need some stuff for the lure. Get 5 jWood and 3 jRock from the store and head back to me. I'll put some stuff together based on some model Slamos.")
                .monologue("For the trap, I think a nice bucket of Winsome would do the trick. Just harvest 10 Winsome Specks from intruding into people's homes and taking the Winsome residue from their beds!")
                .monologue("You might need a good hoe for that, though. I bet that one weird Bacon Hair with those scraps on his table has some. Well, that's your problem, not mine. Actually, it is mine. But it's yours.")
                .root;
            const checking = new Dialogue(SlamoReceptionist, "Do you have the 5 jWood and 3 jRock?");
            const getStatue = new Dialogue(SlamoReceptionist, "Perfect. Let me just do this... and do that...")
                .monologue("Brilliant. Here it is. You'll still need the trap, though. The 10 Winsome Specks you need can be found on people's beds. Make sure to harvest them with a good hoe.")
                .root;
            const checking2 = new Dialogue(SlamoReceptionist, "Do you have the 10 Winsome Specks?");
            const fetchBucket = new Dialogue(SlamoReceptionist, "Perfect. Wait. It's not perfect. How do I make a bucket of Winsome again?")
                .monologue("Uh... uh... well. I don't really know, but maybe you can make it somehow. I don't know, are you perhaps good at crafting or something? That could help.")
                .monologue("I know one of the essential resources for a bucket of Winsome is a Skill Pod. So, here you go? I don't really need it.")
                .root;
            const checking3 = new Dialogue(SlamoReceptionist, "Do you have the bucket of Winsome?");
            const ending = new Dialogue(SlamoReceptionist, "Now that is actually perfect. Well, let's head to the village centre and try to catch that monster!");
            if (ItemService.getItemAmount(SlamoStatue.id) > 0) {
                if (ItemService.getItemAmount(WinsomeBucket.id) > 0) {
                    Server.Dialogue.talk(ending);
                }
                else {
                    Server.Dialogue.addDialogue(checking2);
                }
            }
            else {
                Server.Dialogue.addDialogue(start);
            }
            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === start) {
                    Server.Dialogue.removeDialogue(start);
                    Server.Dialogue.addDialogue(checking);
                }
                else if (dialogue === checking && ItemService.getItemAmount(Wood.id) >= 5 && ItemService.getItemAmount(Stone.id) >= 3) {
                    Server.Dialogue.talk(getStatue);
                }
                else if (dialogue === getStatue) {
                    Server.Quest.takeQuestItem(Wood.id, 5);
                    Server.Quest.takeQuestItem(Stone.id, 3);
                    Server.Quest.giveQuestItem(SlamoStatue.id, 1);
                    Server.Dialogue.removeDialogue(checking);
                    Server.Dialogue.addDialogue(checking2);
                }
                else if (dialogue === checking2 && ItemService.getItemAmount("WinsomeSpeck") >= 10) {
                    Server.Dialogue.talk(fetchBucket);
                    Server.Dialogue.removeDialogue(checking2);
                    Server.Dialogue.addDialogue(checking3);
                }
                else if (dialogue === fetchBucket) {
                    Server.Quest.giveQuestItem(SkillPod.id, 1);
                }
                else if (dialogue === checking3 && ItemService.getItemAmount(WinsomeBucket.id) >= 1) {
                    Server.Dialogue.removeDialogue(checking3);
                    Server.Dialogue.talk(ending);
                }
                else if (dialogue === ending) {
                    stage.complete();
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Lure Simpul and trap him.`)
        .setFocus(ring)
        .setNPC("Simpul")
        .setDialogue(
            new Dialogue(SlamoReceptionist, "Follow my lead.")
                .root
        )
        .onStart((stage) => {
            toggleRing(true);
            const hint = new Dialogue(SlamoReceptionist, "Come on, get in front of me and place the statue down where Simpul can easily spot it.");
            slamoReceptionistToHiding().onComplete(() => {
                Server.Dialogue.talk(
                    new Dialogue(SlamoReceptionist, "Alright. I'll stay here and hide to make sure nothing happens. You go in front and place the statue down.")
                );
            });

            let statue: Model | undefined;

            Server.Dialogue.addDialogue(hint);
            const poured = new Dialogue(EMPTY_NPC, "You pour the bucket on Simpul.");
            Simpul.onInteract(() => Server.Dialogue.talk(poured));
            const simpulSad = new Dialogue(Simpul, "This can't be... No... NOO!!!");
            let initiated = false;
            const update = (placementId: string) => {
                statue = PLACED_ITEMS_FOLDER.FindFirstChild(placementId) as Model | undefined;
                task.wait(0.5);
                if (statue === undefined || statue.Parent === undefined || initiated === true)
                    return;

                initiated = true;
                const statueCFrame = statue.GetPivot();

                simpulRootPart.CFrame = statueCFrame.add(new Vector3(0, 100, 0));
                TweenService.Create(simpulRootPart, new TweenInfo(4), { CFrame: statueCFrame.add(statueCFrame.LookVector.mul(12)).mul(CFrame.Angles(0, math.pi, 0)) }).Play();
                task.delay(1.5, () => Server.Dialogue.talk(new Dialogue(Simpul, "Oh my god... You're the perfect Slamo! Come with me, please."), false));
                task.delay(5, () => Server.Dialogue.talk(new Dialogue(SlamoReceptionist, "Alright, pour the bucket on him!"), false));
            };
            const placedItems = Server.empireData.items.worldPlaced;
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
            const connection2 = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === poured) {
                    const model = WinsomeBucket.MODEL?.Clone();
                    if (model === undefined)
                        return;
                    const bucketCFrame = simpulRootPart.CFrame.add(new Vector3(0, 4, 0));
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
                        emitEffect("ExpandingWhirls", simpulRootPart, 4);
                        model.Destroy();
                        playSoundAtPart(simpulRootPart, getSound("Splash.mp3"));
                        const trap = simpulModel.WaitForChild("Part") as BasePart;
                        trap.Transparency = 0;
                        trap.FindFirstChildOfClass("Decal")!.Transparency = 0;
                        decal.Texture = sadDecal;
                    });
                    task.delay(2.5, () => Server.Dialogue.talk(simpulSad));
                    model.Parent = Workspace;
                }
                else if (dialogue === simpulSad) {
                    const part = new Instance("Part");
                    part.Transparency = 1;
                    part.Anchored = true;
                    part.CanCollide = false;
                    part.Position = simpulRootPart.Position;
                    part.Parent = Workspace;
                    spawnExplosion(part.Position, part);
                    playSoundAtPart(part, getSound("Explosion.mp3"));
                    Server.Event.setEventCompleted("SimpulGone", true);
                }
            });
            const connection3 = Server.Event.addCompletionListener("SimpulGone", (isCompleted) => {
                if (!isCompleted)
                    return;
                slamoReceptionistToReveal();
                stage.complete();
            });
            return () => {
                connection1.disconnect();
                connection2.disconnect();
                connection3.disconnect();
            };
        })
    )
    .addStage(new Stage()
        .setDescription(`Serve justice to Simpul.`)
        .setNPC("Simpul")
        .onStart((stage) => {
            Server.Dialogue.talk(finishing);

            const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                if (dialogue === finishing) {
                    const defaultLocation = Server.NPC.State.getInfo(SlamoReceptionist)?.defaultLocation;
                    if (defaultLocation === undefined)
                        throw "Slamo Receptionist default location not found!";
                    Server.NPC.Navigation.createPathfindingOperation(
                        slamoReceptionistHumanoid,
                        slamoReceptionistRootPart.CFrame,
                        defaultLocation,
                    )();
                    toggleRing(false);
                    stage.complete();
                }
            });
            return () => connection.disconnect();
        })
    )
    .onInit(() => {
        const CurrencyService = Server.Currency;
        Server.Event.addCompletionListener("SimpulReveal", (isCompleted) => {
            if (isCompleted)
                simpulHumanoid.DisplayName = "";
        });
        Server.Event.addCompletionListener("FlimsyBarsDestroyed", (isCompleted) => {
            if (!isCompleted)
                return;

            decal.Texture = heheDecal;
            const bars = AREAS.SlamoVillage.map.WaitForChild("FlimsyBars") as Model;
            bars.PrimaryPart?.FindFirstChildOfClass("Sound")?.Play();
            spawnExplosion(bars.GetPivot().Position);
            for (const bar of bars.GetChildren()) {
                bar.Destroy();
            }
        });
        Server.Event.addCompletionListener("SimpulGone", (isCompleted) => {
            if (!isCompleted)
                return;
            simpulRootPart.CFrame = new CFrame(0, -200, 0);
        });

        const questMetadata = Server.empireData.questMetadata;

        const start = new Dialogue(Andy, `It would be great if you could help me out with harvesting these apples. Say, if you bring me 40 Apples, I'll reward you handsomely. Deal?`);
        const done = new Dialogue(Andy, "Wow! Those are some really cool looking apples. Don't mind if I do.");

        Server.Dialogue.dialogueFinished.connect((dialogue) => {
            if (dialogue === Andy.defaultDialogues[0]) {
                const last = questMetadata.get("Andy") as number | undefined;
                if (last === undefined || last + 3600 < tick()) {
                    if (Server.Quest.takeQuestItem("Apple", 40)) {
                        Server.Dialogue.talk(done);
                    }
                    else {
                        Server.Dialogue.talk(start);
                    }
                }
                else {
                    Server.Dialogue.talk(new Dialogue(Andy, "You can talk with me again in " + convertToMMSS(math.floor(((questMetadata.get("Andy") as number) ?? 0) - tick() + 3600)) + " to help me out again!"));
                }
            }
            else if (dialogue === done) {
                questMetadata.set("Andy", tick());
                const rng = math.random(1, 3);
                if (rng === 1) {
                    Server.Dialogue.talk(new Dialogue(Andy, "As your reward, here's a Funds Bomb! Enjoy!"));
                    CurrencyService.increment("Funds Bombs", new OnoeNum(1));
                }
                else if (rng === 2) {
                    const amount = Server.Reset.getResetReward(RESET_LAYERS.Skillification).div(5);
                    const skill = amount.get("Skill");
                    if (skill === undefined || skill.equals(0)) {
                        Server.Dialogue.talk(new Dialogue(Andy, "As your reward, I wanted to give you some Skill... but I'm all out. Here's some resources instead!"));
                        Server.Quest.giveQuestItem(EnchantedGrass.id, 3);
                        Server.Quest.giveQuestItem(ExcavationStone.id, 15);
                        return;
                    }

                    Server.Dialogue.talk(new Dialogue(Andy, "As your reward, I gave you a bit of my Skill. Hopefully, it'll help you out!"));
                    CurrencyService.incrementAll(amount.amountPerCurrency);
                }
                else if (rng === 3) {
                    Server.Dialogue.talk(new Dialogue(Andy, "As your reward, I gave you some pretty cool resources. Use them wisely!"));
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