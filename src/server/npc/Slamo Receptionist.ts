import NPC from "server/npc/NPC";

export = new NPC(script.Name)
    .setAnimation("Default", 17708029763)
    .createDefaultMonologue(`Filing a report? No? Don't waste my time.`).npc;
