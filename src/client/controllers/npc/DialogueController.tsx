/**
 * @fileoverview Client controller for managing NPC dialogue windows and chat integration.
 *
 * Handles:
 * - Displaying NPC dialogue windows and headshots
 * - Animating dialogue text and playing text sounds
 * - Integrating with chat channels and TextChatService for NPC messages
 * - Handling hotkeys and UI for progressing dialogue
 *
 * The controller manages dialogue UI, text animation, sound feedback, and chat integration for NPC interactions.
 *
 * @since 1.0.0
 */
import ComputeNameColor from "@antivivi/rbxnamecolor";
import { observeTag } from "@antivivi/vrldk";
import { Controller, OnInit, OnStart } from "@flamework/core";
import React from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { Debris, ReplicatedStorage, RunService, TextChatService, TweenService, Workspace } from "@rbxts/services";
import { INTERFACE } from "client/controllers/core/UIController";
import NPCNotification from "client/ui/components/npc/NPCNotification";
import { ASSETS, getSound } from "shared/asset/GameAssets";
import { getDisplayName, getTextChannels } from "shared/constants";
import Packets from "shared/Packets";

declare global {
    interface Assets {
        NPCTextSounds: Folder;
    }
}

export const DIALOGUE_WINDOW = INTERFACE.WaitForChild("DialogueWindow") as TextButton & {
    ViewportFrame: ViewportFrame;
    UIStroke: UIStroke;
    NameLabel: TextLabel;
    TextLabel: TextLabel;
    HintLabel: TextLabel;
};

/**
 * Controller responsible for managing NPC dialogue windows, text animation, and chat integration.
 *
 * Handles dialogue UI, text effects, sound, and chat for NPC interactions.
 */
@Controller()
export default class DialogueController implements OnInit, OnStart {
    npcTagColor = Color3.fromRGB(201, 255, 13).ToHex();
    emptyColor = Color3.fromRGB(0, 181, 28).ToHex();
    defaultTextSound = (function () {
        const defaultText = getSound("DefaultText.mp3").Clone();
        defaultText.Volume = 0.25;
        return defaultText;
    })();
    textSound = undefined as Sound | undefined;
    text = "";
    size = 0;
    i = 0;

    /**
     * Displays a headshot of the given model in the dialogue window's viewport.
     * @param model The NPC model to display.
     */
    showHeadshot(model: Model) {
        const viewportFrame = DIALOGUE_WINDOW.ViewportFrame;
        viewportFrame.ClearAllChildren();
        const camera = new Instance("Camera");
        camera.Parent = viewportFrame;
        viewportFrame.CurrentCamera = camera;
        const clone = model.Clone();

        // Anchor the model
        for (const part of clone.GetChildren()) {
            if (part.IsA("BasePart")) {
                part.Anchored = true;
            }
        }

        clone.PivotTo(new CFrame(0, 0, 0));

        // Set camera CFrame to focus on the head of the model
        const head = (clone.FindFirstChild("Head") as BasePart) ?? clone.PrimaryPart;
        if (head === undefined) {
            warn("NPC model does not have a Head or PrimaryPart.");
            return;
        }
        const headCFrame = head.CFrame;
        const distance = 1 + head.Size.Y;
        camera.CFrame = headCFrame.mul(CFrame.fromEulerAnglesXYZ(0, math.pi, 0)).mul(new CFrame(0, 0, distance));

        // Set the camera's field of view
        camera.FieldOfView = 70;
        clone.Parent = viewportFrame;
    }

    /**
     * Shows the dialogue window with the given name, text, and optional model headshot.
     * @param name The NPC's name.
     * @param text The dialogue text.
     * @param model The NPC model for headshot (optional).
     */
    async showDialogueWindow(name: string | undefined, text: string, model?: Model) {
        DIALOGUE_WINDOW.NameLabel.Text = name ?? "";

        if (DIALOGUE_WINDOW.Visible === false) {
            DIALOGUE_WINDOW.Position = new UDim2(0.5, 0, 1.2, 100);
        }
        const color =
            name === undefined ? Color3.fromRGB(165, 165, 165) : ComputeNameColor(name).Lerp(new Color3(), 0.3);
        DIALOGUE_WINDOW.BackgroundColor3 = color;
        DIALOGUE_WINDOW.UIStroke.Color = color;

        if (model !== undefined && model.IsA("Model") && model !== Workspace) {
            this.showHeadshot(model);
        }

        DIALOGUE_WINDOW.Visible = true;
        TweenService.Create(DIALOGUE_WINDOW, new TweenInfo(0.25, Enum.EasingStyle.Quad), {
            Position: new UDim2(0.5, 0, 0.975, -30),
        }).Play();
        this.text = text;
        this.size = text.size();
        this.i = 0;
    }

