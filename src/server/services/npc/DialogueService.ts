import Signal from "@antivivi/lemon-signal";
import { loadAnimation } from "@antivivi/vrldk";
import { OnInit, Service } from "@flamework/core";
import { Players, TweenService, Workspace } from "@rbxts/services";
import { DataService } from "server/services/serverdata/DataService";
import { NPCS, NPC_MODELS, getDisplayName } from "shared/constants";
import { ASSETS, getSound } from "shared/GameAssets";
import NPC, { Dialogue, NPCAnimationType } from "shared/NPC";
import Packets from "shared/Packets";

declare global {
    interface Assets {
        NPCNotification: BillboardGui & {
            ImageLabel: ImageLabel;
        };
    }
}

@Service()
export class DialogueService implements OnInit {

    dialogueFinished = new Signal<(dialogue: Dialogue) => void>();
    npcPerName = new Map<string, NPC>();
    modelPerNPC = new Map<NPC, Model>();
    runningAnimationsPerNPC = new Map<NPC, Map<string, AnimationTrack>>();
    dialoguePerNPC = new Map<NPC, Map<Dialogue, number>>();
    animationsPerNPC = new Map<NPC, Map<NPCAnimationType, AnimationTrack>>();
    defaultLocationsPerNPC = new Map<NPC, CFrame>();
    proximityPrompts = new Set<ProximityPrompt>();
    currentDialogue: Dialogue | undefined;
    isInteractionEnabled = true;

    constructor(private dataService: DataService) {

    }

    addDialogue(npc: NPC, dialogue: Dialogue, priority?: number) {
        this.dialoguePerNPC.get(npc)!.set(dialogue, priority ?? 1);
    }

    removeDialogue(npc: NPC, dialogue: Dialogue) {
        this.dialoguePerNPC.get(npc)!.delete(dialogue);
    }

    talk(dialogue: Dialogue, requireInteraction?: boolean) {
        const dialogues = this.extractDialogue(dialogue);
        const size = dialogues.size();
        let i = 0;
        const nextDialogue = () => {
            const current = dialogues[i];
            const currentIndex = ++i;
            if (currentIndex > size) {
                this.dialogueFinished.fire(dialogue);
                this.enableInteraction();
                return true;
            }
            const talkingModel = current.npc === undefined ? undefined : this.modelPerNPC.get(current.npc);
            this.disableInteraction();
            if (talkingModel === undefined) {
                Packets.npcMessage.fireAll(current.text, currentIndex, size, true, Workspace);
            }
            else {
                let playersPrompted = 0;
                const players = Players.GetPlayers();
                const talkingPart = talkingModel.FindFirstChildOfClass("Humanoid")?.RootPart;
                for (const player of players) {
                    const rootPart = player.Character?.FindFirstChildOfClass("Humanoid")?.RootPart;
                    const isPrompt = talkingPart !== undefined &&
                        (requireInteraction !== false && rootPart !== undefined && rootPart.Position.sub(talkingPart.Position).Magnitude < 60);
                    if (isPrompt === true) {
                        ++playersPrompted;
                    }
                    Packets.npcMessage.fire(player, current.text, currentIndex, size, isPrompt, talkingModel);
                }
                task.delay(current.text.size() / 11 + 1, () => {
                    if (i === currentIndex)
                        nextDialogue();
                });
            }
            return false;
        };
        Packets.nextDialogue.onInvoke(() => nextDialogue());
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
        if (this.dataService.isPublicServer)
            NPC_MODELS.WaitForChild("Name Changer").Destroy();

        const npcModels = NPC_MODELS.GetChildren();

        for (const npcModel of npcModels) {
            if (!npcModel.IsA("Model")) {
                continue;
            }

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

            
            const prompt = new ProximityPrompt();
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

            const npcScript = NPCS.FindFirstChild(npcModel.Name);
            if (npcScript === undefined) {
                warn(npcModel.Name + " does not have a script");
                continue;
            }
            const npc = require(npcScript as ModuleScript) as NPC;
            this.npcPerName.set(npcScript.Name, npc);
            this.animationsPerNPC.set(npc, new Map());

            if (npc === undefined) {
                warn("Cannot find NPC for " + npcModel.Name);
                continue;
            }
            this.modelPerNPC.set(npc, npcModel);
            this.runningAnimationsPerNPC.set(npc, new Map());
            this.dialoguePerNPC.set(npc, new Map());

            prompt.Triggered.Connect((player) => {
                print(`${player.Name} interacted`);
                if (npc.interact !== undefined) {
                    npc.interact();
                    return;
                }
                const availableDialogues = this.dialoguePerNPC.get(npc)!;
                let highestPriority: number | undefined, highestDialogue: Dialogue | undefined;
                for (const [dialogue, priority] of availableDialogues) {
                    if (highestPriority === undefined || priority > highestPriority) {
                        highestDialogue = dialogue;
                        highestPriority = priority;
                    }
                }
                this.talk(highestDialogue ?? npc.defaultDialogue);
            });
            this.proximityPrompts.add(prompt);

            const parts = npcModel.GetDescendants();
            for (const part of parts) {
                if (part.IsA("BasePart")) {
                    part.CollisionGroup = "NPC";
                }
            }
            humanoid.RootPart!.CustomPhysicalProperties = new PhysicalProperties(100, 0.3, 0.5);
            this.defaultLocationsPerNPC.set(npc, humanoid.RootPart!.CFrame);
            this.playAnimation(npc, "Default");
            humanoid.Running.Connect((speed) => {
                if (speed > 0)
                    this.playAnimation(npc, "Walk");
                else
                    this.stopAnimation(npc, "Walk");
            });
            let last = humanoid.RootPart!.Position;
            task.spawn(() => {
                while (task.wait(1)) {
                    const newPosition = humanoid.RootPart!.Position;
                    if (newPosition.sub(last).Magnitude < 1) {
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