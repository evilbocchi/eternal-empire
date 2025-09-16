import { Soliloquy } from "server/interactive/npc/NPC";
import InteractableObject from "server/interactive/object/InteractableObject";

export = new InteractableObject(script.Name).dialogueUponInteract(
    new Soliloquy("You take a book from the shelf.")
        .monologue("There seems to only be a few pages in it.")
        .monologue(`It reads: "Today was a happy day for me."`)
        .monologue(`"I had Ice Cream, built by own Dropper and met my favourite idol!"`)
        .monologue(`"I hope tomorrow will be just as amazing."`)
        .monologue(`"12 June 102."`)
        .monologue(`How did this diary end up here?`).root,
);
