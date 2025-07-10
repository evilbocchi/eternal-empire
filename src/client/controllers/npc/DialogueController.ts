import ComputeNameColor from "@antivivi/rbxnamecolor";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { Debris, ReplicatedStorage, RunService, TextChatService, TweenService, Workspace } from "@rbxts/services";
import HotkeysController from "client/controllers/core/HotkeysController";
import UIController, { INTERFACE } from "client/controllers/core/UIController";
import { ASSETS, getSound } from "shared/asset/GameAssets";
import { getDisplayName, getTextChannels } from "shared/constants";
import Packets from "shared/Packets";

declare global {
    interface Assets {
        NPCTextSounds: Folder;
    }
}

export const DIALOGUE_WINDOW = INTERFACE.WaitForChild("DialogueWindow") as TextButton & {
    ViewportFrame: ViewportFrame,
    UIStroke: UIStroke,
    NameLabel: TextLabel,
    TextLabel: TextLabel,
    HintLabel: TextLabel,
};

@Controller()
export default class DialogueController implements OnInit, OnStart {

    npcTagColor = Color3.fromRGB(201, 255, 13).ToHex();
    emptyColor = Color3.fromRGB(0, 181, 28).ToHex();
    defaultTextSound = getSound("DefaultText.mp3");
    textSound = undefined as Sound | undefined;
    text = "";
    size = 0;
    i = 0;

    constructor(private uiController: UIController, private hotkeysController: HotkeysController) {

    }

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
        const head = (clone.FindFirstChild("Head") as BasePart ?? clone.PrimaryPart);
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

    async showDialogueWindow(name: string | undefined, text: string, model?: Model) {
        DIALOGUE_WINDOW.NameLabel.Text = name ?? "";

        if (DIALOGUE_WINDOW.Visible === false) {
            DIALOGUE_WINDOW.Position = new UDim2(0.5, 0, 1.2, 100);
        }
        const color = name === undefined ? Color3.fromRGB(165, 165, 165) : ComputeNameColor(name).Lerp(new Color3(), 0.3);
        DIALOGUE_WINDOW.BackgroundColor3 = color;
        DIALOGUE_WINDOW.UIStroke.Color = color;

        if (model !== undefined && model.IsA("Model") && model !== Workspace) {
            this.showHeadshot(model);
        }

        DIALOGUE_WINDOW.Visible = true;
        TweenService.Create(DIALOGUE_WINDOW, new TweenInfo(0.25, Enum.EasingStyle.Quad), { Position: new UDim2(0.5, 0, 0.975, -30) }).Play();
        this.text = text;
        this.size = text.size();
        this.i = 0;
    }

    hideDialogueWindow() {
        const position = new UDim2(0.5, 0, 1.2, 100);
        TweenService.Create(DIALOGUE_WINDOW, new TweenInfo(0.25, Enum.EasingStyle.Quad), { Position: position }).Play();
        task.delay(0.25, () => {
            if (DIALOGUE_WINDOW.Position === position)
                DIALOGUE_WINDOW.Visible = false;
        });
        DIALOGUE_WINDOW.ViewportFrame.ClearAllChildren();
    }

    onInit() {
        const channel = getTextChannels().WaitForChild("RBXGeneral") as TextChannel;
        Packets.npcMessage.connect((message, pos, endPos, prompt, model) => {
            const humanoid = model?.FindFirstChildOfClass("Humanoid");
            let name = undefined as string | undefined;

            if (model !== undefined && humanoid !== undefined) {
                name = getDisplayName(humanoid);
                channel.DisplaySystemMessage(
                    `<font color="#${this.npcTagColor}">[${pos}/${endPos}]</font> <font color="#${ComputeNameColor(name).ToHex()}">${name}:</font> ${message}`
                    , "tag:hidden");
                TextChatService.DisplayBubble(model.WaitForChild("Head") as BasePart, message);
            }
            else {
                channel.DisplaySystemMessage(
                    `<font color="#${this.emptyColor}">${message}</font>`, "tag:hidden");
            }
            this.textSound = model === undefined ? undefined : ASSETS.NPCTextSounds.FindFirstChild(model.Name) as Sound | undefined;
            if (prompt === true)
                this.showDialogueWindow(name, message, model as Model);
        });
    }

    onStart() {
        const dialogueWindowClicked = () => {
            if (this.i < this.size)
                this.i = this.size - 1;
            else if (Packets.nextDialogue.invoke() === true)
                this.hideDialogueWindow();
        };
        this.hotkeysController.bindKey(Enum.KeyCode.Return, () => {
            if (DIALOGUE_WINDOW.Visible === true) {
                dialogueWindowClicked();
                return true;
            }
            return false;
        }, 1, "Next Dialogue");
        DIALOGUE_WINDOW.Activated.Connect(() => dialogueWindowClicked());
        let t = 0;
        let minDt = 0.03;
        RunService.Heartbeat.Connect((dt) => {
            t += dt;
            if (t < minDt)
                return;
            t = 0;
            let isSpace = false;
            if (this.i < this.size) {
                DIALOGUE_WINDOW.HintLabel.Visible = false;
                ++this.i;
                isSpace = this.text.sub(this.i + 1, this.i + 1) === " ";
                if (isSpace === false) {
                    const sound = (this.textSound ?? this.defaultTextSound).Clone();
                    sound.Parent = ReplicatedStorage;
                    if (Packets.settings.get().SoundEffects)
                        sound.Play();
                    Debris.AddItem(sound);
                }
            }
            else {
                DIALOGUE_WINDOW.HintLabel.Visible = true;
            }
            DIALOGUE_WINDOW.TextLabel.Text = this.text.sub(1, this.i + 1);
            const last = this.text.sub(this.i, this.i);
            const isPunctuation = last === "." || last === "?" || last === "!";
            minDt = isSpace ? (isPunctuation ? 0.3 : (last === "," ? 0.15 : 0.03)) : 0.03;
        });
    }
}