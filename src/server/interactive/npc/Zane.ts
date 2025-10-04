import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .setDefaultName("Elevator Guy")
    .createDefaultMonologue("The truth is up there... literally.").npc;
