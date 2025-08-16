/**
 * Represents the animation types available for NPCs.
 */
export type NPCAnimationType = "Default" | "Walk" | "Run" | "Jump";

/**
 * Represents a non-player character (NPC) with animations, dialogue, and interaction logic.
 */
export default class NPC {
    animationsPerType = new Map<NPCAnimationType, number>();
    hipHeightPerAnimationType = new Map<NPCAnimationType, number>();
    defaultDialogue!: Dialogue;
    interact: (() => void) | undefined;

    constructor() {
        this.animationsPerType.set("Walk", 180426354);
        this.animationsPerType.set("Jump", 125750702);
        this.hipHeightPerAnimationType.set("Walk", 1);
        this.hipHeightPerAnimationType.set("Jump", 1);
    }

    /**
     * Sets the animation asset ID for a given animation type.
     * @param animType The animation type.
     * @param id The asset ID for the animation.
     * @returns This NPC instance.
     */
    setAnimation(animType: NPCAnimationType, id: number) {
        this.animationsPerType.set(animType, id);
        return this;
    }

    /**
     * Sets the default dialogue for this NPC.
     * @param defaultDialogue The default Dialogue instance.
     * @returns This NPC instance.
     */
    setDefaultDialogue(defaultDialogue: Dialogue) {
        this.defaultDialogue = defaultDialogue;
        return this;
    }

    /**
     * Creates and sets a default monologue Dialogue for this NPC.
     * @param text The monologue text.
     * @returns The created Dialogue instance.
     */
    createDefaultMonologue(text: string) {
        this.defaultDialogue = new Dialogue(this, text);
        return this.defaultDialogue;
    }

    /**
     * Registers a callback to run when the NPC is interacted with.
     * @param callback The interaction callback.
     */
    onInteract(callback?: () => void) {
        this.interact = callback;
    }
}

/**
 * An empty NPC instance for default or placeholder use.
 */
export const EMPTY_NPC = new NPC();

/**
 * Represents a dialogue node for NPCs, supporting monologues, choices, and dialogue chaining.
 */
export class Dialogue {

    npc: NPC;
    text: string;
    choices = new Map<string, Dialogue>();
    nextDialogue: Dialogue | undefined = undefined;
    root: Dialogue;

    /**
     * Constructs a new Dialogue instance.
     * @param npc The NPC associated with this dialogue.
     * @param text The dialogue text.
     * @param root The root dialogue node (optional).
     */
    constructor(npc: NPC, text: string, root?: Dialogue) {
        this.npc = npc;
        this.text = text;
        this.root = root ?? this;
    }

    /**
     * Creates a following Dialogue instance as a monologue.
     * @param text The monologue text.
     * @returns The following Dialogue instance.
     */
    monologue(text: string) {
        return this.next(new Dialogue(this.npc, text, this.root));
    }

    /**
     * Adds a Dialogue instance to follow the current Dialogue.
     * @param dialogue The Dialogue to add.
     * @returns The added Dialogue instance.
     */
    next(dialogue: Dialogue) {
        dialogue.root = this.root;
        this.nextDialogue = dialogue;
        return dialogue;
    }
}