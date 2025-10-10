import { convertToMMSS } from "@antivivi/vrldk";
import { RunService } from "@rbxts/services";
import { Dialogue } from "server/interactive/npc/NPC";
import ProfAlaric from "server/interactive/npc/Prof. Alaric";
import Quest, { Stage } from "server/quests/Quest";
import { Server } from "shared/api/APIExpose";
import ThisEmpire from "shared/data/ThisEmpire";

const OBBY_TIME_LIMIT = 300; // 5 minutes in seconds

export = new Quest(script.Name)
    .setName("Obby Studies")
    .setLength(4)
    .setLevel(8)
    .setOrder(1)
    .addStage(
        new Stage()
            .setDescription(`Talk to the scientist in the laboratory at %coords%.`)
            .setNPC(ProfAlaric, true)
            .setDialogue(
                new Dialogue(ProfAlaric, "Oh hey, another test subject—I mean, visitor! Welcome to my lab, bro.")
                    .monologue("I've tried everything, but nothing works. Even my coffee is broken.")
                    .monologue(
                        "Look, I've been working on these item prototypes, right? But like... they just don't function. At all.",
                    )
                    .monologue("I need real-world testing data. That's where you come in.")
                    .monologue("I built this simulation chamber—it's basically an obby that gets progressively harder.")
                    .monologue("The simulation is just a little difficult. Like, only slightly soul-crushing.")
                    .monologue(
                        "You have 5 minutes to get as far as possible. Each checkpoint you reach gives me valuable data!",
                    )
                    .monologue("If you reach the end, tell me how. I think I coded it wrong.")
                    .monologue("So... you willing to do this? It's for science. And my sanity.").root,
            )
            .onReached((stage) => {
                ProfAlaric.rootPart!.CFrame = ProfAlaric.startingCFrame;
                ProfAlaric.playAnimation("Default");

                const connection = stage.dialogue?.finished.connect(() => {
                    stage.complete();
                });
                return () => connection?.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Enter the simulation chamber at %coords%.`)
            .setDialogue(
                new Dialogue(ProfAlaric, "The chamber is right over there. Step inside when you're ready.")
                    .monologue("Don't worry if you fail—most people do. It's totally normal.")
                    .monologue("Actually, everyone fails. But you might be different!").root,
            )
            .onReached((stage) => {
                ProfAlaric.stopAnimation("Default");

                // For now, auto-complete this stage after a short delay
                // In the actual game, this would check if the player entered a specific zone
                // The waypoint "ObbyStudiesSimulationEntrance" would need to be created in the game workspace
                task.wait(3);
                stage.complete();
                return () => {};
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Complete the obby simulation. Time remaining: %time%`)
            .setDialogue(
                new Dialogue(
                    ProfAlaric,
                    "Alright, simulation starting now! You've got 5 minutes. Let's see what you can do!",
                ).root,
            )
            .onReached((stage) => {
                ProfAlaric.stopAnimation("Default");

                // Initialize obby tracking in quest metadata
                const questMetadata = ThisEmpire.data.questMetadata;
                questMetadata.set("ObbyStudiesStartTime", ThisEmpire.data.playtime);
                questMetadata.set("ObbyStudiesCheckpoints", 0);
                questMetadata.set("ObbyStudiesMaxCheckpoint", 0);

                let timeElapsed = 0;
                let lastUpdate = 0;

                const connection = RunService.Heartbeat.Connect((dt) => {
                    timeElapsed += dt;
                    const timeRemaining = OBBY_TIME_LIMIT - timeElapsed;

                    // Update stage description every second
                    if (timeElapsed - lastUpdate >= 1) {
                        lastUpdate = timeElapsed;
                        stage.setDescription(
                            `Complete the obby simulation. Time remaining: ${convertToMMSS(timeRemaining)}`,
                        );
                    }

                    // Check if time is up
                    if (timeRemaining <= 0) {
                        const checkpointsReached = questMetadata.get("ObbyStudiesCheckpoints") as number | undefined;
                        Server.ChatHook.sendServerMessage(
                            `Time's up! You reached ${checkpointsReached ?? 0} checkpoints. Not bad!`,
                        );
                        stage.complete();
                    }

                    // Simulate checkpoint progression based on time
                    // In a real implementation, this would be handled by touching checkpoint parts in the obby
                    const simulatedCheckpoints = math.floor(timeElapsed / 30); // 1 checkpoint every 30 seconds
                    const currentCheckpoints = questMetadata.get("ObbyStudiesCheckpoints") as number | undefined;
                    if (simulatedCheckpoints > (currentCheckpoints ?? 0)) {
                        questMetadata.set("ObbyStudiesCheckpoints", simulatedCheckpoints);
                        if (
                            simulatedCheckpoints >
                            ((questMetadata.get("ObbyStudiesMaxCheckpoint") as number | undefined) ?? 0)
                        ) {
                            questMetadata.set("ObbyStudiesMaxCheckpoint", simulatedCheckpoints);
                        }
                        Server.ChatHook.sendServerMessage(`Checkpoint ${simulatedCheckpoints} reached!`);
                    }
                });

                return () => connection.Disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Return to the scientist for your results.`)
            .setNPC(ProfAlaric)
            .setDialogue(new Dialogue(ProfAlaric, "You're back! Let me analyze the data..."))
            .onReached((stage) => {
                ProfAlaric.rootPart!.CFrame = ProfAlaric.startingCFrame;
                ProfAlaric.playAnimation("Default");

                const questMetadata = ThisEmpire.data.questMetadata;
                const checkpointsReached = (questMetadata.get("ObbyStudiesCheckpoints") as number | undefined) ?? 0;

                let resultsDialogue: Dialogue;

                if (checkpointsReached >= 10) {
                    // Reached the "impossible" section
                    resultsDialogue = new Dialogue(
                        ProfAlaric,
                        "BRO. You broke my simulation. You weren't supposed to reach that far!",
                    )
                        .monologue("Do you have skill installed or something? This is wild.")
                        .monologue("I need to rethink physics. And my entire career.")
                        .monologue(
                            "Here, take this reward. You earned it. And unlocked access to the Challenges board too!",
                        ).root;
                } else if (checkpointsReached >= 7) {
                    resultsDialogue = new Dialogue(
                        ProfAlaric,
                        "Okay, I'm genuinely impressed. You got really far in there.",
                    )
                        .monologue("The data you provided is super valuable. My simulations might actually work now!")
                        .monologue(
                            "Here's your reward, and you've unlocked the Challenges board. Go check it out!",
                        ).root;
                } else if (checkpointsReached >= 4) {
                    resultsDialogue = new Dialogue(ProfAlaric, "Not bad! You reached a decent number of checkpoints.")
                        .monologue("The data is useful, even if you didn't get super far.")
                        .monologue("Take this reward, and you can now access the Challenges board!").root;
                } else {
                    resultsDialogue = new Dialogue(ProfAlaric, "Well... you tried. That's what matters, right?")
                        .monologue("The simulation is hard, I get it. Even I can't beat it.")
                        .monologue(
                            "Here's a participation reward. And hey, you've unlocked the Challenges board anyway!",
                        ).root;
                }

                const stageDialogueConn = stage.dialogue!.finished.connect(() => {
                    resultsDialogue.talk();
                });

                const resultsDialogueConn = resultsDialogue.finished.connect(() => {
                    // Mark that challenges are now unlocked
                    questMetadata.set("ChallengesUnlocked", true);
                    Server.Challenge.refreshChallenges();
                    stage.complete();
                });

                return () => {
                    stageDialogueConn.disconnect();
                    resultsDialogueConn.disconnect();
                };
            }),
    )
    .setCompletionDialogue(
        new Dialogue(
            ProfAlaric,
            "Thanks for helping with my research! Feel free to come back and try the simulation again anytime.",
        ).monologue("Just don't expect rewards every time—this is science, not a charity.").root,
    )
    .setReward({
        xp: 300,
    });
