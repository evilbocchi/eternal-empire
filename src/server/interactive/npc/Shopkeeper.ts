import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .createDefaultMonologue(`Buy what you need to survive in Slamo Village, Player!`)
    .npc.load();
