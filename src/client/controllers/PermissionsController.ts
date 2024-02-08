import { Controller, OnInit, OnStart } from "@flamework/core";
import { TextChatService } from "@rbxts/services";
import { Fletchette } from "shared/utils/fletchette";
import { UIController } from "./UIController";
import { EffectController } from "./EffectController";
import CameraShaker from "@rbxts/camera-shaker";
import { COMMANDS_WINDOW } from "client/constants";
import { UI_ASSETS } from "shared/constants";
import { AdaptiveTabController } from "./interface/AdaptiveTabController";

const PermissionsCanister = Fletchette.getCanister("PermissionsCanister");

@Controller()
export class PermissionsController implements OnInit {
    
    constructor(private uiController: UIController, private effectController: EffectController, private adaptiveTabController: AdaptiveTabController) {

    }

    onInit() {
        PermissionsCanister.systemMessageSent.connect((channel, message, metadata) => channel.DisplaySystemMessage(message, metadata));
        PermissionsCanister.donationGiven.connect(() => {
            this.uiController.playSound("PowerUp");
            this.effectController.camShake.Shake(CameraShaker.Presets.Bump);
        });
        PermissionsCanister.commandsGiven.connect((commands) => {
            for (const c of COMMANDS_WINDOW.CommandsList.GetChildren()) {
                if (c.IsA("Frame")) {
                    c.Destroy();
                }
            }
            for (const command of commands) {
                const option = UI_ASSETS.CommandOption.Clone();
                const permLevel = command.GetAttribute("PermissionLevel") as number ?? 0;
                const description = command.GetAttribute("Description") as string;
                if (description === undefined) {
                    continue;
                }
                option.Name = command.PrimaryAlias;
                option.AliasLabel.Text = command.PrimaryAlias;
                option.DescriptionLabel.Text = description;
                option.PermLevelLabel.Text = "Permission Level " + permLevel;
                option.LayoutOrder = permLevel;
                option.Parent = COMMANDS_WINDOW.CommandsList;
            }
            this.adaptiveTabController.showAdaptiveTab("Commands");
        });

        const onChannelAdded = (channel: Instance) => {
            if (!channel.IsA("TextChannel")) {
                return;
            }
            const color = channel.GetAttribute("Color") as Color3 | undefined;
            channel.OnIncomingMessage = (message) => {
                const metadatas = message.Metadata.split(";");
                let c = color;
                let showTag = true;
                for (const data of metadatas) {
                    const [propName, prop] = data.split(":");
                    if (propName === "color") {
                        const [r, g, b] = prop.split(",");
                        if (r === "255" && g === "255" && b === "255") {
                            c = undefined;
                        }
                        else {
                            c = Color3.fromRGB(tonumber(r) ?? 0, tonumber(g) ?? 0, tonumber(b) ?? 0);
                        }
                    }
                    else if (propName === "tag" && prop === "hidden") {
                        showTag = false;
                    }
                }
                let text = message.Text;
                if (showTag) {
                    text = "[SYSTEM]: " + text;
                }
                if (c !== undefined) {
                    text = string.format("<font color='#" + c.ToHex() + "'>%s</font>", text);
                }
                const overrideProperties = new Instance("TextChatMessageProperties");
                if (c !== undefined)
                    overrideProperties.Text = text;
                return overrideProperties;
            };
        }
        const textChannels = TextChatService.WaitForChild("TextChannels");
        textChannels.ChildAdded.Connect((child) => onChannelAdded(child));
        for (const channel of textChannels.GetChildren()) {
            onChannelAdded(channel);
        }
    }
}