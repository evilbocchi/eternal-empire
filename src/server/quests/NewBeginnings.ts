import { ReplicatedStorage, RunService } from "@rbxts/services";
import NameChanger from "server/interactive/npc/Name Changer";
import { Dialogue } from "server/interactive/npc/NPC";
import Tria from "server/interactive/npc/Tria";
import Quest, { Stage } from "server/quests/Quest";
import { Server } from "shared/api/APIExpose";
import { WAYPOINTS } from "shared/constants";
import TheFirstDropper from "shared/items/negative/tfd/TheFirstDropper";
import TheFirstFurnace from "shared/items/negative/tfd/TheFirstFurnace";
import Packets from "shared/Packets";

const triaToMineGuiding = Tria.createPathfindingOperation(
    Tria.startingCFrame,
    WAYPOINTS.NewBeginningsTriaMineGuiding.CFrame,
);
const triaToStart = Tria.createPathfindingOperation(
    WAYPOINTS.NewBeginningsTriaMineGuiding.CFrame,
    Tria.startingCFrame,
    false,
);

export = new Quest(script.Name)
    .setName("New Beginnings")
    .setLength(1)
    .setLevel(1)
    .setOrder(1)
    .addStage(
        new Stage()
            .setDescription(`You seem to be lost. Talk to the Friendly Noob next to you.`)
            .setNPC(Tria, true)
            .setDialogue(
                new Dialogue(
                    Tria,
                    "Oh! Uh... you're awake! That... that was fast, I guess. You were, um... out cold for a bit. Yeah.",
                )
                    .monologue(
                        "It... it happens a lot, people getting... washed up on shore. Not that it's... unusual or anything, haha.",
                    )
                    .monologue(
                        "I-I don't really understand how you... how you all stay alive after... the tossing in the sea.",
                    )
                    .monologue(
                        "So, uh... now that you're... here with us... I guess I should... show you, um... a few things?",
                    )
                    .monologue(
                        "There's a lot to learn and... lots of challenges, I think. But... you'll figure it out, probably.",
                    ).root,
            )
            .onReached((stage) => {
                Tria.rootPart!.CFrame = Tria.startingCFrame;
                Tria.playAnimation("Default");
                ReplicatedStorage.SetAttribute("NewBeginningsWakingUp", true);

                const continuation = new Dialogue(
                    Tria,
                    "Uh... I-I'm Tria... I guess. Um... if... if you want, I can... show you... how to, uh... maybe... make some money? Heh...",
                );
                const stageDialogueConn = stage.dialogue!.finished.connect(() => {
                    Server.Event.setEventCompleted("TriaReveal", true);
                    continuation.talk();
                });
                const continuationConn = continuation.finished.connect(() => {
                    stage.complete();
                });
                return () => {
                    stageDialogueConn.disconnect();
                    continuationConn.disconnect();
                };
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Follow Tria...?`)
            .setNPC(Tria)
            .setFocus(WAYPOINTS.NewBeginningsTriaMineGuiding)
            .setDialogue(new Dialogue(Tria, "Follow me..."))
            .onReached((stage) => {
                Tria.rootPart!.CFrame = Tria.startingCFrame;
                Tria.stopAnimation("Default");
                ReplicatedStorage.SetAttribute("NewBeginningsWakingUp", false);

                task.wait(1);

                triaToMineGuiding().onComplete(() => {
                    stage.complete();
                });
                return () => {};
            }),
    )
    .addStage(
        new Stage()
            .setDescription("Figure out how to purchase items with Tria.")
            .setNPC(Tria)
            .setDialogue(
                new Dialogue(
                    Tria,
                    "O-okay, um... here we are, I guess. Your new... mine. It's... not much to look at, sorry.",
                )
                    .monologue("With some work though... it might... uh... become something nice, maybe?")
                    .monologue(
                        "Your first task... is to... get some basic equipment. Go to that shop over there and... um... get a Dropper and a Furnace.",
                    )
                    .monologue(
                        "Don't worry about the cost... you don't have any money right now... but... uh... the essentials are free for newcomers, thankfully.",
                    )
                    .monologue("Let's... let's try to get this... thing going, okay?").root,
            )
            .onReached((stage) => {
                Tria.rootPart!.CFrame = WAYPOINTS.NewBeginningsTriaMineGuiding.CFrame;
                Tria.stopAnimation("Default");

                let t = 0;
                const ItemService = Server.Item;
                const connection = RunService.Heartbeat.Connect((dt) => {
                    t += dt;
                    if (t < 0.5) return;
                    t = 0;
                    if (
                        ItemService.getBoughtAmount(TheFirstDropper) > 0 &&
                        ItemService.getBoughtAmount(TheFirstFurnace) > 0
                    ) {
                        stage.complete();
                        new Dialogue(Tria, "Oh! You did it... wow, nice job!")
                            .monologue("Now... um... place those items down carefully, okay?")
                            .monologue("Make sure... uh... the dropper head is... above the furnace... yes.")
                            .monologue("Heh... let's see if this... can make some money... I hope.")
                            .root.talk();
                    }
                });
                return () => connection.Disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription("Interact with Tria to learn how to start making money.")
            .setNPC(Tria)
            .setDialogue(
                new Dialogue(
                    Tria,
                    "Uh... see that backpack over there... left side of your screen... yeah, click it to open your Inventory... I think.",
                ),
            )
            .onReached((stage) => {
                Tria.rootPart!.CFrame = WAYPOINTS.NewBeginningsTriaMineGuiding.CFrame;
                Tria.stopAnimation("Default");

                const continuation = new Dialogue(Tria, "N-nice job, uh... I guess!")
                    .monologue("I... I'd like to teach you more... but... I should probably... go home now... sorry.")
                    .monologue(
                        "I'll... I'll see you again when... um... you've made a bit more money... maybe...",
                    ).root;
                let completed = false;
                let continuationConn: RBXScriptConnection;
                const connection = Server.Currency.balanceChanged.connect((balance) => {
                    const funds = balance.get("Funds");
                    if (completed === false && funds !== undefined && !funds.lessEquals(0)) {
                        completed = true;
                        continuationConn = continuation.finished.connect(() => {
                            triaToStart().onComplete(() => {
                                Tria.playAnimation("Default");
                            });
                            stage.complete();
                        });
                        continuation.talk();
                    }
                });
                return () => {
                    connection.disconnect();
                    continuationConn?.Disconnect();
                };
            }),
    )
    .onInit(() => {
        Server.Event.addCompletionListener("TriaReveal", (isCompleted) => {
            if (isCompleted) Tria.revealActualName();
        });

        if (NameChanger.defaultDialogues[0]) {
            NameChanger.defaultDialogues[0].finished.connect(() => {
                Packets.tabOpened.toAllClients("Rename");
            });
        }
    })
    .setReward({
        xp: 60,
    });
