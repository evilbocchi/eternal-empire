import NPC from "server/npc/NPC";

export = new NPC(script.Name)
    .setAnimation("Default", 18130322046)
    .createDefaultMonologue(
        "We don't really have much to do in this place, so reading is practically our only hobby. Though, what are these words...",
    ).npc;