    /**
     * Hides the dialogue window and clears the viewport.
     */
    hideDialogueWindow() {
        const position = new UDim2(0.5, 0, 1.2, 100);
        TweenService.Create(DIALOGUE_WINDOW, new TweenInfo(0.25, Enum.EasingStyle.Quad), { Position: position }).Play();
        task.delay(0.25, () => {
            if (DIALOGUE_WINDOW.Position === position) DIALOGUE_WINDOW.Visible = false;
        });
        DIALOGUE_WINDOW.ViewportFrame.ClearAllChildren();
    }

    /**
     * Initializes the DialogueController, sets up NPC message listeners and chat integration.
     */
    onInit() {
        const channel = getTextChannels().WaitForChild("RBXGeneral") as TextChannel;
        Packets.npcMessage.fromServer((message, pos, endPos, prompt, model) => {
            const humanoid = model?.FindFirstChildOfClass("Humanoid");
            let name = undefined as string | undefined;

            if (model !== undefined && humanoid !== undefined) {
                name = getDisplayName(humanoid);
                channel.DisplaySystemMessage(
                    `<font color="#${this.npcTagColor}">[${pos}/${endPos}]</font> <font color="#${ComputeNameColor(name).ToHex()}">${name}:</font> ${message}`,
                    "tag:hidden",
                );
                TextChatService.DisplayBubble(model.WaitForChild("Head") as BasePart, message);
            } else {
                channel.DisplaySystemMessage(`<font color="#${this.emptyColor}">${message}</font>`, "tag:hidden");
            }
            this.textSound =
                model === undefined
                    ? undefined
                    : (ASSETS.NPCTextSounds.FindFirstChild(model.Name) as Sound | undefined);
            if (prompt === true) this.showDialogueWindow(name, message, model as Model);
        });

        const cleanupPerPrompt = new Map<ProximityPrompt, () => void>();
        observeTag(
            "NPCPrompt",
            (prompt) => {
                if (!prompt.IsA("ProximityPrompt") || cleanupPerPrompt.has(prompt)) return;
                const gui = new Instance("BillboardGui");
                gui.Active = true;
                gui.ClipsDescendants = true;
                gui.Size = new UDim2(2, 0, 2, 0);
                gui.StudsOffset = new Vector3(0, 4, 0);
                gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling;

                const root = createRoot(gui);
                cleanupPerPrompt.set(prompt, () => {
                    root.unmount();
                    gui.Destroy();
                });
                root.render(<NPCNotification prompt={prompt} />);

                gui.Parent = prompt.Parent;
            },
            (prompt) => {
                if (!prompt.IsA("ProximityPrompt")) return;
                const cleanup = cleanupPerPrompt.get(prompt);
                if (cleanup !== undefined) {
                    cleanup();
                    cleanupPerPrompt.delete(prompt);
                }
            },
        );
    }

    /**
     * Starts the DialogueController, sets up hotkeys and text animation for dialogue progression.
     */
    onStart() {
        const dialogueWindowClicked = () => {
            if (this.i < this.size) this.i = this.size - 1;
            else if (Packets.nextDialogue.toServer() === true) this.hideDialogueWindow();
        };
        // this.hotkeysController.bindKey(
        //     Enum.KeyCode.Return,
        //     () => {
        //         if (DIALOGUE_WINDOW.Visible === true) {
        //             dialogueWindowClicked();
        //             return true;
        //         }
        //         return false;
        //     },
        //     1,
        //     "Next Dialogue",
        // );
        DIALOGUE_WINDOW.Activated.Connect(() => dialogueWindowClicked());
        let t = 0;
        let minDt = 0.03;
        RunService.Heartbeat.Connect((dt) => {
            t += dt;
            if (t < minDt) return;
            t = 0;
            let isSpace = false;
            if (this.i < this.size) {
                DIALOGUE_WINDOW.HintLabel.Visible = false;
                ++this.i;
                isSpace = this.text.sub(this.i + 1, this.i + 1) === " ";
                if (isSpace === false) {
                    const sound = (this.textSound ?? this.defaultTextSound).Clone();
                    sound.Parent = ReplicatedStorage;
                    if (Packets.settings.get()?.SoundEffects) sound.Play();
                    Debris.AddItem(sound);
                }
            } else {
                DIALOGUE_WINDOW.HintLabel.Visible = true;
            }
            DIALOGUE_WINDOW.TextLabel.Text = this.text.sub(1, this.i + 1);
            const last = this.text.sub(this.i, this.i);
            const isPunctuation = last === "." || last === "?" || last === "!";
            minDt = isSpace ? (isPunctuation ? 0.3 : last === "," ? 0.15 : 0.03) : 0.03;
        });
    }
}
