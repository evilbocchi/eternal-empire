/**
 * @fileoverview Handles NPC dialogue, interaction, and animation logic.
 *
 * This service manages:
 * - Dialogue state and progression for NPCs
 * - Proximity prompt setup and interaction
 * - Animation control for NPCs
 * - Dialogue priority and extraction
 * - Enabling/disabling player interaction with NPCs
 *
 * @since 1.0.0
 */

import Signal from "@antivivi/lemon-signal";
import { OnInit, OnStart, Service } from "@flamework/core";
import { Players, ProximityPromptService, TweenService, Workspace } from "@rbxts/services";
import NPCStateService, { OnNPCLoad } from "server/services/npc/NPCStateService";
import DataService from "server/services/data/DataService";
import { ASSETS } from "shared/asset/GameAssets";
import { NPC_MODELS, getDisplayName } from "shared/constants";
import InteractableObject from "shared/InteractableObject";
import { Server } from "shared/item/ItemUtils";
import NPC, { Dialogue } from "shared/NPC";
import Packets from "shared/Packets";

declare global {
    /**
     * BillboardGui asset for NPC notifications.
     */
    interface Assets {
        NPCNotification: BillboardGui & {
            ImageLabel: ImageLabel;
        };
    }
}

/**
 * Service that manages all NPC dialogue, cutscenes, and related player interactions.
 */
@Service()
export default class DialogueService implements OnInit, OnStart, OnNPCLoad {
    /**
     * Signal fired when a dialogue sequence finishes.
     * @param dialogue The dialogue that finished.
     */
    readonly dialogueFinished = new Signal<(dialogue: Dialogue) => void>();

    /**
     * Map of NPC to their dialogues and priorities.
     */
    readonly dialoguePerNPC = new Map<NPC, Map<Dialogue, number>>();

    /**
     * Set of all active proximity prompts for NPCs.
     */
    readonly proximityPrompts = new Set<ProximityPrompt>();

    /**
     * The currently active dialogue, if any.
     */
    currentDialogue: Dialogue | undefined;

    /**
     * Whether player interaction with NPCs is enabled.
     */
    isInteractionEnabled = true;

    constructor(private dataService: DataService, private npcStateService: NPCStateService) {

    }

    /**
     * Adds a dialogue to an NPC with an optional priority.
     * 
     * @param dialogue The dialogue to add.
     * @param priority The priority of the dialogue (higher = more important).
     * @param npc The NPC to add the dialogue to. If not provided, uses the dialogue's NPC.
     */
    addDialogue(dialogue: Dialogue, priority?: number, npc?: NPC) {
        npc ??= dialogue.npc;
        let dialogues = this.dialoguePerNPC.get(npc);
        if (dialogues === undefined) {
            dialogues = new Map<Dialogue, number>();
            this.dialoguePerNPC.set(npc, dialogues);
        }
        dialogues.set(dialogue, priority ?? 1);
    }

    /**
     * Removes a dialogue from an NPC.
     * 
     * @param dialogue The dialogue to remove.
     * @param npc The NPC to remove the dialogue from. If not provided, uses the dialogue's NPC.
     */
    removeDialogue(dialogue: Dialogue, npc?: NPC) {
        npc ??= dialogue.npc;
        this.dialoguePerNPC.get(npc)?.delete(dialogue);
    }

    /**
     * Begins a dialogue sequence, handling progression and player prompts.
     * 
     * @param dialogue The starting dialogue.
     * @param requireInteraction If true, requires proximity for prompt.
     */
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
            const talkingModel = current.npc === undefined ? undefined : this.npcStateService.getInfo(current.npc)?.model;
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

    /**
     * Enables all proximity prompts and allows player interaction.
     */
    enableInteraction() {
        for (const proximityPrompt of this.proximityPrompts) {
            proximityPrompt.Enabled = true;
        }
        this.isInteractionEnabled = true;
    }

    /**
     * Disables all proximity prompts and blocks player interaction.
     */
    disableInteraction() {
        for (const proximityPrompt of this.proximityPrompts) {
            proximityPrompt.Enabled = false;
        }
        this.isInteractionEnabled = false;
    }

    /**
     * Extracts a sequence of dialogues starting from the given dialogue.
     * 
     * @param dialogue The starting dialogue.
     * @returns An array of dialogues in sequence.
     */
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

    /**
     * Initializes the DialogueService, setting up NPCs, prompts, and animations.
     * Destroys the name changer NPC in public servers.
     */
    onInit() {
        if (this.dataService.isPublicServer)
            NPC_MODELS.WaitForChild("Name Changer").Destroy();
    }

    onNPCLoad({ npc, model, humanoid }: NPCInfo) {
        const indicator = ASSETS.NPCNotification.Clone();
        indicator.Enabled = true;
        indicator.Parent = model.WaitForChild("Head");
        const showIndicator = TweenService.Create(indicator.ImageLabel, new TweenInfo(0.3), { ImageTransparency: 0 });
        const hideIndicator = TweenService.Create(indicator.ImageLabel, new TweenInfo(0.15), { ImageTransparency: 1 });


        // Set up proximity prompt for NPC interaction
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

        const defaultDialogues = npc.defaultDialogues;
        let defaultDialogueIndex = 0;
        const defaultDialoguesCount = defaultDialogues.size();

        prompt.Triggered.Connect((player) => {
            print(`${player.Name} interacted`);
            if (npc.interact !== undefined) {
                npc.interact();
                return;
            }
            const availableDialogues = this.dialoguePerNPC.get(npc) ?? new Map();
            let highestPriority: number | undefined, highestDialogue: Dialogue | undefined;
            for (const [dialogue, priority] of availableDialogues) {
                if (highestPriority === undefined || priority > highestPriority) {
                    highestDialogue = dialogue;
                    highestPriority = priority;
                }
            }
            if (highestDialogue !== undefined) {
                this.talk(highestDialogue);
            }
            else {
                if (defaultDialogueIndex >= defaultDialoguesCount)
                    defaultDialogueIndex = defaultDialogueIndex - 1;
                this.talk(defaultDialogues[defaultDialogueIndex]);
                defaultDialogueIndex++;
            }
        });
        this.proximityPrompts.add(prompt);

        prompt.Parent = model;
    }

    onStart() {
        ProximityPromptService.PromptTriggered.Connect((prompt, player) => {
            if (this.isInteractionEnabled === false || prompt.Parent === undefined)
                return;
            const interactableObject = InteractableObject.REGISTRY.get(prompt.Parent.Name);
            if (interactableObject === undefined)
                return;
            this.proximityPrompts.add(prompt);
            interactableObject.interacted.fire(Server, player);
        });
    }
}