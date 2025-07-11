import { Controller, OnInit } from "@flamework/core";
import { Debris, ReplicatedStorage, RunService, TextChatService, TweenService } from "@rbxts/services";
import { DIALOGUE_WINDOW } from "client/constants";
import { HotkeysController } from "client/controllers/HotkeysController";
import { UIController } from "client/controllers/UIController";
import { ASSETS, getDisplayName, getSound } from "shared/constants";
import { Fletchette } from "@antivivi/fletchette";
import computeNameColor from "shared/utils/vrldk/ComputeNameColor";

const NPCCanister = Fletchette.getCanister("NPCCanister");

@Controller()
export class NPCController implements OnInit {

    npcTagColor = Color3.fromRGB(201, 255, 13).ToHex();
    emptyColor = Color3.fromRGB(0, 181, 28).ToHex();
    defaultTextSound = getSound("Text");
    textSound = undefined as Sound | undefined;
    text = "";
    size = 0;
    i = 0;
    
    constructor(private uiController: UIController, private hotkeysController: HotkeysController) {

    }

    async showDialogueWindow(name: string | undefined, text: string) {
        DIALOGUE_WINDOW.NameLabel.Text = name ?? "";
        
        if (DIALOGUE_WINDOW.Visible === false) {
            DIALOGUE_WINDOW.Position = new UDim2(0.5, 0, 1.2, 100);
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
        })
    }

    onInit() {
        const channel = TextChatService.WaitForChild("TextChannels").WaitForChild("RBXGeneral") as TextChannel;
        NPCCanister.npcMessage.connect((model, message, pos, endPos) => {
            const humanoid = model?.FindFirstChildOfClass("Humanoid");
            let name = undefined as string | undefined;
            if (model !== undefined && humanoid !== undefined) {
                (model.PrimaryPart?.FindFirstChild("DingSound") as Sound | undefined)?.Play();
                name = getDisplayName(humanoid);
                channel.DisplaySystemMessage(
                    `<font color="#${this.npcTagColor}">[${pos}/${endPos}]</font> <font color="#${computeNameColor(name).ToHex()}">${name}:</font> ${message}`
                , "tag:hidden");
                TextChatService.DisplayBubble(model.WaitForChild("Head") as BasePart, message);
            }
            else {
                this.uiController.playSound("Ding");
                channel.DisplaySystemMessage(
                    `<font color="#${this.emptyColor}">${message}</font>`, "tag:hidden");
            }
            this.textSound = model === undefined ? undefined : ASSETS.NPCTextSounds.FindFirstChild(model.Name) as Sound | undefined;
            this.showDialogueWindow(name, message);
        });
        const dialogueWindowClicked = () => {
            if (this.i < this.size)
                this.i = this.size - 1;
            else if (NPCCanister.nextDialogue.invoke() === true)
                this.hideDialogueWindow();
        }
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