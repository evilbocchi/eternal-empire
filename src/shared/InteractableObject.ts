import Signal, { Connection } from "@antivivi/lemon-signal";
import { Keyed, SimpleRegistry } from "@antivivi/unnamespaced-keyed";
import { Dialogue, EMPTY_NPC } from "shared/NPC";
import { GameUtils } from "shared/utils/ItemUtils";

class InteractableObject implements Keyed {

    static readonly OldBooks1 = new InteractableObject()
        .dialogueUponInteract(
            new Dialogue(EMPTY_NPC, "You take a book from the shelf.")
                .monologue("Looks to be from an era far older than anyone here has lived.")
                .monologue(`It reads: "...the strike causing the collapse."`)
                .monologue("The rest of the book's contents seem to be hidden in a mysterious magic. That's all you can make out.")
                .root
        );

    static readonly OldBooks2 = new InteractableObject()
        .dialogueUponInteract(
            new Dialogue(EMPTY_NPC, "You take a book from the shelf.")
                .monologue("Opening the first page, the last time someone has borrowed this book dates back to 100 A.")
                .monologue(`It reads: "With the invention of Condensers, the worry about droplet limits have been effectively eliminated!"`)
                .monologue(`"Not only that, Condensers are able to process droplet datasets in order to instantiate new droplets while requiring less than its intended quota."`)
                .monologue(`"We can expect more great things from the genius scientist, Raiwa Bobs."`)
                .monologue(`For some reason, you can't seem to bear reading more.`)
                .root
        );

    static readonly OldBooks3 = new InteractableObject()
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

    static readonly OldBooks4 = new InteractableObject()
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

    static readonly OldBooks5 = new InteractableObject()
        .dialogueUponInteract(
            new Dialogue(EMPTY_NPC, "You take a book from the shelf.")
                .monologue("Suddenly, a wave of nausea comes over you.")
                .monologue(`You can't bring yourself to open the book.`)
                .monologue("It's like the developer didn't care to write actual content for this object. Huh.")
                .root
        );

    static readonly BrokenPortal = new InteractableObject()
        .dialogueUponInteract(
            new Dialogue(EMPTY_NPC, "The gates of the Sky Pavilion are not open for visitors right now.")
                .monologue("Check back in a future update.")
                .root
        );

    static readonly SuspiciousWall = new InteractableObject()
        .dialogueUponInteract(
            new Dialogue(EMPTY_NPC, "A weird looking emblem-resembling object. You have no idea how to use this.")
                .root
        );

    static readonly SlamoBook = new InteractableObject()
        .dialogueUponInteract(
            new Dialogue(EMPTY_NPC, "There's a book here. Why is there such a book in this place?")
                .monologue("Despite such thoughts, you run your eyes through the book.")
                .monologue("It reads: Simpul, the ringleader to Slamo Domestication Works, a massive underworld company, ran numerous experiments on young Slamos as part of his efforts to create 'loyalty collars'.")
                .monologue(`These loyalty collars would leech the Skill off these Slamos upon detecting disobedience, inflicting great harm onto its wearer.`)
                .monologue("Fortunately, the Slamo Police has once again ensured the security and stability of the populace, capturing Simpul and keeping him behind bars for the rest of eternity.")
                .monologue("The end.")
                .monologue("...")
                .monologue("Is this a children's book?")
                .root
        );

    readonly interacted = new Signal<(utils: GameUtils, player: Player) => void>();
    key!: string;
    dialogue?: Dialogue;
    dialogueInteractConnection?: Connection;

    constructor() {

    }

    dialogueUponInteract(dialogue: Dialogue) {
        this.dialogue = dialogue;
        if (this.dialogueInteractConnection === undefined)
            this.dialogueInteractConnection = this.interacted.connect((utils) => {
                if (this.dialogue !== undefined)
                    GameUtils.talk(this.dialogue);
            });
        return this;
    }

    onInteract(callback: (utils: GameUtils, player: Player, object: this) => void) {
        this.interacted.connect((utils, player) => callback(utils, player, this));
        return this;
    }

    getKey() {
        return this.key;
    }

    static readonly REGISTRY = new SimpleRegistry(this.OldBooks1);
}

export = InteractableObject;