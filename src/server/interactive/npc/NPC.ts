import Signal from "@antivivi/lemon-signal";
import { getRootPart, loadAnimation } from "@antivivi/vrldk";
import { PathfindingService, Players, RunService, TweenService, Workspace } from "@rbxts/services";
import { ASSETS, playSound } from "shared/asset/GameAssets";
import { getDisplayName } from "shared/constants";
import { IS_CI } from "shared/Context";
import { HotReloader, Reloadable } from "shared/HotReload";
import Packets from "shared/Packets";

/**
 * Represents the animation types available for NPCs.
 */
export type NPCAnimationType = "Default" | "Walk" | "Run" | "Jump";

export const NPC_MODELS = Workspace.WaitForChild("NPCs") as Folder;

/**
 * Represents a non-player character (NPC) with animations, dialogue, and interaction logic.
 */
export default class NPC extends Reloadable {
    static readonly HOT_RELOADER = new HotReloader<NPC>(script.Parent!, new Set([script]));

    /** Material costs for pathfinding calculations. Higher costs make NPCs avoid certain materials. */
    static readonly PATHFINDING_COSTS = {
        Water: 20,
        Limestone: 20, // Ground beneath water
        SmoothPlastic: 10,
        Wood: 10,
        Plastic: 2,
    };

    /** Default parameters for NPC pathfinding operations. */
    static readonly PATHFINDING_PARAMS: AgentParameters = {
        Costs: this.PATHFINDING_COSTS,
        WaypointSpacing: 6,
    };

    readonly animAssetIdPerType = new Map<NPCAnimationType, number>();
    readonly defaultDialogues = new Array<Dialogue>();
    readonly priorityPerDialogue = new Map<Dialogue, number>();
    readonly animTrackPerType = new Map<NPCAnimationType, AnimationTrack>();
    readonly runningAnimTrackPerType = new Map<NPCAnimationType, AnimationTrack>();
    readonly runningPathfinds = new Set<RBXScriptConnection>();

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

