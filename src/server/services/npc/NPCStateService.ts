import { loadAnimation } from "@antivivi/vrldk";
import { Modding, OnInit, Service } from "@flamework/core";
import { NPC_MODELS, NPCS } from "shared/constants";
import NPC, { NPCAnimationType } from "shared/NPC";

declare global {

    /**
     * Interface representing the information associated with an NPC.
     */
    interface NPCInfo {
        name: string;
        npc: NPC;
        model: Model;
        humanoid: Humanoid;
        rootPart: BasePart;
        animations: Map<NPCAnimationType, AnimationTrack>;
        runningAnimations: Map<NPCAnimationType, AnimationTrack>;
        defaultLocation: CFrame;
    }
}

export interface OnNPCLoad {

    /**
     * Called when an NPC is loaded into the game.
     * This can be used to initialize NPC-specific logic or state.
     * 
     * @param npcInfo The information about the loaded NPC.
     */
    onNPCLoad(npcInfo: NPCInfo): void;
}

@Service()
export default class NPCStateService implements OnInit {

    /**
     * Map of NPC to their loaded information.
     */
    private readonly infoPerNPC = new Map<NPC, NPCInfo>();

    /**
     * Gets the information associated with a given NPC.
     * 
     * @param npc The NPC to get information for.
     * @returns The NPCInfo if available, undefined otherwise.
     */
    getInfo(npc: NPC): NPCInfo | undefined {
        return this.infoPerNPC.get(npc);
    }

    /**
     * Plays an animation of a given type on an NPC.
     * 
     * @param npc The NPC to animate.
     * @param animType The type of animation to play.
     * @returns True if the animation was played, false otherwise.
     */
    playAnimation(npc: NPC, animType: NPCAnimationType): boolean {
        const anim = npc.animationsPerType.get(animType);
        if (anim === undefined)
            return false;

        const npcInfo = this.infoPerNPC.get(npc);
        if (npcInfo === undefined)
            return false;

        let animTrack = npcInfo.animations.get(animType);
        if (animTrack === undefined) {
            animTrack = loadAnimation(npcInfo.humanoid, anim);
            if (animTrack === undefined)
                return false;
            npcInfo.animations.set(animType, animTrack);
        }
        if (!animTrack.IsPlaying)
            animTrack.Play();
        npcInfo.runningAnimations.set(animType, animTrack);
        return true;
    }

    /**
     * Stops a running animation of a given type on an NPC.
     * 
     * @param npc The NPC to stop animating.
     * @param animType The type of animation to stop.
     * @returns True if the animation was stopped, false otherwise.
     */
    stopAnimation(npc: NPC, animType: NPCAnimationType): boolean {
        const npcInfo = this.infoPerNPC.get(npc);
        if (npcInfo === undefined)
            return false;

        const animTrack = npcInfo.runningAnimations.get(animType);
        if (animTrack === undefined)
            return false;

        animTrack.Stop();
        return true;
    }

    /**
     * Loads an NPC model and initializes its state.
     * 
     * @param npcModel The model of the NPC to load.
     */
    loadNPC(npcModel: Model): NPCInfo | undefined {
        const humanoid = npcModel.FindFirstChildOfClass("Humanoid");
        if (humanoid === undefined) {
            warn(npcModel.Name + " does not have Humanoid");
            return;
        }
        humanoid.RootPart!.Anchored = true;


        const npcScript = NPCS.FindFirstChild(npcModel.Name);
        if (npcScript === undefined) {
            warn(npcModel.Name + " does not have a script");
            return;
        }
        const npc = require(npcScript as ModuleScript) as NPC;
        if (npc === undefined) {
            warn("Cannot find NPC for " + npcModel.Name);
            return;
        }

        const npcInfo = {
            npc,
            model: npcModel,
            name: npcScript.Name,
            humanoid: humanoid as Humanoid,
            rootPart: humanoid.RootPart!,
            animations: new Map<NPCAnimationType, AnimationTrack>(),
            runningAnimations: new Map<NPCAnimationType, AnimationTrack>(),
            defaultLocation: humanoid.RootPart!.CFrame
        };
        this.infoPerNPC.set(npc, npcInfo);

        const parts = npcModel.GetDescendants();
        for (const part of parts) {
            if (part.IsA("BasePart")) {
                part.CollisionGroup = "NPC";
            }
        }
        humanoid.RootPart!.CustomPhysicalProperties = new PhysicalProperties(100, 0.3, 0.5);
        this.playAnimation(npc, "Default");
        humanoid.Running.Connect((speed) => {
            if (speed > 0)
                this.playAnimation(npc, "Walk");
            else
                this.stopAnimation(npc, "Walk");
        });
        let last = humanoid.RootPart?.Position;
        task.spawn(() => {
            while (task.wait(1)) {
                const rootPart = humanoid.RootPart;
                if (rootPart === undefined) {
                    continue;
                }

                const newPosition = rootPart.Position;
                if (last === undefined || newPosition.sub(last).Magnitude < 1) {
                    last = newPosition;
                    this.stopAnimation(npc, "Walk");
                }
            }
        });
        humanoid.Jumping.Connect((active) => {
            if (active)
                this.playAnimation(npc, "Jump");
            else
                this.stopAnimation(npc, "Jump");
        });

        return npcInfo;
    }

    onInit() {
        const npcModels = NPC_MODELS.GetChildren();
        const listeners = new Set<OnNPCLoad>();
        Modding.onListenerAdded<OnNPCLoad>((object) => listeners.add(object));
        Modding.onListenerRemoved<OnNPCLoad>((object) => listeners.delete(object));

        for (const npcModel of npcModels) {
            if (!npcModel.IsA("Model")) {
                continue;
            }

            const npcInfo = this.loadNPC(npcModel);
            if (npcInfo === undefined) {
                continue;
            }

            for (const listener of listeners) {
                task.spawn(() => listener.onNPCLoad(npcInfo));
            }
        }
    }
}