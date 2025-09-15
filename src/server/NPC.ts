import { loadAnimation } from "@antivivi/vrldk";
import { Workspace } from "@rbxts/services";
import { IS_CI } from "shared/Context";
import { HotReloader, Reloadable } from "shared/HotReload";

/**
 * Represents the animation types available for NPCs.
 */
export type NPCAnimationType = "Default" | "Walk" | "Run" | "Jump";

export const NPC_MODELS = Workspace.WaitForChild("NPCs") as Folder;

/**
 * Represents a non-player character (NPC) with animations, dialogue, and interaction logic.
 */
export default class NPC extends Reloadable {
    static readonly HOT_RELOADER = new HotReloader<NPC>(script.Parent!.WaitForChild("npcs"));

    readonly animAssetIdPerType = new Map<NPCAnimationType, number>();
    readonly defaultDialogues = new Array<Dialogue>();
    readonly animTrackPerType = new Map<NPCAnimationType, AnimationTrack>();
    readonly runningAnimTrackPerType = new Map<NPCAnimationType, AnimationTrack>();

    defaultName: string;
    startingCFrame = new CFrame();

    initialModelSnapshot?: Model;
    model?: Model;
    humanoid?: Humanoid;
    rootPart?: BasePart;
    interact?: () => void;
    cleanup?: () => void;

    constructor(public readonly id: string) {
        super();
        this.defaultName = id;
        this.animAssetIdPerType.set("Walk", 180426354);
        this.animAssetIdPerType.set("Jump", 125750702);
        if (id === "Empty") return; // Early return for empty NPC

        this.cleanup = this.load();
    }

    /** Loads the NPC model and initializes its properties. */
    private loadModel(model = NPC_MODELS.FindFirstChild(this.id) as Model | undefined) {
        this.model = model;
        if (model === undefined) {
            warn(`NPC model not found for ID: ${this.id}`);
        } else {
            this.initialModelSnapshot = model.Clone();
            this.startingCFrame = model.GetPivot();

            this.humanoid = model.FindFirstChildOfClass("Humanoid") as Humanoid | undefined;
            if (this.humanoid === undefined) {
                warn(`Humanoid not found for NPC ID: ${this.id}`);
            } else {
                this.humanoid.DisplayName = this.defaultName;

                this.rootPart = this.humanoid.RootPart as BasePart | undefined;
                if (this.rootPart === undefined) {
                    warn(`RootPart not found for NPC ID: ${this.id}`);
                }
            }
        }
    }

    private load() {
        if (IS_CI) return;
        this.loadModel();
        const model = this.model;
        const humanoid = this.humanoid;
        const rootPart = this.rootPart;
        if (model === undefined || humanoid === undefined || rootPart === undefined) return;

        const parts = model.GetDescendants();
        for (const part of parts) {
            if (part.IsA("BasePart")) {
                part.CollisionGroup = "NPC";
            }
        }
        rootPart.CustomPhysicalProperties = new PhysicalProperties(100, 0.3, 0.5);

        // Always play the default animation when loaded
        this.playAnimation("Default");

        // Track the NPC's position and stop the walk animation if it hasn't moved
        let active = true;
        let last = humanoid.RootPart?.Position;
        task.spawn(() => {
            while (task.wait(1)) {
                if (active === false) break;
                const rootPart = humanoid.RootPart;
                if (rootPart === undefined) {
                    continue;
                }

                const newPosition = rootPart.Position;
                if (last === undefined || newPosition.sub(last).Magnitude < 1) {
                    last = newPosition;
                    this.stopAnimation("Walk");
                }
            }
        });

        // Automatically play walk and jump animations based on humanoid events
        const runningConnection = humanoid.Running.Connect((speed) => {
            if (speed > 0) this.playAnimation("Walk");
            else this.stopAnimation("Walk");
        });
        const jumpingConnection = humanoid.Jumping.Connect((active) => {
            if (active) this.playAnimation("Jump");
            else this.stopAnimation("Jump");
        });

        return () => {
            active = false;
            runningConnection.Disconnect();
            jumpingConnection.Disconnect();
        };
    }

    /**
     * Plays the specified animation type on the NPC.
     * @param animType The type of animation to play.
     * @returns True if the animation was successfully played, false otherwise.
     */
    playAnimation(animType: NPCAnimationType): boolean {
        const anim = this.animAssetIdPerType.get(animType);
        if (anim === undefined) return false;
        const humanoid = this.humanoid;
        if (humanoid === undefined) return false;

        let animTrack = this.animTrackPerType.get(animType);
        if (animTrack === undefined) {
            animTrack = loadAnimation(humanoid, anim);
            if (animTrack === undefined) return false;
            this.animTrackPerType.set(animType, animTrack);
        }
        if (!animTrack.IsPlaying) animTrack.Play();
        this.runningAnimTrackPerType.set(animType, animTrack);
        return true;
    }

    /**
     * Stops the specified animation type on the NPC.
     * @param animType The type of animation to stop.
     * @returns True if the animation was successfully stopped, false otherwise.
     */
    stopAnimation(animType: NPCAnimationType): boolean {
        const animTrack = this.runningAnimTrackPerType.get(animType);
        if (animTrack === undefined) return false;

        animTrack.Stop();
        return true;
    }

    /** Reveals the actual name (ID) of the NPC. */
    revealActualName() {
        if (this.humanoid !== undefined) {
            this.humanoid.DisplayName = this.id;
        }
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
        this.animAssetIdPerType.set(animType, assetId);
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

    unload(): void {
        for (const [, animTrack] of this.animTrackPerType) {
            animTrack.Stop();
        }
        if (this.model !== undefined && this.initialModelSnapshot !== undefined && !IS_CI) {
            const recovered = this.initialModelSnapshot.Clone();
            recovered.Parent = this.model.Parent;
            this.model.Destroy();
        }
        this.cleanup?.();
        table.clear(this);
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
