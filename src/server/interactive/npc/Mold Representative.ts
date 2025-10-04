import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .createDefaultMonologue("Greetings, biped. We demand pizza or we riot.")
    .npc.createDefaultMonologue(
        "Our living conditions are substandard. We require better accommodations... and snacks.",
    )
    .npc.createDefaultMonologue("Do not underestimate the power of organized spores, human.").npc;
