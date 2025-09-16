import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .createDefaultMonologue(`I should have never gone against the chief. Now I'm just a traitor, exiled and alone.`)
    .npc.reconcile();
