import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .createDefaultMonologue("I kinda need some items, but the store's a little expensive...")
    .npc.load();
