import { Controller, OnInit } from "@flamework/core";
import { TextChatService } from "@rbxts/services";
import { Fletchette } from "shared/utils/fletchette";
import computeNameColor from "shared/utils/vrldk/ComputeNameColor";

const NPCCanister = Fletchette.getCanister("NPCCanister");

@Controller()
export class NPCController implements OnInit {
    
    npcTagColor = Color3.fromRGB(201, 255, 13).ToHex();

    constructor() {

    }

    onInit() {
        const channel = TextChatService.WaitForChild("TextChannels").WaitForChild("RBXGeneral") as TextChannel;
        NPCCanister.npcMessage.connect((model, message) => {
            channel.DisplaySystemMessage(
                `<font color="#${this.npcTagColor}">[NPC]</font> <font color="#${computeNameColor(model.Name).ToHex()}">${model.Name}:</font> ${message}`
            );
            TextChatService.DisplayBubble(model.WaitForChild("Head") as BasePart, message);
        });
    }
}