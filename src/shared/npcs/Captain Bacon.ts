import NPC from "shared/NPC";

export = new NPC()
    .createDefaultMonologue("Isn't today such a great day to set sail out to the great oceans?")
    .monologue(
        "I'd love to bring you aboard, though it seems my map's missing, and I don't really want to travel to the middle of nowhere.",
    )
    .monologue("Come back when you're Level 7 and maybe you can help me out.").npc;
