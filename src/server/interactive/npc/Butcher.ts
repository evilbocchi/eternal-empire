import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .createDefaultMonologue(`My chicken is juicy and delicious. Want to buy some?`)
    .npc.reconcile();
