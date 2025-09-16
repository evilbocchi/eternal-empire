import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .createDefaultMonologue(
        `Yo, boss... I don't know what I did to get here, but I can tell you this: I didn't do it. I swear!`,
    )
    .npc.reconcile();
