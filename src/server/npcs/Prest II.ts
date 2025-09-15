import NPC from "server/NPC";

export = new NPC(script.Name)
    .createDefaultMonologue("Want a bed? Just go upstairs and sleep in it! It's free, you know!")
    .monologue("...? Prest? Who's that? I don't know anyone by that name.").npc;
