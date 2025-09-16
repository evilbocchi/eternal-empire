import { Soliloquy } from "server/interactive/npc/NPC";
import InteractableObject from "server/interactive/object/InteractableObject";

export = new InteractableObject(script.Name).dialogueUponInteract(
    new Soliloquy("You take a book from the shelf.")
        .monologue("Opening the first page, the last time someone has borrowed this book dates back to 100 A.")
        .monologue(
            `It reads: "With the invention of Condensers, the worry about droplet limits have been effectively eliminated!"`,
        )
        .monologue(
            `"Not only that, Condensers are able to process droplet datasets in order to instantiate new droplets while requiring less than its intended quota."`,
        )
        .monologue(`"We can expect more great things from the genius scientist, Raiwa Bobs."`)
        .monologue(`For some reason, you can't seem to bear reading more.`).root,
);
