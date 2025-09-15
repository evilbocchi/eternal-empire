import NPC from "shared/world/NPC";

export = new NPC(script.Name)
    .setDefaultName("Friendly Noob")
    .setAnimation("Default", 17855439739)
    .createDefaultMonologue(
        "O-oh! Uh... y-you're... you're talking to me again? I... I didn't mean to... I mean... uh... hi!",
    )
    .npc.createDefaultMonologue("Uh... I... I'm... I don't know what to say... maybe... just... um... don't mind me...")
    .npc.createDefaultMonologue("W-wait... did I... say that out loud before? I... I... I hope it's fine... uh...")
    .npc.createDefaultMonologue(
        "O-oh no... you're... still here... I... I wasn't ready for... uh... conversation again...",
    )
    .npc.createDefaultMonologue(
        "U-uh... maybe you shouldn't... click me so much... I... I'm... I mean... I'm fine, I guess...",
    )
    .npc.createDefaultMonologue("P-please... uh... I... I don't want to be rude... but... maybe... come back later?")
    .npc.createDefaultMonologue(
        "Uh... I... I'm... really... I mean... okay... maybe... just... leave me alone for a bit...",
    ).npc;
