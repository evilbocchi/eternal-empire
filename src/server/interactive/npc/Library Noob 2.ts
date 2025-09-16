import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .setAnimation("Default", 18130322046)
    .createDefaultMonologue("I hate school. I really, really hate school. Wait, I forgot I don't have school. My bad.")
    .npc.reconcile();
