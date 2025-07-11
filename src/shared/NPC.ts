//!native

export type NPCAnimationType = "Default" | "Walk" | "Run" | "Jump";

export default class NPC {
    animationsPerType = new Map<NPCAnimationType, number>();
    defaultDialogue!: Dialogue;

    constructor() {
        this.animationsPerType.set("Walk", 180426354);
        this.animationsPerType.set("Jump", 125750702);
    }

    setAnimation(animType: NPCAnimationType, id: number) {
        this.animationsPerType.set(animType, id);
        return this;
    }

    setDefaultDialogue(defaultDialogue: Dialogue) {
        this.defaultDialogue = defaultDialogue;
        return this;
    }

    createDefaultMonologue(text: string) {
        this.defaultDialogue = new Dialogue(this, text);
        return this.defaultDialogue;
    }
}

export const EMPTY_NPC = new NPC();

export class Dialogue {

    npc: NPC;
    text: string;
    choices = new Map<string, Dialogue>();
    nextDialogue: Dialogue | undefined = undefined;
    root: Dialogue;
    
    constructor(npc: NPC, text: string, root?: Dialogue) {
        this.npc = npc;
        this.text = text;
        this.root = root ?? this;
    }

    /**
     * Create a following Dialogue instance.
     * 
     * @param text
     * @returns The following Dialogue
     */
    monologue(text: string) {
        return this.next(new Dialogue(this.npc, text, this.root));
    }
    
    /**
     * Add a Dialogue instance to be followed by the current Dialogue.
     * Does not change the `root` parameter.
     * 
     * @param dialogue 
     * @returns The added Dialogue
     */
    next(dialogue: Dialogue) {
        this.nextDialogue = dialogue;
        return dialogue;
    }
}