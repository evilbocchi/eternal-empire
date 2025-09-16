import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .setAnimation("Default", 17789845379)
    .createDefaultMonologue("...? You're not from around here.")
    .monologue("Let me know when you're Level 12. I have a special mission for you then.")
    .npc.reconcile();
