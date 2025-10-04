import NPC from "server/interactive/npc/NPC";

export = new NPC(script.Name)
    .createDefaultMonologue(
        "Yo! Welcome to the island, dude. It's pretty chill here once you get used to the whole... stranded vibe.",
    )
    .monologue("We've got coconuts, we've got vibes, and we've got... well, mostly coconuts tbh.")
    .monologue(
        "If you're looking to survive here, you're gonna need to start your own little factory operation. It's the island way, fr fr.",
    ).npc;
