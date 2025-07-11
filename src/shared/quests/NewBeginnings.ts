import { ReplicatedStorage, RunService, TweenService } from "@rbxts/services";
import { Dialogue } from "shared/NPC";
import Quest, { Stage } from "shared/Quest";
import { getNPCModel, getWaypoint } from "shared/constants";
import TheFirstDropper from "shared/items/negative/tfd/TheFirstDropper";
import TheFirstFurnace from "shared/items/negative/tfd/TheFirstFurnace";
import Tria from "shared/npcs/Tria";

const waypoint1 = getWaypoint("NewBeginnings1");
const triaModel = getNPCModel("Tria");
const triaHumanoid = triaModel.FindFirstChildOfClass("Humanoid")!;
const triaRootPart = triaHumanoid.RootPart!;
const characterTween = TweenService.Create(triaRootPart, new TweenInfo(1), { CFrame: waypoint1.CFrame });

export = new Quest(script.Name)
.setName("New Beginnings")
.setLength(1)
.setLevel(1)
.setOrder(1)
.addStage(new Stage()
    .setDescription(`You seem to be lost. Talk to the %npc% next to you.`)
    .setNPC("Tria")
    .setFocus(triaRootPart)
    .setDialogue(new Dialogue(Tria, "You're awake! That was quick. It was moments ago you were out cold, barely clinging to consciousness.")
        .monologue("It happens far too often, people getting washed up next to shore.")
        .monologue("How you guys stay alive after all that tossing in the sea honestly baffles me.")
        .monologue("Well, now that you're trapped here with us, I might as well show you the ropes.")
        .monologue("There's a lot to learn and many challenges to face in this strange and unpredictable place, but you'll find your way.")
        .root
    )
    .onStart((utils, stage) => {
        ReplicatedStorage.SetAttribute("Intro", true);
        const continuation = new Dialogue(Tria, "I'm Tria! Come with me, let's get you started on making yourself some money.");
        const connection = utils.dialogueFinished.connect((dialogue) => {
            if (dialogue === stage.dialogue) {
                utils.setEventCompleted("TriaReveal", true);
                utils.talk(continuation);
            }              
            else if (dialogue === continuation)
                stage.completed.fire();
        });
        return () => connection.disconnect();
    })
)
.addStage(new Stage()
    .setDescription(`Follow %npc%.`)
    .setNPC("Tria")
    .setFocus(getWaypoint("NewBeginnings1"))
    .setDialogue(new Dialogue(Tria, "Follow me!"))
    .onStart((utils, stage) => {
        ReplicatedStorage.SetAttribute("Intro", false);
        utils.stopNPCAnimation(Tria, "Default");
        task.wait(2);
        const connection = utils.leadToPoint(triaHumanoid, stage.focus!.CFrame, () => stage.completed.fire());
        return () => connection.Disconnect();
    })
)
.addStage(new Stage()
    .setDescription("Figure how to purchase items with %npc%.")
    .setNPC("Tria")
    .setDialogue(new Dialogue(Tria, "Here we are, your new mine. It's not much to look at now, huh.")
        .monologue("With some hard work, though, it'll be thriving in no time.")
        .monologue("Your first task is to get some basic equipment. Go to that shop over there and get a Dropper and Furnace.")
        .monologue("Don't worry about the cost; you don't have any money right now, but luckily, the essentials are all free for newcomers.")
        .monologue("Let's get this operation underway!")
        .root
    )
    .onStart((utils, stage) => {
        utils.stopNPCAnimation(Tria, "Default");
        characterTween.Play();
        let t = 0;
        const connection = RunService.Heartbeat.Connect((dt) => {
            t += dt;
            if (t < 0.5)
                return;
            t = 0;
            if (utils.getBoughtAmount(TheFirstDropper.id) > 0 && utils.getBoughtAmount(TheFirstFurnace.id) > 0) {
                stage.completed.fire();
                utils.talk(new Dialogue(Tria, "Well done!")
                    .monologue("Now, go ahead and place those items down.")
                    .monologue("Make sure to align them so that the dropper head is above the furnace.")
                    .monologue("Let's see you make some money!")
                    .root
                );
            }
                
        });
        return () => connection.Disconnect();
    })
)
.addStage(new Stage()
    .setDescription("Interact with %npc% to learn how to start making money.")
    .setNPC("Tria")
    .setDialogue(
        new Dialogue(Tria, "See that backpack on the left-hand corner of your screen? Click it to open your Inventory!")
    )
    .onStart((utils, stage) => {
        utils.stopNPCAnimation(Tria, "Default");
        characterTween.Play();
        const continuation = new Dialogue(Tria, "Nice job!")
        .monologue("I'd like to teach you more, but I'm afraid I'm going back home.")
        .monologue("I'll see you again when you make a bit more money!")
        .root;
        let completed = false;
        const connection = utils.balanceChanged.connect((balance) => {
            const funds = balance.get("Funds");
            if (completed === false && funds !== undefined && !funds.lessEquals(0)) {
                completed = true;
                const c2 = utils.dialogueFinished.connect((dialogue) => {
                    if (dialogue === continuation) {
                        c2.disconnect();
                        utils.leadToPoint(triaHumanoid, getWaypoint("NewBeginningsEnd").CFrame, () => utils.playNPCAnimation(Tria, "Default"));
                        stage.completed.fire();
                    }
                });
                utils.talk(continuation);
            }
        });
        return () => connection.disconnect();
    })
)
.onInit((utils) => {
    utils.onEventCompleted("TriaReveal", (isCompleted) => {
        if (isCompleted)
            triaHumanoid.DisplayName = "";
    })
})
.setReward({
    xp: 60
});