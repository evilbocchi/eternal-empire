import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .setAnimation("Default", 17708029763)
    .createDefaultMonologue(`Selling wool here for crazy cheap! Don't miss out!`)
    .npc.reconcile();
