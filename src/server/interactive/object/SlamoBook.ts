import { Soliloquy } from "server/interactive/npc/NPC";
import InteractableObject from "server/interactive/object/InteractableObject";

export = new InteractableObject(script.Name).dialogueUponInteract(
    new Soliloquy("There's a book here. Why is there such a book in this place?")
        .monologue("Despite such thoughts, you run your eyes through the book.")
        .monologue(
            "It reads: Simpul, the ringleader to Slamo Domestication Works, a massive underworld company, ran numerous experiments on young Slamos as part of his efforts to create 'loyalty collars'.",
        )
        .monologue(
            `These loyalty collars would leech the Skill off these Slamos upon detecting disobedience, inflicting great harm onto its wearer.`,
        )
        .monologue(
            "Fortunately, the Slamo Police has once again ensured the security and stability of the populace, capturing Simpul and keeping him behind bars for the rest of eternity.",
        )
        .monologue("The end.")
        .monologue("...")
        .monologue("Is this a children's book?").root,
);
