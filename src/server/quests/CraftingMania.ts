import Difficulty from "@antivivi/jjt-difficulties";
import Quest, { Stage } from "server/Quest";
import EarningCapital from "server/quests/EarningCapital";
import { Dialogue } from "shared/NPC";
import { getNPCModel, getWaypoint, WAYPOINTS } from "shared/constants";
import { GameUtils } from "shared/item/ItemUtils";
import Shop from "shared/item/traits/Shop";
import Items from "shared/items/Items";
import CraftingTable from "shared/items/bonuses/CraftingTable";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";
import IndustrialOverpass from "shared/items/miscellaneous/IndustrialOverpass";
import Lamp from "shared/items/miscellaneous/Lamp";
import LegPoweredDropper from "shared/items/miscellaneous/LegPoweredDropper";
import LimitBreaker from "shared/items/miscellaneous/LimitBreaker";
import OverengineeredGenerator from "shared/items/miscellaneous/OverengineeredGenerator";
import Wool from "shared/items/miscellaneous/Wool";
import Chuck from "shared/npcs/Chuck";
import Ricarg from "shared/npcs/Ricarg";

const waypoint2 = getWaypoint("CraftingMania2");
const craftingTableModel = WAYPOINTS.WaitForChild("CraftingTable")!;
const chuckModel = getNPCModel("Chuck");
const chuckHumanoid = chuckModel.FindFirstChildOfClass("Humanoid")!;
const chuckRootPart = chuckHumanoid.RootPart!;
const Grass = Items.getItem("Grass")!;

