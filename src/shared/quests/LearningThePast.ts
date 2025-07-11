import InteractableObject from "shared/InteractableObject";
import { Dialogue } from "shared/NPC";
import Quest, { Stage } from "shared/Quest";
import { getWaypoint } from "shared/constants";
import Librarian from "shared/npcs/Librarian";
import LibraryNoob1 from "shared/npcs/Library Noob 1";
import LibraryNoob2 from "shared/npcs/Library Noob 2";
import OldNoob from "shared/npcs/Old Noob";
import Shopkeeper2 from "shared/npcs/Shopkeeper 2";

export = new Quest("LearningThePast")
.setName("Learning The Past")
.setLength(2)
.setLevel(999)
.setOrder(7)
.addStage(new Stage()
    .setDescription("Talk to %npc% at %coords%.")
    .setNPC("Old Noob", true)
    .setDialogue(new Dialogue(OldNoob, "Just sit back and relax...")
        .monologue("You want to learn about the history of the Barren Islands, huh? It's quite a tale.")
        .monologue("It's been so long- the catastrophe that reduced the great 'Miner Haven' to this state.")
        .monologue("I'll spare you the details for now, but if you're truly curious and want to delve deeper into the history, you should head to the library.")
        .root
    )
    .onStart((utils, stage) => {
        const connection = utils.dialogueFinished.connect((dialogue) => {
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
    .onStart((utils, stage) => {
        const connection = utils.dialogueFinished.connect((dialogue) => {
            if (dialogue === InteractableObject.OldBooks1.dialogue) {
                stage.completed.fire();
            }
        });
        return () => connection.disconnect();
    })
)
.addStage(new Stage()
    .setDescription("Ask around the library for clues about the 'strike'.")
    .onStart((utils, stage) => {
        const shopkeeperDialogue = new Dialogue(Shopkeeper2, "Yahallo! ...You want that shiny green orb behind me?")
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
        .monologue("Here's a key that'll let you enter a specific hideout.")
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
        const connection = utils.balanceChanged.connect((balance) => {
            
        });
        return () => connection.disconnect();
    })
)
.setReward({
    xp: 300
});