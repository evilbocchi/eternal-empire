import Difficulty from "shared/Difficulty";
import { Dialogue } from "shared/NPC";
import Quest, { Stage } from "shared/Quest";
import { AREAS, getDisplayName, getNPCModel, getNPCPosition, getWaypoint } from "shared/constants";
import CraftingTable from "shared/items/bonuses/CraftingTable";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";
import IndustrialOverpass from "shared/items/miscellaneous/IndustrialOverpass";
import Lamp from "shared/items/miscellaneous/Lamp";
import LimitBreaker from "shared/items/miscellaneous/LimitBreaker";
import OverengineeredGenerator from "shared/items/miscellaneous/OverengineeredGenerator";
import Chuck from "shared/npcs/Chuck";

const waypoint2 = getWaypoint("CraftingMania2");
const craftingTable = AREAS.BarrenIslands.map.WaitForChild("CraftingTable") as BasePart;
const chuckModel = getNPCModel("Chuck");
const chuckHumanoid = chuckModel.FindFirstChildOfClass("Humanoid")!;
const chuckRootPart = chuckHumanoid.RootPart!;

export = new Quest(script.Name)
.setName("Crafting Introductions")
.setLength(1)
.setLevel(3)
.setOrder(6)
.addStage(new Stage()
    .setDescription(`Wake up the %npc% at %coords%.`)
    .setNPC("Chuck", true)
    .setDialogue(
        new Dialogue(Chuck, "zzz... zzzzz.... zzzzzzz...")
        .monologue("...can you not disturb my sleep.")
        .root
    )
    .onStart((utils, stage) => {
        chuckRootPart.Position = stage.position!;
        const continuation = new Dialogue(Chuck, "So, you want to craft something?")
            .monologue("That's surprising... Most people nowadays simply avoid what they call a 'primitive' method of creating items.")
            .monologue("They get on my nerves, those stinking scientists. Thinking they're better than us.")
            .monologue("Crafting still has its benefits. Come with me. I'll show you the ropes.")
            .root;

        const connection = utils.dialogueFinished.connect((dialogue) => {
            if (dialogue === stage.dialogue) {
                utils.stopNPCAnimation(Chuck, "Default");
                task.wait(1);
                utils.talk(continuation);
            }
            else if (dialogue === continuation) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.addStage(new Stage()
    .setDescription(`Head to the Crafting Table at %coords% with the %npc%.`)
    .setNPC("Chuck")
    .setFocus(craftingTable)
    .setDialogue(
        new Dialogue(Chuck, "Come with me.")
    )
    .onStart((utils, stage) => {
        utils.stopNPCAnimation(Chuck, "Default");
        chuckRootPart.Anchored = false;
        const connection = utils.leadToPoint(chuckHumanoid, waypoint2.CFrame, () => stage.completed.fire());
        return () => connection.Disconnect();
    })
)
.addStage(new Stage()
    .setDescription(`Learn how to craft from the %npc%.`)
    .setNPC("Chuck")
    .setFocus(craftingTable)
    .setDialogue(
        new Dialogue(Chuck, "Here we are.")
        .monologue("My Crafting Table isn't much, but it gets the job done.")
        .monologue("I'll give you some resources. Go ahead and craft something. Let's see what you can do.")
    )
    .onStart((utils, stage) => {
        utils.stopNPCAnimation(Chuck, "Default");
        chuckRootPart.CFrame = waypoint2.CFrame;
        const connection = utils.dialogueFinished.connect((dialogue) => {
            if (dialogue === stage.dialogue) {
                utils.giveQuestItem(ExcavationStone.id, 50);
                utils.giveQuestItem(WhiteGem.id, 15);
                stage.completed.fire();
            }
        })
        return () => connection.disconnect();
    })
)
.addStage(new Stage()
    .setDescription(`Craft something with the items you were given.`)
    .setFocus(craftingTable)
    .setDialogue(
        new Dialogue(Chuck, "Let's see what you're capable of.")
    )
    .onStart((utils, stage) => {
        utils.stopNPCAnimation(Chuck, "Default");
        chuckRootPart.CFrame = waypoint2.CFrame;
        const connection = utils.itemsBought.connect((_player, items) => {
            for (const item of items) {
                if (item.difficulty === Difficulty.Miscellaneous && CraftingTable.items.includes(item)) {
                    stage.completed.fire();
                }
            }
        })
        return () => connection.disconnect();
    })
)
.addStage(new Stage()
    .setDescription(`Show %npc% what you crafted.`)
    .setNPC("Chuck")
    .setFocus(waypoint2)
    .setDialogue(
        new Dialogue(Chuck, "Hmm... Let's see...")
    )
    .onStart((utils, stage) => {
        utils.stopNPCAnimation(Chuck, "Default");
        chuckRootPart.CFrame = waypoint2.CFrame;

        let continuation: Dialogue;
        if (utils.getBoughtAmount(Lamp.id) > 0)
            continuation = new Dialogue(Chuck, "You made a high-luminosity lamp!")
            .monologue("How much did you hate the night?")
            .root;
        else if (utils.getBoughtAmount(OverengineeredGenerator.id) > 0)
            continuation = new Dialogue(Chuck, "You made a really massive generator!")
            .monologue("Were you that starved for Power?")
            .root;
        else if (utils.getBoughtAmount(IndustrialOverpass.id) > 0)
            continuation = new Dialogue(Chuck, "You made an unnecessarily intricated upgrader!")
            .monologue("Do you love rearranging your setup that much?")
            .root;
        else if (utils.getBoughtAmount(LimitBreaker.id) > 0)
            continuation = new Dialogue(Chuck, "You made a space-intrusive instantiation delimiter!")
            .monologue("You really have that much space, huh?")
            .root;
        else 
            continuation = new Dialogue(Chuck, "You made... nothing?");

        continuation = continuation.monologue("Well, let's throw that aside. Nice crafting skills you got there!")
            .monologue("Though, this is just the basics of crafting. There is still so much you can do.")
            .monologue("I'm excited to see what you can craft in the future. You should find a better Crafting Table and work your way up.")
            .monologue("I won't charge you for those resources, so enjoy!")
            .root;
        const connection = utils.dialogueFinished.connect((dialogue) => {
            if (dialogue === stage.dialogue) {
                utils.talk(continuation);
            }
            else if (dialogue === continuation) {
                stage.completed.fire();
            }
        })
        return () => connection.disconnect();
    })
)
.setReward({
    xp: 170
});