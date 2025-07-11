import Quest, { Stage } from "server/Quest";
import { Dialogue } from "shared/NPC";
import CaptainBacon from "shared/npcs/Captain Bacon";
import Prest from "shared/npcs/Prest";
import Tria from "shared/npcs/Tria";
import { GameUtils } from "shared/utils/ItemUtils";


export = new Quest(script.Name)
    .setName("Sailing Away")
    .setLength(1)
    .setLevel(999)
    .setOrder(1)
    .addStage(new Stage()
        .setDescription(`Meet %npc% at %coords%.`)
        .setNPC("Captain Bacon", true)
        .setDialogue(new Dialogue(CaptainBacon, "Welcome aboard my glorious ship, stranger!")
            .monologue("Let's go far and wide across the world and search for hidden treasures that will make us rich!")
            .monologue("At least, we could, if we had a map.")
            .monologue("Why don't you find my map for me first? It's at... uh... where is it, again?")
            .monologue("")
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
        .setDescription(`Find %npc%'s map.`)
        .setNPC("Captain Bacon")
        .setDialogue(new Dialogue(CaptainBacon, "Have you found my map yet?"))
        .onStart((stage) => {
            const dialogues = [
                new Dialogue(Tria, "Captain Bacon's been complaining about having lost his map lately.")
                    .monologue("I've also been trying to help him out, but it's nowhere near here.")
                    .monologue("Maybe check other places? And try asking other people.")
                    .root,
                new Dialogue(Prest, "I haven't seen any sort of map around this place at all. For all we know, it could")
                    .monologue("I've also been trying to help him out, but it's nowhere near here.")
                    .monologue("Maybe check other places? And try asking other people.")
                    .root,
            ];
            for (const dialogue of dialogues)
                GameUtils.addDialogue(dialogue);
            stage.completed.once(() => {
                for (const dialogue of dialogues)
                    GameUtils.removeDialogue(dialogue);
            });
            const connection = GameUtils.dialogueFinished.connect((dialogue) => {

            });
            return () => connection.disconnect();
        })
    )
    .onInit((utils) => {

    })
    .setReward({
        xp: 600
    });