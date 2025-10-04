import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .createDefaultMonologue("The pantry used to have all our snacks... now it's just mold central.")
    .npc.createDefaultMonologue("How did we lose to literal fungus? This is embarrassing.").npc;