export = new Quest(script.Name)
    .setName("Crafting Introductions")
    .setLength(1)
    .setLevel(3)
    .setOrder(6)
    .addStage(new Stage()
        .setDescription(`Wake up the blacksmith at %coords%.`)
        .setNPC("Chuck", true)
        .setDialogue(
            new Dialogue(Chuck, "zzz... zzzzz.... zzzzzzz...")
                .monologue("...can you not disturb my sleep.")
                .root
        )
        .onStart((stage) => {
            chuckRootPart.Position = stage.position!;
            const continuation = new Dialogue(Chuck, "So, you want to craft something?")
                .monologue("That's surprising... Most people nowadays simply avoid what they call a 'primitive' method of creating items.")
                .monologue("They get on my nerves, those stinking scientists. Thinking they're better than us.")
                .monologue("With that said, I'd love to get you started on crafting, but I need some resources from you to get ready.")
                .monologue(`What, you thought I was rich or something? Just because I keep my ${CraftingTable.name} clean doesn't mean anything, you know.`)
                .monologue(`Anyways, get me a ${Wool.id} and 3 ${Grass.id}. The wool you can get from that stinking shopkeeper, and the grass... uh...`)
                .monologue(`Well, you can ask Ricarg how to harvest ${Grass.id}. I don't really know why he collects so many tools, but he probably knows the ins and outs of that stuff.`)
                .monologue("I'll be waiting for you. Now, hurry!")
                .root;

            const connection = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue) {
                    GameUtils.stopNPCAnimation(Chuck, "Default");
                    task.wait(1);
                    GameUtils.talk(continuation);
                }
                else if (dialogue === continuation) {
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Collect 1 ${Wool.id} and 3 ${Grass.id}. Ask Ricarg how to collect the grass. Return to the blacksmith with the resources.`)
        .setNPC("Ricarg", true)
        .setDialogue(
            new Dialogue(Chuck, "You got the stuff?")
        )
        .onStart((stage) => {
            const ItemsService = GameUtils.itemsService;
            const ricargDialogue = new Dialogue(Ricarg, "Hahah... money... haah...")
                .monologue("Wait, who are you again?")
                .root;
            GameUtils.addDialogue(ricargDialogue, 69);
            const noHelped = new Dialogue(Ricarg, "I don't really remember, but that weird blacksmith Noob referred me, didn't he?")
                .monologue("Well, if you're looking for tools, just ask me anytime. Though... if you can in the future, spare me $10K? Haha, nevermind...")
                .monologue(`You're gonna need a Scythe in order to cut some ${Grass.id}. You can find ${Grass.id} all over this area, but the Scythe is something you'll need to get from me. I'm the only one who sells those kinds of things here, unfortunately.`)
                .root;
            const helped = new Dialogue(Ricarg, `Oh, you're the guy who gave me money! Really, thank you so much. I could buy so much ${Grass.id} because of that!`)
                .monologue(`You want to learn how to get ${Grass.id} yourself? Well, that's kind of difficult... the merchant left for Sky Pavilion quite a while ago.`)
                .monologue("You'll need to harvest it yourself with a Scythe. Luckily, I actually have some with me! I'll even give them to you for cheap.");

            const noItemed = new Dialogue(Chuck, `I need a ${Wool.id} and 3 ${Grass.id}.`);
            const itemed = new Dialogue(Chuck, "Good job. You don't look like much, but clearly you tell me otherwise.")
                .monologue("Alright, thanks for getting me my groceries. It's about time I taught you something. Come with me.")
                .root;
            const shopOpen = new Dialogue(Ricarg, "Here's what I have on me right now. You'll need to procure your own stuff for the more valuable tools.");
            const connection = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue === ricargDialogue) {
                    GameUtils.removeDialogue(ricargDialogue);
                    GameUtils.talk(GameUtils.isQuestCompleted(EarningCapital.id) === true ? helped : noHelped);
                }
                else if (dialogue === noHelped || dialogue === helped) {
                    GameUtils.addDialogue(shopOpen);
                    GameUtils.talk(shopOpen);
                }
                else if (dialogue === stage.dialogue) {
                    GameUtils.talk(ItemsService.getItemAmount(Wool.id) >= 1 && ItemsService.getItemAmount(Grass.id) >= 3 ? itemed : noItemed);
                }
                else if (dialogue === itemed && GameUtils.takeQuestItem(Wool.id, 1) && GameUtils.takeQuestItem(Grass.id, 3)) {
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        })

    )
    .addStage(new Stage()
        .setDescription(`Head to the Crafting Table at %coords% with the blacksmith.`)
        .setNPC("Chuck")
        .setFocus(craftingTableModel)
        .setDialogue(
            new Dialogue(Chuck, "Come with me.")
        )
        .onStart((stage) => {
            GameUtils.stopNPCAnimation(Chuck, "Default");
            chuckRootPart.Anchored = false;
            const connection = GameUtils.leadToPoint(chuckHumanoid, waypoint2.CFrame, () => stage.completed.fire());
            return () => connection.Disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Learn how to craft from the blacksmith.`)
        .setNPC("Chuck")
        .setFocus(craftingTableModel)
        .setDialogue(
            new Dialogue(Chuck, "Here we are.")
                .monologue("My Crafting Table isn't much, but it gets the job done.")
                .monologue("I'll give you some resources. Go ahead and craft something. Let's see what you can do.")
        )
        .onStart((stage) => {
            GameUtils.stopNPCAnimation(Chuck, "Default");
            chuckRootPart.CFrame = waypoint2.CFrame;
            const connection = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue) {
                    GameUtils.giveQuestItem(ExcavationStone.id, 50);
                    GameUtils.giveQuestItem(WhiteGem.id, 15);
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Craft something with the items you were given.`)
        .setFocus(craftingTableModel)
        .setDialogue(
            new Dialogue(Chuck, "Let's see what you're capable of.")
        )
        .onStart((stage) => {
            GameUtils.stopNPCAnimation(Chuck, "Default");
            chuckRootPart.CFrame = waypoint2.CFrame;
            const connection = GameUtils.itemsService.itemsBought.connect((_player, items) => {
                for (const item of items) {
                    const craftingItems = CraftingTable.trait(Shop).items;

                    if (item.difficulty === Difficulty.Miscellaneous && craftingItems.includes(item)) {
                        stage.completed.fire();
                    }
                }
            });
            return () => connection.disconnect();
        })
    )
    .addStage(new Stage()
        .setDescription(`Show the blacksmith what you crafted.`)
        .setNPC("Chuck")
        .setFocus(waypoint2)
        .setDialogue(
            new Dialogue(Chuck, "Hmm... Let's see...")
        )
        .onStart((stage) => {
            const ItemsService = GameUtils.itemsService;
            GameUtils.stopNPCAnimation(Chuck, "Default");
            chuckRootPart.CFrame = waypoint2.CFrame;

            let continuation: Dialogue;
            if (ItemsService.getBoughtAmount(Lamp.id) > 0)
                continuation = new Dialogue(Chuck, "You made a high-luminosity lamp!")
                    .monologue("How much did you hate the night?")
                    .root;
            else if (ItemsService.getBoughtAmount(OverengineeredGenerator.id) > 0)
                continuation = new Dialogue(Chuck, "You made a really massive generator!")
                    .monologue("Were you that starved for Power?")
                    .root;
            else if (ItemsService.getBoughtAmount(LegPoweredDropper.id) > 0)
                continuation = new Dialogue(Chuck, "You made a dropper attached to a treadmill!")
                    .monologue("Why? Why do you want to torture yourself?")
                    .root;
            else if (ItemsService.getBoughtAmount(IndustrialOverpass.id) > 0)
                continuation = new Dialogue(Chuck, "You made an unnecessarily intricated upgrader!")
                    .monologue("Do you love rearranging your setup that much?")
                    .root;
            else if (ItemsService.getBoughtAmount(LimitBreaker.id) > 0)
                continuation = new Dialogue(Chuck, "You made a space-intrusive instantiation delimiter!")
                    .monologue("You really have that much space, huh?")
                    .root;
            else
                continuation = new Dialogue(Chuck, "You made... something.");

            continuation = continuation.monologue("Well, let's throw that aside. Nice crafting skills you got there!")
                .monologue("Though, this is just the basics of crafting. There is still so much you can do.")
                .monologue("I'm excited to see what you can craft in the future. You should find a better Crafting Table and work your way up.")
                .monologue("I won't charge you for those resources, so enjoy!")
                .root;
            const connection = GameUtils.dialogueFinished.connect((dialogue) => {
                if (dialogue === stage.dialogue) {
                    GameUtils.talk(continuation);
                }
                else if (dialogue === continuation) {
                    stage.completed.fire();
                }
            });
            return () => connection.disconnect();
        })
    )
    .setCompletionDialogue(new Dialogue(Chuck, `You can use my ${CraftingTable.name} whenever you like. Just don't disturb my sleep.`))
    .setReward({
        xp: 170
    });