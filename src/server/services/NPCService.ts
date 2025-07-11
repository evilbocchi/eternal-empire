import { OnInit, OnStart, Service } from "@flamework/core";
import { RunService, TweenService } from "@rbxts/services";
import NPC, { Dialogue, NPCAnimationType } from "shared/NPC";
import { ASSETS, NPCS, NPC_MODELS, getDisplayName, getSound } from "shared/constants";
import { Fletchette, RemoteFunc, RemoteSignal, Signal } from "@antivivi/fletchette";
import { loadAnimation } from "shared/utils/vrldk/RigUtils";

declare global {
    interface FletchetteCanisters {
        NPCCanister: typeof NPCCanister;
    }
}

const NPCCanister = Fletchette.createCanister("NPCCanister", {
    npcMessage: new RemoteSignal<(npc: Model | undefined, message: string, pos: number, end: number) => void>(),
    nextDialogue: new RemoteFunc<() => boolean>(),
});

@Service()
export class NPCService implements OnInit, OnStart {

    dialogueFinished = new Signal<(dialogue: Dialogue) => void>();
    npcPerName = new Map<string, NPC>();
    modelPerNPC = new Map<NPC, Model>();
    runningAnimationsPerNPC = new Map<NPC, Map<string, AnimationTrack>>();
    dialoguePerNPC = new Map<NPC, Set<Dialogue>>();
    animationsPerNPC = new Map<NPC, Map<NPCAnimationType, AnimationTrack>>();
    proximityPrompts = new Set<ProximityPrompt>();
    isInteractionEnabled = true;

    addDialogue(npc: NPC, dialogue: Dialogue) {
        this.dialoguePerNPC.get(npc)!.add(dialogue);
    }

    removeDialogue(npc: NPC, dialogue: Dialogue) {
        this.dialoguePerNPC.get(npc)!.delete(dialogue);
    }

    talk(dialogue: Dialogue) {
        const dialogues = this.extractDialogue(dialogue);
        const size = dialogues.size();
        let i = 0;
        const nextDialogue = () => {
            const current = dialogues[i];
            const currentIndex = i + 1;
            if (currentIndex > size) {
                this.dialogueFinished.fire(dialogue);
                this.enableInteraction();
                return true;
            }
            ++i;
            const talkingModel = current.npc === undefined ? undefined : this.modelPerNPC.get(current.npc);
            this.disableInteraction();
            NPCCanister.npcMessage.fireAll(talkingModel, current.text, currentIndex, size);
            return false;
        }
        NPCCanister.nextDialogue.onInvoke(() => nextDialogue());
        nextDialogue();
    }

    enableInteraction() {
        for (const proximityPrompt of this.proximityPrompts) {
            proximityPrompt.Enabled = true;
        }
        this.isInteractionEnabled = true;
    }

    disableInteraction() {
        for (const proximityPrompt of this.proximityPrompts) {
            proximityPrompt.Enabled = false;
        }
        this.isInteractionEnabled = false;
    }

    extractDialogue(dialogue: Dialogue) {
        let current = dialogue;
        const dialogues = [dialogue];
        while (current !== undefined) {
            const nextDialogue = current.nextDialogue;
            if (nextDialogue === undefined)
                break;
            dialogues.push(nextDialogue);
            current = nextDialogue;
        }
        return dialogues;
    }

    playAnimation(npc: NPC, animType: NPCAnimationType) {
        const anim = npc.animationsPerType.get(animType);
        if (anim === undefined)
            return false;
        const humanoid = this.modelPerNPC.get(npc)?.FindFirstChildOfClass("Humanoid");
        if (humanoid === undefined)
            return false;
        let animTrack = this.animationsPerNPC.get(npc)!.get(animType);
        if (animTrack === undefined) {
            animTrack = loadAnimation(humanoid, anim);
            if (animTrack === undefined)
                return false;
            this.animationsPerNPC.get(npc)!.set(animType, animTrack);
        }
        const runningAnimations = this.runningAnimationsPerNPC.get(npc)!;
        if (!animTrack.IsPlaying)
            animTrack.Play();
        runningAnimations.set(animType, animTrack);
        return true;
    }

    stopAnimation(npc: NPC, animType: NPCAnimationType) {
        const animTrack = this.runningAnimationsPerNPC.get(npc)!.get(animType);
        if (animTrack !== undefined) {
            animTrack.Stop();
            return true;
        }
        return false;
    }

    onInit() {
        const npcScripts = NPCS.GetDescendants();
        if (npcScripts === undefined)
            error("wtf");
        for (const npcScript of npcScripts) {
            if (npcScript.IsA("ModuleScript")) {
                const npc = require(npcScript) as NPC;
                this.npcPerName.set(npcScript.Name, npc);
                this.animationsPerNPC.set(npc, new Map());
            }
        }
    }

    onStart() {
        const npcModels = NPC_MODELS.GetChildren();
        for (const npcModel of npcModels) {
            if (npcModel.IsA("Model")) {
                const humanoid = npcModel.FindFirstChildOfClass("Humanoid");
                if (humanoid === undefined) {
                    warn(npcModel.Name + " does not have Humanoid");
                    continue;
                }
                humanoid.RootPart!.Anchored = true;
                const indicator = ASSETS.NPCNotification.Clone();
                indicator.Enabled = true;
                indicator.Parent = npcModel.WaitForChild("Head");
                const showIndicator = TweenService.Create(indicator.ImageLabel, new TweenInfo(0.3), { ImageTransparency: 0 });
                const hideIndicator = TweenService.Create(indicator.ImageLabel, new TweenInfo(0.15), { ImageTransparency: 1 });
                const prompt = new Instance("ProximityPrompt");
                prompt.GetPropertyChangedSignal("Enabled").Connect(() => {
                    if (prompt.Enabled)
                        showIndicator.Play();
                    else
                        hideIndicator.Play();
                });
                prompt.ObjectText = getDisplayName(humanoid);
                prompt.ActionText = "Interact";
                prompt.Enabled = true;
                prompt.MaxActivationDistance = 6.5;
                prompt.RequiresLineOfSight = false;
                prompt.Parent = npcModel;
                getSound("Ding").Clone().Parent = npcModel.PrimaryPart;
                const npc = this.npcPerName.get(npcModel.Name);
                if (npc === undefined) {
                    warn("Cannot find NPC for " + npcModel.Name);
                    continue;
                }
                this.modelPerNPC.set(npc, npcModel);
                this.runningAnimationsPerNPC.set(npc, new Map());
                this.dialoguePerNPC.set(npc, new Set());

                prompt.Triggered.Connect((player) => {
                    print(`${player.Name} interacted`);
                    let isOveridden = false;
                    const availableDialogues = this.dialoguePerNPC.get(npc)!;
                    for (const dialogue of availableDialogues) {
                        isOveridden = true;
                        this.talk(dialogue);
                        break;
                    }
                    if (isOveridden === false) {
                        this.talk(npc.defaultDialogue);
                    }
                });
                this.proximityPrompts.add(prompt);

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
                let last = humanoid.RootPart!.Position;
                let t = 0;
                RunService.Heartbeat.Connect((dt) => {
                    t += dt;
                    if (t > 0.5) {
                        t = 0;
                        const newPosition = humanoid.RootPart!.Position;
                        if (this.runningAnimationsPerNPC.get(npc)?.has("Walk") && newPosition.sub(last).Magnitude < 1) {
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
            }
        }
    }
}