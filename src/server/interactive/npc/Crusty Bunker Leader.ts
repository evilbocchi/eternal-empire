import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .createDefaultMonologue("*coughs* Yo, bro... we got a situation. The mold... the MOLD unionized.")
    .npc.createDefaultMonologue("I can't believe we're negotiating with fungus rn. This is wild.")
    .npc.createDefaultMonologue("*dramatic cough* If you ever need a place to not starve, you know where to find us.")
    .npc;
