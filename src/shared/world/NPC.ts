import { Workspace } from "@rbxts/services";

/**
 * Represents the animation types available for NPCs.
 */
export type NPCAnimationType = "Default" | "Walk" | "Run" | "Jump";

export const NPC_MODELS = Workspace.WaitForChild("NPCs") as Folder;

/**
 * Represents a non-player character (NPC) with animations, dialogue, and interaction logic.
 */
export default class NPC {
    animationsPerType = new Map<NPCAnimationType, number>();
    defaultDialogues = new Array<Dialogue>();
    defaultName: string;
    interact: (() => void) | undefined;

    constructor(private readonly id: string) {
        this.defaultName = id;
        this.animationsPerType.set("Walk", 180426354);
        this.animationsPerType.set("Jump", 125750702);
    }

    setDefaultName(name: string) {
        this.defaultName = name;
        return this;
    }

    /**
     * Sets the animation asset ID for a given animation type.
     * @param animType The animation type.
     * @param assetId The asset ID for the animation.
     * @returns This NPC instance.
     */
    setAnimation(animType: NPCAnimationType, assetId: number) {
        this.animationsPerType.set(animType, assetId);
        return this;
    }

    /**
     * Add dialogue that the NPC uses when no other dialogue is available.
     * All default dialogues are sequentially exhausted, and only the last one will be repeated.
     *
     * @param defaultDialogue The default Dialogue instance.
     * @returns This NPC instance.
     */
    addDefaultDialogue(defaultDialogue: Dialogue) {
        this.defaultDialogues.push(defaultDialogue);
        return this;
    }

    /**
     * Creates and sets a default monologue Dialogue for this NPC.
     *
     * @param text The monologue text.
     * @returns The created Dialogue instance.
     */
    createDefaultMonologue(text: string) {
        const dialogue = new Dialogue(this, text);
        this.addDefaultDialogue(dialogue);
        return dialogue;
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
export const EMPTY_NPC = new NPC("Empty");

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
