import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .createDefaultMonologue("Yawn... Oh, a visitor. Are you evil? No? Good. You may pass.")
    .npc.reconcile();
