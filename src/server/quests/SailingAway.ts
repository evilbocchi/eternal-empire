import { Dialogue } from "server/npc/NPC";
import CaptainBacon from "server/npc/Captain Bacon";
import OldNoob from "server/npc/Old Noob";
import Prest from "server/npc/Prest";
import Tria from "server/npc/Tria";
import Quest, { Stage } from "server/quests/Quest";
import { Server } from "shared/item/ItemUtils";

export = new Quest(script.Name)
    .setName("Sailing Away")
    .setLength(1)
    .setLevel(7)
    .setOrder(1)
    .addStage(
        new Stage()
            .setDescription(`Meet Captain Bacon at %coords%.`)
            .setNPC(CaptainBacon, true)
            .setDialogue(
                new Dialogue(CaptainBacon, "Welcome aboard my glorious ship, stranger!")
                    .monologue(
                        "Let's go far and wide across the world and search for hidden treasures that will make us rich!",
                    )
                    .monologue("At least, we could, if we had a map.")
                    .monologue("Why don't you get my map for me first? It's at... uh... where is it, again?").root,
            )
            .onReached((stage) => {
                const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                    if (dialogue === stage.dialogue) {
                        stage.complete();
                    }
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Ask around for Captain Bacon's map.`)
            .setDialogue(new Dialogue(CaptainBacon, "My map is at... uh... uhhh..."))
            .onReached((stage) => {
                const triaActivation = new Dialogue(
                    Tria,
                    "Uh... so... I found this thing... I think it belongs to... um... someone important?",
                )
                    .monologue(
                        "I didn't mean to... I just... I was trying to put it somewhere safe... and now... it's gone.",
                    )
                    .monologue(
                        "...I-I don't know what to do... I can't just leave it missing... someone's going to be mad at me...",
                    )
                    .monologue("Maybe... maybe you can... I mean, if you want, you could... help me find it?")
                    .monologue(
                        "Please... I don't want to get in trouble. I-I'm really bad at... adventure stuff...",
                    ).root;

                const redHerrings = [
                    new Dialogue(
                        OldNoob,
                        "Captain Bacon's been complaining about having lost his map lately.",
                    ).monologue("I haven't seen it around here, though.").root,
                    new Dialogue(Prest, "Map? Whose? I haven't seen any sort of map around this place at all.")
                        .monologue("I've also been trying to help him out, but it's nowhere near here.")
                        .monologue("Maybe check other places? And try asking other people.").root,
                ];
                Server.Dialogue.addDialogue(triaActivation);
                for (const dialogue of redHerrings) Server.Dialogue.addDialogue(dialogue);

                const connection = Server.Dialogue.dialogueFinished.connect((dialogue) => {
                    if (dialogue === triaActivation) {
                        stage.complete();
                    }
                });
                return () => {
                    Server.Dialogue.removeDialogue(triaActivation);
                    for (const dialogue of redHerrings) Server.Dialogue.removeDialogue(dialogue);
                    connection.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Find Captain Bacon's map with Tria.`)
            .setDialogue(
                new Dialogue(CaptainBacon, "My map is at... uh... uhhh...").next(
                    new Dialogue(Tria, "I... I'm really sorry... I just wanted to help... I think..."),
                ).root,
            )
            .onReached((stage) => {
                return () => {};
            }),
    )
    .setReward({
        xp: 600,
    });
