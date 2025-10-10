import { Dialogue } from "server/interactive/npc/NPC";
import CaptainBacon from "server/interactive/npc/Captain Bacon";
import OldNoob from "server/interactive/npc/Old Noob";
import Prest from "server/interactive/npc/Prest";
import Tria from "server/interactive/npc/Tria";
import Quest, { Stage } from "server/quests/Quest";
import { Server } from "shared/api/APIExpose";
import Packets from "shared/Packets";

// Generate a random sequence for the pillar puzzle
function generatePuzzleSequence(length: number): number[] {
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) {
        sequence.push(math.random(0, 3));
    }
    return sequence;
}

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
                const connection = stage.dialogue!.finished.connect(() => {
                    stage.complete();
                });
                return () => connection.Disconnect();
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
                triaActivation.add();
                for (const dialogue of redHerrings) dialogue.add();

                const connection = triaActivation.finished.connect(() => {
                    stage.complete();
                });
                return () => {
                    triaActivation.remove();
                    for (const dialogue of redHerrings) dialogue.remove();
                    connection.Disconnect();
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
                const triaReveal = new Dialogue(
                    Tria,
                    "Oh! Um... I... I remember now... I think I... I hid it in one of the pillars?",
                )
                    .monologue("Like... I wanted to keep it safe... but now I can't remember which one... ugh...")
                    .monologue(
                        "There's like... four pillars near the spawn? Maybe... if you check them... you'll find it?",
                    )
                    .monologue(
                        "I'm so sorry... I know this is weird... I just... I panic and hide things sometimes... it's a whole thing...",
                    ).root;

                triaReveal.add();
                const connection = triaReveal.finished.connect(() => {
                    stage.complete();
                });
                return () => {
                    triaReveal.remove();
                    connection.Disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Find the correct pillar and solve the puzzle.`)
            .setDialogue(
                new Dialogue(Tria, "I... I think it's one of those pillars... just... try clicking on them? Maybe?")
                    .root,
            )
            .onReached((stage) => {
                // Generate puzzle sequence
                const puzzleSequence = generatePuzzleSequence(4);
                let puzzleSolved = false;

                // Listen for pillar interactions
                Packets.startPillarPuzzle.fromClient((player, pillarNumber) => {
                    if (puzzleSolved) return;

                    // Show the puzzle
                    Packets.pillarPuzzleVisible.setFor(player, true);
                    Packets.pillarPuzzleSequence.setFor(player, puzzleSequence);
                });

                // Listen for puzzle submission
                Packets.submitPuzzleAnswer.fromClient((player, answer) => {
                    if (puzzleSolved) return false;

                    // Check if answer matches
                    let correct = answer.size() === puzzleSequence.size();
                    if (correct) {
                        for (let i = 0; i < answer.size(); i++) {
                            if (answer[i] !== puzzleSequence[i]) {
                                correct = false;
                                break;
                            }
                        }
                    }

                    if (correct) {
                        puzzleSolved = true;
                        Packets.pillarPuzzleVisible.setFor(player, false);
                        stage.complete();
                        return true;
                    }
                    return false;
                });

                return () => {};
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Return the map to Captain Bacon.`)
            .setNPC(CaptainBacon, true)
            .setDialogue(
                new Dialogue(CaptainBacon, "You found it! My precious map! Now we can finally set sail!")
                    .monologue("Gather 'round, everyone! We're going on an adventure!")
                    .next(
                        new Dialogue(
                            Tria,
                            "Wait... I'm... I'm coming too? Like... on the actual boat? I... I don't know if...",
                        ).monologue(
                            "I mean... I've never really... left the island before... this is... um... a lot...",
                        ),
                    )
                    .next(
                        new Dialogue(CaptainBacon, "Of course you're coming! You found the map, didn't you?")
                            .monologue("Now let's set sail to fortune and glory!")
                            .monologue("Full speed ahead!"),
                    ).root,
            )
            .onReached((stage) => {
                const connection = stage.dialogue!.finished.connect(() => {
                    stage.complete();
                });
                return () => connection.Disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Survive the voyage...`)
            .setDialogue(
                new Dialogue(
                    Tria,
                    "Um... is the ship supposed to be... making that sound? That doesn't seem... right...",
                )
                    .monologue("Wait... are we... sinking? Oh no oh no oh no...")
                    .monologue("I KNEW this was a bad idea! Why did I agree to this?!")
                    .next(
                        new Dialogue(CaptainBacon, "Relax! Ships crash all the time! It's part of the adventure!")
                            .monologue("Look, we made it to land! See? Everything worked out!")
                            .monologue("Welcome to... uh... wherever this is!"),
                    ).root,
            )
            .onReached((stage) => {
                const connection = stage.dialogue!.finished.connect(() => {
                    stage.complete();
                });
                return () => connection.Disconnect();
            }),
    )
    .setReward({
        xp: 600,
        area: "ShipwreckIsland",
    });
