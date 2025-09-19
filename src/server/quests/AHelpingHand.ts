import Freddy from "server/interactive/npc/Freddy";
import { Dialogue } from "server/interactive/npc/NPC";
import Quest, { Stage } from "server/quests/Quest";
import { emitEffect, getSound } from "shared/asset/GameAssets";
import { WAYPOINTS } from "shared/constants";
import { Server } from "shared/item/ItemUtils";
import LostPendant from "shared/items/0/winsome/LostPendant";
import FreddysUpgrader from "shared/items/negative/friendliness/FreddysUpgrader";
import BasicObstacleCourse from "shared/world/nodes/BasicObstacleCourse";

const freddyToRequest = Freddy.createPathfindingOperation(
    Freddy.rootPart?.CFrame,
    WAYPOINTS.AHelpingHandFreddyRequest.CFrame,
);

const obstacleCourse = BasicObstacleCourse.waitForInstance();
const ladder = obstacleCourse.WaitForChild("Ladder");
const ladderHandles = new Array<BasePart>();
for (let i = 1; i < 9; i++) {
    ladderHandles.push(ladder.FindFirstChild(i) as BasePart);
}

export = new Quest(script.Name)
    .setName("A Helping Hand")
    .setLength(1)
    .setLevel(3)
    .setOrder(6)
    .addStage(
        new Stage()
            .setDescription(`Talk to the Sad Noob at %coords%.`)
            .setNPC(Freddy, true)
            .setDialogue(
                new Dialogue(Freddy, "I hate this place... It's dreary, and nothing ever goes my way. Oh, hey.")
                    .monologue(
                        "I didn't notice you there. I see you're quite rich. Maybe you can help me out with something.",
                    )
                    .monologue(
                        "I've been stuck in this rut for too long, and I could really use a bit of your fortune to turn things around.",
                    )
                    .monologue("What do you say? Care to lend a hand to someone down on their luck?").root,
            )
            .onReached((stage) => {
                Freddy.rootPart!.CFrame = Freddy.startingCFrame;
                Freddy.playAnimation("Default");

                const continuation = new Dialogue(Freddy, "My name's Freddy. Follow me, I have something to show you.");

                const connection = Dialogue.finished.connect((dialogue) => {
                    if (dialogue === stage.dialogue) {
                        Server.Event.setEventCompleted("FreddyReveal", true);
                        continuation.talk();
                    } else if (dialogue === continuation) stage.complete();
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Follow the Sad Noob to %coords%.`)
            .setNPC(Freddy)
            .setFocus(WAYPOINTS.AHelpingHandFreddyRequest)
            .setDialogue(new Dialogue(Freddy, "Follow me, I have something to show you."))
            .onReached((stage) => {
                Freddy.rootPart!.CFrame = Freddy.startingCFrame;
                Freddy.stopAnimation("Default");

                task.delay(2, () => freddyToRequest().onComplete(() => stage.complete()));
                return () => {};
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Talk to the Sad Noob to help him out.`)
            .setNPC(Freddy)
            .setDialogue(
                new Dialogue(
                    Freddy,
                    "Rumors say that someone left a valuable item above these pillars for some reason. Weird, right? Who would leave something valuable up there?",
                )
                    .monologue("It sounds strange, but you never know. Rumors often have a grain of truth to them.")
                    .monologue(
                        "I've been thinking about it a lot, but I'm not Skilled enough to navigate the obstacles up there. The pillars are tricky, and it takes a certain level of agility and bravery to get through.",
                    )
                    .monologue(
                        "Here's what we'll do: I'll make the ladder for you to climb up. It won't be easy, but I have faith in your abilities.",
                    )
                    .monologue(
                        "Once you're up there, keep your eyes peeled for the item on top of the mountain formed from the pillars.",
                    )
                    .monologue("I'll make the ladder for you. Get the item and come back to me once you're done.")
                    .monologue("Good luck, and remember, I'm counting on you!").root,
            )
            .onReached((stage) => {
                Freddy.rootPart!.CFrame = WAYPOINTS.AHelpingHandFreddyRequest.CFrame;
                Freddy.stopAnimation("Default");

                const connection = Dialogue.finished.connect((dialogue) => {
                    if (stage.dialogue === dialogue) stage.complete();
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Complete the obstacle course and retrieve the item.`)
            .setNPC(Freddy)
            .setDialogue(new Dialogue(Freddy, "What are you waiting for? Go get it!"))
            .onReached((stage) => {
                Freddy.rootPart!.CFrame = WAYPOINTS.AHelpingHandFreddyRequest.CFrame;
                Freddy.stopAnimation("Default");

                const hitSound = getSound("QuestConstruct.mp3");
                for (const handle of ladderHandles) {
                    emitEffect("Strike", handle, 2);
                    handle.Transparency = 0;
                    handle.CanCollide = true;
                    const hs = hitSound.Clone();
                    hs.Parent = handle;
                    hs.Play();
                    task.wait(0.25);
                }
                new Dialogue(Freddy, "Off you go!").talk();
                task.wait(1);

                const connection = Server.Event.addCompletionListener("AHelpingHandPendant", (isCompleted) => {
                    if (isCompleted) stage.complete();
                });
                return () => connection.disconnect();
            }),
    )
    .addStage(
        new Stage()
            .setDescription(`Report back to the Sad Noob.`)
            .setNPC(Freddy, true)
            .setDialogue(
                new Dialogue(Freddy, "I see you have the item. Nice work! I knew you could do it.")
                    .monologue(
                        "Thanks for returning it back to me. As a token of my gratitude, I'll give you something else worth your time.",
                    )
                    .monologue(
                        "Here's an item that'll boost your Funds gain by quite a bit. It's not just a reward, but a way for you to keep prospering in your adventures.",
                    )
                    .monologue("Enjoy, and may it bring you as much fortune as you've brought me today. Thanks again!")
                    .root,
            )
            .onReached((stage) => {
                Freddy.rootPart!.CFrame = WAYPOINTS.AHelpingHandFreddyRequest.CFrame;
                Freddy.stopAnimation("Default");

                const connection = Dialogue.finished.connect((dialogue) => {
                    Server.Quest.takeQuestItem(LostPendant.id, 1);
                    if (dialogue === stage.dialogue) stage.complete();
                });
                return () => connection.disconnect();
            }),
    )
    .onInit(() => {
        for (const handle of ladderHandles) {
            handle.Transparency = 1;
            handle.CanCollide = false;
        }

        Server.Event.addCompletionListener("FreddyReveal", (isCompleted) => {
            if (isCompleted) Freddy.revealActualName();
        });
    })
    .setCompletionDialogue(new Dialogue(Freddy, "Thanks a lot for your work! My name is Freddy, by the way."))
    .setReward({
        xp: 180,
        items: new Map([[FreddysUpgrader.id, 1]]),
    });
