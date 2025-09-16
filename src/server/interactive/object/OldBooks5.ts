import { Soliloquy } from "server/interactive/npc/NPC";
import InteractableObject from "server/interactive/object/InteractableObject";

export = new InteractableObject(script.Name).dialogueUponInteract(
    new Soliloquy("You take a book from the shelf.")
        .monologue("Suddenly, a wave of nausea comes over you.")
        .monologue(`You can't bring yourself to open the book.`)
        .monologue("It's like the developer didn't care to write actual content for this object. Huh.").root,
);
