import { Soliloquy } from "server/interactive/npc/NPC";
import InteractableObject from "server/interactive/object/InteractableObject";

export = new InteractableObject(script.Name).dialogueUponInteract(
    new Soliloquy("A weird looking emblem-resembling object. You have no idea how to use this.").root,
);