    /**
     * Loads the NPC model, sets up its properties, and initializes animations and event listeners.
     * This method should be called after the NPC instance is created.
     * @returns The NPC instance for chaining.
     */
    load(): this {
        if (IS_CI) return this;
        this.loadModel();
        const model = this.model;
        const humanoid = this.humanoid;
        const rootPart = this.rootPart;
        if (model === undefined || humanoid === undefined || rootPart === undefined) return this;
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

        // Set up proximity prompt for NPC interaction
        const prompt = new Instance("ProximityPrompt");
        prompt.ActionText = "Interact";
        prompt.Enabled = true;
        prompt.MaxActivationDistance = 6.5;
        prompt.RequiresLineOfSight = false;
        prompt.AddTag("NPCPrompt");
        prompt.Parent = model;

        const updateDisplayName = () => {
            prompt.ObjectText = getDisplayName(humanoid);
        };
        const displayNameConnection = humanoid.GetPropertyChangedSignal("DisplayName").Connect(updateDisplayName);
        updateDisplayName();
        const defaultDialogues = this.defaultDialogues;
        let defaultDialogueIndex = 0;
        const defaultDialoguesCount = defaultDialogues.size();

        const promptConnection = prompt.Triggered.Connect((player) => {
            print(`${player.Name} interacted`);
            if (this.interact !== undefined) {
                this.interact();
                return;
            }
            let highestPriority: number | undefined, highestDialogue: Dialogue | undefined;
            for (const [dialogue, priority] of this.priorityPerDialogue) {
                if (highestPriority === undefined || priority > highestPriority) {
                    highestDialogue = dialogue;
                    highestPriority = priority;
                }
            }
            if (highestDialogue !== undefined) {
                highestDialogue.talk();
            } else {
                if (defaultDialogueIndex >= defaultDialoguesCount) defaultDialogueIndex = defaultDialogueIndex - 1;
                defaultDialogues[defaultDialogueIndex].talk();
                defaultDialogueIndex++;
            }
        });
        Dialogue.proximityPrompts.add(prompt);

        this.cleanup = () => {
            active = false;
            runningConnection.Disconnect();
            jumpingConnection.Disconnect();
            displayNameConnection.Disconnect();
            promptConnection.Disconnect();
        };
        return this;
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

    // Dialogue methods

    /**
     * Adds a dialogue with a specified priority for the NPC.
     * @param dialogue The Dialogue instance to add.
     * @param priority The priority of the dialogue (higher = more important).
     * @returns This NPC instance.
     */
    addDialogue(dialogue: Dialogue, priority = 1) {
        this.priorityPerDialogue.set(dialogue, priority);
        return this;
    }

    /**
     * Removes a dialogue from the NPC.
     * @param dialogue The Dialogue instance to remove.
     * @returns This NPC instance.
     */
    removeDialogue(dialogue: Dialogue) {
        this.priorityPerDialogue.delete(dialogue);
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

    // Pathfinding methods

    /**
     * Calculate waypoints for NPC navigation.
     *
     * @param source The starting position.
     * @param destination The target position.
     * @param params Pathfinding parameters.
     * @param retries Number of retry attempts.
     * @returns An array of waypoints or undefined if no path is found.
     */
    getWaypoints(
        source: Vector3,
        destination: Vector3,
        params = NPC.PATHFINDING_PARAMS,
        retries = 0,
    ): PathWaypoint[] | undefined {
        const humanoid = this.humanoid;
        const rootPart = this.rootPart;
        if (humanoid === undefined || rootPart === undefined) {
            warn("Humanoid or RootPart is undefined");
            return;
        }
        params.Costs = NPC.PATHFINDING_COSTS;
        const path = PathfindingService.CreatePath(params);
        path.ComputeAsync(source, destination);
        const waypoints = path.GetWaypoints();
        if (waypoints.isEmpty()) {
            warn("No path found");
            if (retries < 3) {
                return this.getWaypoints(source.add(new Vector3(0, 1, 0)), destination, params, retries + 1);
            }
            return;
        }
        return waypoints;
    }

    /**
     * Navigate the NPC through the given waypoints.
     * @param waypoints The waypoints to follow.
     * @param endCallback The callback to call when navigation ends.
     * @returns The connection object for the pathfinding operation.
     */
    pathfind(waypoints: PathWaypoint[], endCallback: () => unknown) {
        const humanoid = this.humanoid;
        if (humanoid === undefined) {
            warn("Humanoid is undefined");
            return;
        }
        const rootPart = humanoid.RootPart;
        if (rootPart === undefined) return;
        let i = 0;
        let newPos: Vector3 | undefined;

        const doNextWaypoint = () => {
            ++i;
            const nextWaypoint = waypoints[i];
            if (nextWaypoint !== undefined) {
                // Handle jump waypoints
                if (nextWaypoint.Action === Enum.PathWaypointAction.Jump) {
                    humanoid.Jump = true;
                    playSound("Jump.mp3", rootPart, (sound) => {
                        sound.Volume = 0.25;
                    });
                }
                newPos = nextWaypoint.Position;

                humanoid.MoveTo(newPos);
            } else {
                // Navigation complete
                connection.Disconnect();
                endCallback();
            }
        };

        let t = 0;
        const connection = RunService.Heartbeat.Connect((dt) => {
            if (newPos === undefined) return;
            t += dt;
            const dist = rootPart.Position.sub(newPos).mul(new Vector3(1, 0, 1)).Magnitude;

            // Check if close enough to waypoint
            if (dist < math.max(humanoid.WalkSpeed * 0.1875, 0.5)) {
                // allow more leeway for higher speeds
                t = 0;
                newPos = undefined;
                doNextWaypoint();
            }
            // Teleport if stuck for too long
            else if (t > math.max((5.6 * dist) / humanoid.WalkSpeed, 2)) {
                t = 0;
                rootPart.CFrame = new CFrame(newPos).add(new Vector3(0, humanoid.HipHeight, 0));
            }
        });

        doNextWaypoint();
        return connection;
    }

    /**
     * Calculates a function for guiding an NPC humanoid to a point.
     * This should preferably be called a moderate time before the NPC has to move, as pathfinding can take time.
     * @param source The starting position.
     * @param destination The target position.
     * @param requiresPlayer If false, the callbacks will be fired immediately without waiting for player proximity.
     * @param agentParams Optional pathfinding parameters.
     * @returns A function that can be called to start traversing the path.
     */
    createPathfindingOperation(
        source?: CFrame,
        destination?: CFrame,
        requiresPlayer?: boolean,
        agentParams = NPC.PATHFINDING_PARAMS,
    ) {
        const humanoid = this.humanoid;
        // Validate parameters
        if (humanoid === undefined) throw "npcHumanoid is undefined";
        if (source === undefined) throw "source is undefined";
        if (destination === undefined) throw "destination is undefined";
        humanoid.RootPart!.Anchored = false;

        // Cancel any ongoing pathfinding
        for (const connection of this.runningPathfinds) {
            connection.Disconnect();
        }
        this.runningPathfinds.clear();

        // Load waypoints and tweens
        let waypoints: PathWaypoint[] | undefined;
        task.spawn(() => {
            waypoints = this.getWaypoints(source.Position, destination.Position, agentParams);
            if (waypoints === undefined || waypoints.isEmpty()) {
                throw `No valid waypoints found from ${source.Position} to ${destination.Position} for ${humanoid.Parent?.Name}`;
            }
        });

        const tween = TweenService.Create(humanoid.RootPart!, new TweenInfo(1), { CFrame: destination });
        let toCall = false;

        /**
         * Starts the pathfinding operation.
         *
         * @param playTween Whether to play the tween animation.
         * @returns The response object containing waypoints and the fitting tween.
         */
        const start = (playTween = true) => {
            // Wait until waypoints are available
            while (waypoints === undefined) {
                task.wait();
            }

            const callbacks = new Set<() => unknown>();
            const body = {
                waypoints,
                fittingTween: tween,
                onComplete: (callback: () => unknown) => {
                    callbacks.add(callback);
                },
            };

            this.pathfind(waypoints, () => {
                if (playTween) tween.Play();
                if (requiresPlayer === false) {
                    toCall = true;
                }
            });

            const connection = RunService.Heartbeat.Connect(() => {
                const players = Players.GetPlayers();
                for (const player of players) {
                    const playerRootPart = getRootPart(player);
                    if (playerRootPart === undefined) continue;
                    if (destination.Position.sub(playerRootPart.Position).Magnitude < 10) {
                        if (playTween) tween.Play();
                        toCall = true;
                        connection.Disconnect();
                        return;
                    }
                }
            });
            task.spawn(() => {
                while (!toCall) {
                    RunService.Heartbeat.Wait();
                }
                print("Reached point", humanoid.Parent?.Name, destination.Position);
                for (const callback of callbacks) {
                    callback();
                }
                connection.Disconnect();
            });
            this.runningPathfinds.add(connection);
            return body;
        };
        return start;
    }

    // Hot reload cleanup

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
    static readonly finished = new Signal<(dialogue: Dialogue) => void>();
    static readonly proximityPrompts = new Set<ProximityPrompt>();
    static isInteractionEnabled = true;

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

    /**
     * Convenience method for adding a dialogue to its associated NPC with a specified priority.
     * @param dialogue The Dialogue instance to add.
     * @param priority The priority of the dialogue (higher = more important).
     */
    add(priority = 1) {
        this.npc.addDialogue(this, priority);
    }

    /**
     * Convenience method for removing a dialogue from its associated NPC.
     * @param dialogue The Dialogue instance to remove.
     */
    remove() {
        this.npc.removeDialogue(this);
    }

    /**
     * Extracts a sequence of dialogues starting from the given dialogue.
     * @param dialogue The starting dialogue.
     * @returns An array of dialogues in sequence.
     */
    private extractDialogue() {
        let current = this as Dialogue;
        const dialogues = [this] as Dialogue[];
        while (current !== undefined) {
            const nextDialogue = current.nextDialogue;
            if (nextDialogue === undefined) break;
            dialogues.push(nextDialogue);
            current = nextDialogue;
        }
        return dialogues;
    }

    /**
     * Begins a dialogue sequence, handling progression and player prompts.
     *
     * @param dialogue The starting dialogue.
     * @param requireInteraction If true, requires proximity for prompt.
     */
    talk(requireInteraction?: boolean) {
        const dialogues = this.extractDialogue();
        const size = dialogues.size();
        let i = 0;
        const nextDialogue = () => {
            const current = dialogues[i];
            const currentIndex = ++i;
            if (currentIndex > size) {
                Dialogue.finished.fire(this);
                Dialogue.enableInteraction();
                return true;
            }
            const talkingModel = current.npc.model;
            Dialogue.disableInteraction();
            if (talkingModel === undefined) {
                Packets.npcMessage.toAllClients(current.text, currentIndex, size, true, Workspace);
            } else {
                let playersPrompted = 0;
                const players = Players.GetPlayers();
                const talkingPart = talkingModel.FindFirstChildOfClass("Humanoid")?.RootPart;
                for (const player of players) {
                    const rootPart = player.Character?.FindFirstChildOfClass("Humanoid")?.RootPart;
                    const isPrompt =
                        talkingPart !== undefined &&
                        requireInteraction !== false &&
                        rootPart !== undefined &&
                        rootPart.Position.sub(talkingPart.Position).Magnitude < 60;
                    if (isPrompt === true) {
                        ++playersPrompted;
                    }
                    Packets.npcMessage.toClient(player, current.text, currentIndex, size, isPrompt, talkingModel);
                }
                task.delay(current.text.size() / 11 + 1, () => {
                    if (i === currentIndex) nextDialogue();
                });
            }
            return false;
        };
        Packets.nextDialogue.fromClient(() => nextDialogue());
        nextDialogue();
    }

    /**
     * Enables all proximity prompts and allows player interaction.
     */
    static enableInteraction() {
        for (const proximityPrompt of this.proximityPrompts) {
            proximityPrompt.Enabled = true;
        }
        this.isInteractionEnabled = true;
    }

    /**
     * Disables all proximity prompts and blocks player interaction.
     */
    static disableInteraction() {
        for (const proximityPrompt of this.proximityPrompts) {
            proximityPrompt.Enabled = false;
        }
        this.isInteractionEnabled = false;
    }
}

/**
 * Convenience class for creating dialogues without an associated NPC.
 */
export class Soliloquy extends Dialogue {
    constructor(text: string, root?: Dialogue) {
        super(EMPTY_NPC, text, root);
    }
}
