import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .setAnimation("Default", 17708029763)
    .createDefaultMonologue("Ah... ah... that cave haunts me...")
    .npc.load();
