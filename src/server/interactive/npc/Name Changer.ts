import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .createDefaultMonologue("Changing your name? Easy peasy! Just hand me your life savings.")
    .npc.load();
