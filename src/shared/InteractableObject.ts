import { Dialogue, EMPTY_NPC } from "shared/NPC";
import { Signal } from "@antivivi/fletchette";

class InteractableObject {

    static INTERACTABLE_OBJECTS = new Map<string, InteractableObject>();

    static OldBooks1 = new InteractableObject()
    .dialogueUponInteract(
        new Dialogue(EMPTY_NPC, "You take a book from the shelf.")
        .monologue("Looks to be from an era far older than anyone here has lived.")
        .monologue(`It reads: "...the strike causing the collapse."`)
        .monologue("The rest of the book's contents seem to be hidden in a mysterious magic. That's all you can make out.")
        .root
    );

    static OldBooks2 = new InteractableObject()
    .dialogueUponInteract(
        new Dialogue(EMPTY_NPC, "You take a book from the shelf.")
        .monologue("Opening the first page, the last time someone has borrowed this book dates back to 100 A.")
        .monologue(`It reads: "With the invention of Condensers, the worry about droplet limits have been effectively eliminated!"`)
        .monologue(`"Not only that, Condensers are able to process droplet datasets in order to instantiate new droplets while requiring less than its intended quota."`)
        .monologue(`"We can expect more great things from the genius scientist, Raiwa Bobs."`)
        .monologue(`For some reason, you can't seem to bear reading more.`)
        .root
    );

    static OldBooks3 = new InteractableObject()
    .dialogueUponInteract(
        new Dialogue(EMPTY_NPC, "You take a book from the shelf.")
        .monologue("Looks to be terribly worn out.")
        .monologue(`It reads: "Development on the Megadropper has seen rapid progress, with potential to surpass that of even the strongest of Droppers."`)
        .monologue(`"We can expect widespread use of the Megadropper in the next 50-100 years, being commerically available in the next 10 years."`)
        .monologue(`"The adoption of the Megadropper will fuel the production of extremely valuable droplets, allowing the economy to strengthen up to ten-fold."`)
        .monologue(`"The fight against the corruption suddenly seems a reality now, thanks to this single invention. We can only send our heartfelt gratitude to..."`)
        .monologue(`For some reason, you can't seem to bear reading more.`)
        .root
    );

    static OldBooks4 = new InteractableObject()
    .dialogueUponInteract(
        new Dialogue(EMPTY_NPC, "You take a book from the shelf.")
        .monologue("There seems to only be a few pages in it.")
        .monologue(`It reads: "Today was a happy day for me."`)
        .monologue(`"I had Ice Cream, built by own Dropper and met my favourite idol!"`)
        .monologue(`"I hope tomorrow will be just as amazing."`)
        .monologue(`"12 June 102."`)
        .monologue(`How did this diary end up here?`)
        .root
    );

    static OldBooks5 = new InteractableObject()
    .dialogueUponInteract(
        new Dialogue(EMPTY_NPC, "You take a book from the shelf.")
        .monologue("Suddenly, a wave of nausea comes over you.")
        .monologue(`You can't bring yourself to open the book.`)
        .monologue(`Not just yet.`)
        .root
    );

    static BrokenPortal = new InteractableObject()
    .dialogueUponInteract(
        new Dialogue(EMPTY_NPC, "The gates of the Sky Pavilion are not open for visitors right now.")
        .monologue("Check back in a future update.")
        .root
    );

    static SuspiciousWall = new InteractableObject()
    .dialogueUponInteract(
        new Dialogue(EMPTY_NPC, "A weird looking emblem-resembling object. You have no idea how to use this.")
        .root
    );
    

    interacted = new Signal<(utils: GameUtils, player: Player) => void>();
    dialogue: Dialogue | undefined;
    
    constructor() {

    }

    dialogueUponInteract(dialogue: Dialogue) {
        this.dialogue = dialogue;
        return this.onInteract((utils) => utils.talk(dialogue));
    }

    onInteract(callback: (utils: GameUtils, player: Player, object: this) => void) {
        this.interacted.connect((utils, player) => callback(utils, player, this));
        return this;
    }

    static {
        for (const [i, v] of pairs(InteractableObject)) {
            if (v instanceof InteractableObject)
                InteractableObject.INTERACTABLE_OBJECTS.set(i, v);
        }
    }

    static getInteractableObject(id: string) {
        return InteractableObject.INTERACTABLE_OBJECTS.get(id);
    }
}

export = InteractableObject;