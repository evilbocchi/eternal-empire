import Chuck from "server/interactive/npc/Chuck";
import { Dialogue } from "server/interactive/npc/NPC";
import Ricarg from "server/interactive/npc/Ricarg";
import EarningCapital from "server/quests/EarningCapital";
import Quest, { Stage } from "server/quests/Quest";
import { WAYPOINTS } from "shared/constants";
import { Server } from "shared/api/APIExpose";
import Shop from "shared/item/traits/Shop";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";
import Grass from "shared/items/excavation/harvestable/Grass";
import Wool from "shared/items/negative/a/Wool";
import IndustrialOverpass from "shared/items/negative/exist/IndustrialOverpass";
import LegPoweredDropper from "shared/items/negative/felixthea/LegPoweredDropper";
import LimitBreaker from "shared/items/negative/friendliness/LimitBreaker";
import Lamp from "shared/items/negative/negativity/Lamp";
import CraftingTable from "shared/items/negative/tfd/CraftingTable";
import OverengineeredGenerator from "shared/items/negative/trueease/OverengineeredGenerator";

const craftingTableModel = WAYPOINTS.CraftingTable;

const chuckToCraftingTable = Chuck.createPathfindingOperation(
    Chuck.startingCFrame,
    WAYPOINTS.CraftingManiaChuckCraftingAssistance.CFrame,
);

