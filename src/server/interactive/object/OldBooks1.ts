import { Soliloquy } from "server/interactive/npc/NPC";
import InteractableObject from "server/interactive/object/InteractableObject";

export = new InteractableObject(script.Name).dialogueUponInteract(
    new Soliloquy("You take a book from the shelf.")
        .monologue("Looks to be from an era far older than anyone here has lived.")
        .monologue(`It reads: "...the strike causing the collapse."`)
        .monologue(
            "The rest of the book's contents seem to be hidden in a mysterious magic. That's all you can make out.",
        ).root,
);
