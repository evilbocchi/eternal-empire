import { Dialogue } from "server/interactive/npc/NPC";
import CoconutKarl from "server/interactive/npc/Coconut Karl";
import Tria from "server/interactive/npc/Tria";
import CaptainBacon from "server/interactive/npc/Captain Bacon";
import Quest, { Stage } from "server/quests/Quest";

export = new Quest(script.Name)
    .setName("Island Survival")
    .setLength(5)
    .setLevel(8)
    .setOrder(2)
    .addStage(
        new Stage()
            .setDescription(`Find a friendly native on the island.`)
            .setNPC(CoconutKarl, true)
            .setDialogue(
                new Dialogue(
                    CoconutKarl,
                    "Yooo! You must be the new shipwreck survivors! Welcome to the island, my dudes!",
                )
                    .monologue("Name's Coconut Karl. I've been living here for like... forever? Time is weird here.")
                    .monologue(
                        "So like... if you wanna survive on this island, you're gonna need to set up your own factory. It's the vibe.",
                    )
                    .monologue(
                        "We've got these special subarea plots where you can build your own mini-empire. Pretty sick.",
                    )
                    .next(
                        new Dialogue(
                            Tria,
                            "Factory? I... I don't know anything about... factories... this is so overwhelming...",
                        ).monologue("Can't we just... I don't know... eat coconuts?"),
                    )
                    .next(
                        new Dialogue(
                            CaptainBacon,
                            "Nonsense! A factory sounds like a great way to make money!",
                        ).monologue("Let's do it! What do we need?"),
                    )
                    .next(
                        new Dialogue(
                            CoconutKarl,
                            "First, you gotta gather some basic resources. Check the shipwreck and around the island.",
                        ).monologue("Look for wood, metal, anything useful. Come back when you've got some supplies."),
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
            .setDescription(`Collect basic resources from the island and shipwreck.`)
            .setDialogue(
                new Dialogue(CoconutKarl, "Go explore! The shipwreck has tons of salvageable stuff. The island too!")
                    .root,
            )
            .onReached((stage) => {
                // TODO: In a full implementation, this would check for specific items
                // For now, just complete after talking to Karl again
                const checkDialogue = new Dialogue(
                    CoconutKarl,
                    "Found some stuff? Nice! Let's see... yeah, that'll work. Time to build!",
                ).root;

                task.delay(30, () => {
                    checkDialogue.add();
                });

                const connection = checkDialogue.finished.connect(() => {
                    stage.complete();
                });

                return () => {
                    checkDialogue.remove();
                    connection.Disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Build your first factory part in your subarea.`)
            .setNPC(CoconutKarl, true)
            .setDialogue(
                new Dialogue(
                    CoconutKarl,
                    "Alright, so here's the deal. See that empty plot over there? That's your subarea.",
                )
                    .monologue("You can place factory items there - droppers, furnaces, upgraders, the whole shebang.")
                    .monologue(
                        "Start simple. Place a dropper and a furnace. Get that conveyor belt of capitalism rolling.",
                    )
                    .next(
                        new Dialogue(
                            Tria,
                            "I... I think I can... maybe... place things? If... if someone shows me how...",
                        ).monologue("This is still really scary though..."),
                    )
                    .next(
                        new Dialogue(
                            CoconutKarl,
                            "No worries! Just open your build menu and place down some basic items. You got this!",
                        ),
                    ).root,
            )
            .onReached((stage) => {
                const connection = stage.dialogue!.finished.connect(() => {
                    // TODO: In full implementation, check if player placed items in subarea
                    // For now, auto-complete after a delay
                    task.delay(30, () => {
                        stage.complete();
                    });
                });
                return () => connection.Disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Automate basic production in your factory.`)
            .setDialogue(
                new Dialogue(
                    CoconutKarl,
                    "Looking good! Now you gotta get that automation going. Make those droplets flow!",
                )
                    .monologue("Set up a basic production line - dropper to furnace to upgrader. Classic setup.")
                    .monologue("Come back when you've got something producing automatically.").root,
            )
            .onReached((stage) => {
                // TODO: Check for automated production
                task.delay(45, () => {
                    stage.complete();
                });
                return () => {};
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Meet more island natives and learn about upgrades.`)
            .setNPC(CoconutKarl, true)
            .setDialogue(
                new Dialogue(CoconutKarl, "Yooo! You did it! Your factory is running! That's what I'm talking about!")
                    .monologue("Now that you're set up, you can explore more of the island and meet the other natives.")
                    .monologue(
                        "We've got shops, upgrade stations, all kinds of stuff. Welcome to island life, my friend!",
                    )
                    .next(
                        new Dialogue(
                            Tria,
                            "I... I actually did it? I... I can't believe... I'm kind of proud?",
                        ).monologue("Maybe... maybe this adventure thing isn't so bad after all..."),
                    )
                    .next(
                        new Dialogue(CaptainBacon, "See? I told you this would be fun! Now let's find some treasure!"),
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
        xp: 1000,
    });
