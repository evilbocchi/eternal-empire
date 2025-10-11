import BunkerNoob1 from "server/interactive/npc/Bunker Noob 1";
import BunkerNoob2 from "server/interactive/npc/Bunker Noob 2";
import CrustyBunkerLeader from "server/interactive/npc/Crusty Bunker Leader";
import MoldRepresentative from "server/interactive/npc/Mold Representative";
import { Dialogue } from "server/interactive/npc/NPC";
import Quest, { Stage } from "server/quests/Quest";
import { Server } from "shared/api/APIExpose";

export = new Quest(script.Name)
    .setName("Moldy Ambitions")
    .setLength(2)
    .setLevel(4)
    .setOrder(9)
    .addStage(
        new Stage()
            .setDescription("Talk to the Crusty Bunker Leader at %coords%.")
            .setNPC(CrustyBunkerLeader, true)
            .setDialogue(
                new Dialogue(
                    CrustyBunkerLeader,
                    "*coughs dramatically* Oh thank goodness you're here! We have... *cough* ...a situation.",
                )
                    .monologue(
                        "So like... okay... *wheeze* ...you know how bunkers are supposed to be safe and have food?",
                    )
                    .monologue("Well... ours HAD food. Past tense. HAD.")
                    .monologue(
                        "*coughs* The pantry... it got taken over by... I can't believe I'm saying this... sentient mold.",
                    )
                    .monologue(
                        "And not just any mold, bro. This mold? It unionized. It's demanding 'equal rights' and 'pizza night'.",
                    )
                    .monologue("I am not equipped to handle labor negotiations with literal fungus, dude.")
                    .monologue(
                        "*dramatic cough* Please... we need your help. Talk to it. Bribe it. Threaten it. I don't care. Just... do something.",
                    ).root,
            )
            .onReached((stage) => {
                return () => {}; // TODO unimplemented

                CrustyBunkerLeader.rootPart!.CFrame = CrustyBunkerLeader.startingCFrame;
                BunkerNoob1.rootPart!.CFrame = BunkerNoob1.startingCFrame;
                BunkerNoob2.rootPart!.CFrame = BunkerNoob2.startingCFrame;

                const noob1Dialogue = new Dialogue(
                    BunkerNoob1,
                    "Bro, the mold literally just asked for pizza night. I can't even.",
                )
                    .monologue("Like, how do we say no to organized spores? This is peak Barren Islands energy.")
                    .monologue("Good luck negotiating with... whatever that thing is.").root;

                const noob2Dialogue = new Dialogue(
                    BunkerNoob2,
                    "The pantry used to be our safe space. Now it's mold HQ.",
                )
                    .monologue("We literally lost our food stash to fungus. How embarrassing is that?")
                    .monologue("Please help us. I miss crackers.").root;

                noob1Dialogue.add();
                noob2Dialogue.add();

                const connection = stage.dialogue!.finished.connect(() => {
                    stage.complete();
                });

                return () => {
                    connection.disconnect();
                    noob1Dialogue.remove();
                    noob2Dialogue.remove();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription("Enter the bunker pantry and negotiate with the Mold Representative at %coords%.")
            .setNPC(MoldRepresentative, true)
            .setDialogue(
                new Dialogue(
                    MoldRepresentative,
                    "Greetings, biped. I am the elected representative of the United Mold Collective.",
                )
                    .monologue(
                        "Our demands are simple: Improved living conditions, access to organic snacks, and weekly pizza nights.",
                    )
                    .monologue("We have occupied this pantry as a peaceful protest. No violence... yet.")
                    .monologue(
                        "You may: Persuade us with logic, bribe us with superior snacks, or... threaten us with anti-mold spray.",
                    )
                    .monologue("Choose wisely, human. We are patient, but our spores are not.")
                    .monologue(
                        "Actually... nvm, I'm just gonna leave. The working conditions here are terrible anyway.",
                    )
                    .monologue(
                        "Tell the bunker noobs we're officially relocated. They can have their crusty pantry back.",
                    )
                    .monologue("This has been a productive negotiation. Farewell, biped. *fades into spores*").root,
            )
            .onReached((stage) => {
                MoldRepresentative.rootPart!.CFrame = MoldRepresentative.startingCFrame;

                const connection = stage.dialogue!.finished.connect(() => {
                    // Store that we "diplomatically" resolved this
                    Server.Event.setEventCompleted("MoldDiplomacy", true);
                    stage.complete();
                });

                return () => {
                    connection.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription("Return to the Crusty Bunker Leader with the good news.")
            .setNPC(CrustyBunkerLeader, true)
            .setDialogue(
                new Dialogue(CrustyBunkerLeader, "Wait... you actually did it? *coughs in disbelief*")
                    .monologue("The mold... just... left? Voluntarily?")
                    .monologue("Bro. BRO. You're a legend. *wheeze*")
                    .monologue(
                        "We're throwing a feast in your honor! ...It's just crackers and a single bean, but still!",
                    )
                    .monologue(
                        "You're always welcome here. If you ever need a place to not starve, you know where to find us.",
                    )
                    .monologue("*dramatic cough* Thank you... truly. Take this as a token of our gratitude.").root,
            )
            .onReached((stage) => {
                CrustyBunkerLeader.rootPart!.CFrame = CrustyBunkerLeader.startingCFrame;

                const noob1Celebration = new Dialogue(BunkerNoob1, "No way you actually pulled that off. Respect.")
                    .monologue("The mold really just said 'aight imma head out' lmao")
                    .monologue("You're invited to the bean feast btw.").root;

                const noob2Celebration = new Dialogue(
                    BunkerNoob2,
                    "We can finally use the pantry again! This is the best day ever!",
                )
                    .monologue("I mean... there's not much left in there, but it's the principle that counts.")
                    .monologue("You're a hero in our books.").root;

                noob1Celebration.add();
                noob2Celebration.add();

                const connection = stage.dialogue!.finished.connect(() => {
                    stage.complete();
                });

                return () => {
                    connection.disconnect();
                    noob1Celebration.remove();
                    noob2Celebration.remove();
                };
            }),
    )
    .setCompletionDialogue(
        new Dialogue(CrustyBunkerLeader, "*coughs victoriously* We did it, team. The bunker is ours again. Sort of.")
            .monologue(
                "That mold was actually pretty chill once you got to know it... but don't tell anyone I said that.",
            )
            .monologue("Anyway, enjoy your reward. You've earned it, champ.").root,
    )
    .setReward({
        xp: 250,
    });
