import { Soliloquy } from "server/interactive/npc/NPC";
import InteractableObject from "server/interactive/object/InteractableObject";

export = new InteractableObject(script.Name).dialogueUponInteract(
    new Soliloquy("You take a book from the shelf.")
        .monologue("Looks to be terribly worn out.")
        .monologue(
            `It reads: "Development on the Megadropper has seen rapid progress, with potential to surpass that of even the strongest of Droppers."`,
        )
        .monologue(
            `"We can expect widespread use of the Megadropper in the next 50-100 years, being commerically available in the next 10 years."`,
        )
        .monologue(
            `"The adoption of the Megadropper will fuel the production of extremely valuable droplets, allowing the economy to strengthen up to ten-fold."`,
        )
        .monologue(
            `"The fight against the corruption suddenly seems a reality now, thanks to this single invention. We can only send our heartfelt gratitude to..."`,
        )
        .monologue(`For some reason, you can't seem to bear reading more.`).root,
);