export = new Quest(script.Name)
    .setName("Crafting Introductions")
    .setLength(1)
    .setLevel(3)
    .setOrder(6)
    .addStage(
        new Stage()
            .setDescription(`Wake up the blacksmith at %coords%.`)
            .setNPC(Chuck, true)
            .setDialogue(
                new Dialogue(Chuck, "zzz... zzzzz.... zzzzzzz...").monologue("...can you not disturb my sleep.").root,
            )
            .onReached((stage) => {
                Chuck.playAnimation("Default");
                Chuck.rootPart!.CFrame = Chuck.startingCFrame;

                const continuation = new Dialogue(Chuck, "So, you want to craft something?")
                    .monologue(
                        "That's surprising... Most people nowadays simply avoid what they call a 'primitive' method of creating items.",
                    )
                    .monologue("They get on my nerves, those stinking scientists. Thinking they're better than us.")
                    .monologue(
                        "With that said, I'd love to get you started on crafting, but I need some resources from you to get ready.",
                    )
                    .monologue(
                        `What, you thought I was rich or something? Just because I keep my ${CraftingTable.name} clean doesn't mean anything, you know.`,
                    )
                    .monologue(
                        `Anyways, get me a ${Wool.id} and 3 ${Grass.id}. The wool you can get from that stinking shopkeeper, and the grass... uh...`,
                    )
                    .monologue(
                        `Well, you can ask Ricarg how to harvest ${Grass.id}. I don't really know why he collects so many tools, but he probably knows the ins and outs of that stuff.`,
                    )
                    .monologue("I'll be waiting for you. Now, hurry!").root;

                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === stage.dialogue) {
                        Chuck.stopAnimation("Default");
                        task.wait(1);
                        continuation.talk();
                    } else if (dialogue === continuation) {
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(
                `Collect 1 ${Wool.id} and 3 ${Grass.id}. Ask Ricarg how to collect the grass. Return to the blacksmith with the resources.`,
            )
            .setNPC(Ricarg, true)
            .setDialogue(new Dialogue(Chuck, "You got the stuff?"))
            .onReached((stage) => {
                Chuck.stopAnimation("Default");
                Chuck.rootPart!.CFrame = Chuck.startingCFrame;

                const ItemService = Server.Item;
                const ricargDialogue = new Dialogue(Ricarg, "Hahah... money... haah...").monologue(
                    "Wait, who are you again?",
                ).root;
                ricargDialogue.add(69);
                const noHelped = new Dialogue(
                    Ricarg,
                    "I don't really remember, but that weird blacksmith Noob referred me, didn't he?",
                )
                    .monologue(
                        "Well, if you're looking for tools, just ask me anytime. Though... if you can in the future, spare me $10K? Haha, nevermind...",
                    )
                    .monologue(
                        `You're gonna need a Scythe in order to cut some ${Grass.id}. You can find ${Grass.id} all over this area, but the Scythe is something you'll need to get from me. I'm the only one who sells those kinds of things here, unfortunately.`,
                    ).root;
                const helped = new Dialogue(
                    Ricarg,
                    `Oh, you're the guy who gave me money! Really, thank you so much. I could buy so much ${Grass.id} because of that!`,
                )
                    .monologue(
                        `You want to learn how to get ${Grass.id} yourself? Well, that's kind of difficult... the merchant left for Sky Pavilion quite a while ago.`,
                    )
                    .monologue(
                        "You'll need to harvest it yourself with a Scythe. Luckily, I actually have some with me! I'll even give them to you for cheap.",
                    ).root;

                const noItemed = new Dialogue(Chuck, `I need a ${Wool.id} and 3 ${Grass.id}.`);
                const itemed = new Dialogue(
                    Chuck,
                    "Good job. You don't look like much, but clearly you tell me otherwise.",
                ).monologue(
                    "Alright, thanks for getting me my groceries. It's about time I taught you something. Come with me.",
                ).root;
                const shopOpen = new Dialogue(
                    Ricarg,
                    "Here's what I have on me right now. You'll need to procure your own stuff for the more valuable tools.",
                );
                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === ricargDialogue) {
                        ricargDialogue.remove();
                        (EarningCapital.completed ? helped : noHelped).talk();
                    } else if (dialogue === noHelped || dialogue === helped) {
                        shopOpen.add();
                        shopOpen.talk();
                    } else if (dialogue === stage.dialogue) {
                        (ItemService.getItemAmount(Wool.id) >= 1 && ItemService.getItemAmount(Grass.id) >= 3
                            ? itemed
                            : noItemed
                        ).talk();
                    } else if (
                        dialogue === itemed &&
                        Server.Quest.takeQuestItem(Wool.id, 1) &&
                        Server.Quest.takeQuestItem(Grass.id, 3)
                    ) {
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Head to the Crafting Table at %coords% with the blacksmith.`)
            .setNPC(Chuck)
            .setFocus(craftingTableModel)
            .setDialogue(new Dialogue(Chuck, "Come with me."))
            .onReached((stage) => {
                Chuck.stopAnimation("Default");
                Chuck.rootPart!.Anchored = false;

                chuckToCraftingTable().onComplete(() => stage.complete());
                return () => {};
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Learn how to craft from the blacksmith.`)
            .setNPC(Chuck)
            .setFocus(craftingTableModel)
            .setDialogue(
                new Dialogue(Chuck, "Here we are.")
                    .monologue("My Crafting Table isn't much, but it gets the job done.")
                    .monologue("I'll give you some resources. Go ahead and craft something. Let's see what you can do.")
                    .root,
            )
            .onReached((stage) => {
                Chuck.stopAnimation("Default");
                Chuck.rootPart!.CFrame = WAYPOINTS.CraftingManiaChuckCraftingAssistance.CFrame;

                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === stage.dialogue) {
                        Server.Quest.giveQuestItem(ExcavationStone.id, 50);
                        Server.Quest.giveQuestItem(WhiteGem.id, 15);
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Craft something with the items you were given.`)
            .setFocus(craftingTableModel)
            .setDialogue(new Dialogue(Chuck, "Let's see what you're capable of."))
            .onReached((stage) => {
                Chuck.stopAnimation("Default");
                Chuck.rootPart!.CFrame = WAYPOINTS.CraftingManiaChuckCraftingAssistance.CFrame;

                const connection = Server.Item.itemsBought.connect((_player, items) => {
                    for (const item of items) {
                        const craftingItems = CraftingTable.trait(Shop).items;

                        if (craftingItems.includes(item)) {
                            stage.complete();
                        }
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Show the blacksmith what you crafted.`)
            .setNPC(Chuck)
            .setFocus(WAYPOINTS.CraftingManiaChuckCraftingAssistance)
            .setDialogue(new Dialogue(Chuck, "Hmm... Let's see..."))
            .onReached((stage) => {
                const ItemService = Server.Item;
                Chuck.stopAnimation("Default");
                Chuck.rootPart!.CFrame = WAYPOINTS.CraftingManiaChuckCraftingAssistance.CFrame;

                let continuation: Dialogue;
                if (ItemService.getBoughtAmount(Lamp.id) > 0)
                    continuation = new Dialogue(Chuck, "You made a high-luminosity lamp!").monologue(
                        "How much did you hate the night?",
                    ).root;
                else if (ItemService.getBoughtAmount(OverengineeredGenerator.id) > 0)
                    continuation = new Dialogue(Chuck, "You made a really massive generator!").monologue(
                        "Were you that starved for Power?",
                    ).root;
                else if (ItemService.getBoughtAmount(LegPoweredDropper.id) > 0)
                    continuation = new Dialogue(Chuck, "You made a dropper attached to a treadmill!").monologue(
                        "Why? Why do you want to torture yourself?",
                    ).root;
                else if (ItemService.getBoughtAmount(IndustrialOverpass.id) > 0)
                    continuation = new Dialogue(Chuck, "You made an unnecessarily intricated upgrader!").monologue(
                        "Do you love rearranging your setup that much?",
                    ).root;
                else if (ItemService.getBoughtAmount(LimitBreaker.id) > 0)
                    continuation = new Dialogue(Chuck, "You made a space-intrusive instantiation delimiter!").monologue(
                        "You really have that much space, huh?",
                    ).root;
                else continuation = new Dialogue(Chuck, "You made... something.");

                continuation = continuation
                    .monologue("Well, let's throw that aside. Nice crafting skills you got there!")
                    .monologue("Though, this is just the basics of crafting. There is still so much you can do.")
                    .monologue(
                        "I'm excited to see what you can craft in the future. You should find a better Crafting Table and work your way up.",
                    )
                    .monologue("I won't charge you for those resources, so enjoy!").root;
                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === stage.dialogue) {
                        continuation.talk();
                    } else if (dialogue === continuation) {
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .setCompletionDialogue(
        new Dialogue(Chuck, `You can use my ${CraftingTable.name} whenever you like. Just don't disturb my sleep.`),
    )
    .setReward({
        xp: 170,
    });
