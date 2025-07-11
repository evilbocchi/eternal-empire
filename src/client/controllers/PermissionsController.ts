import { Controller, OnInit } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import { TextChatService } from "@rbxts/services";
import { COMMANDS_WINDOW, LOCAL_PLAYER, SHARE_WINDOW } from "client/constants";
import { EffectController } from "client/controllers/EffectController";
import { UIController } from "client/controllers/UIController";
import { AdaptiveTabController } from "client/controllers/interface/AdaptiveTabController";
import { ASSETS } from "shared/constants";
import { Fletchette } from "@antivivi/fletchette";
import ComputeNameColor from "shared/utils/vrldk/ComputeNameColor";

const PermissionsCanister = Fletchette.getCanister("PermissionsCanister");

@Controller()
export class PermissionsController implements OnInit {
    
    systemColor = new Color3(0.05, 0.75, 0.05).ToHex();

    constructor(private uiController: UIController, private effectController: EffectController, private adaptiveTabController: AdaptiveTabController) {

    }

    onInit() {
        PermissionsCanister.systemMessageSent.connect((channel, message, metadata) => channel.DisplaySystemMessage(message, metadata));
        PermissionsCanister.donationGiven.connect(() => {
            this.uiController.playSound("PowerUp");
            this.effectController.camShake.Shake(CameraShaker.Presets.Bump);
        });
        PermissionsCanister.tabOpened.connect((tab) => {
            this.adaptiveTabController.showAdaptiveTab(tab);
            if (tab === "Commands") {
                permLevelUpdated(LOCAL_PLAYER.GetAttribute("PermissionLevel") as number ?? 0);
            }
        });
        const permLevelUpdated = (permLevel: number) => {
            for (const c of COMMANDS_WINDOW.CommandsList.GetChildren()) {
                if (c.IsA("Frame")) {
                    c.Destroy();
                }
            }
            const commands = TextChatService.GetDescendants();
            for (const command of commands) {
                if (!command.IsA("TextChatCommand")) {
                    continue;
                }
                const pl = command.GetAttribute("PermissionLevel") as number ?? 0;
                const description = command.GetAttribute("Description") as string;
                if (description === undefined) {
                    continue;
                }
                if (pl > 3 && permLevel < 4) {
                    continue;
                }
                const option = ASSETS.CommandOption.Clone();
                option.Name = command.PrimaryAlias;
                option.AliasLabel.Text = command.PrimaryAlias;
                option.DescriptionLabel.Text = description;
                option.PermLevelLabel.Text = "Permission Level " + pl;
                option.BackgroundTransparency = pl > permLevel ? 0.5 : 0.8;
                option.LayoutOrder = pl;
                option.Parent = COMMANDS_WINDOW.CommandsList;
            }
        }
        PermissionsCanister.codeReceived.connect((joinLink) => {
            SHARE_WINDOW.Code.Input.Text = joinLink;
            this.adaptiveTabController.showAdaptiveTab("Share");
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
                if (message.PrefixText === "") {
                    if (showTag === true)
                        message.PrefixText = `<font color="#${this.systemColor}">[SYSTEM]:</font>`;
                }
                else
                    message.PrefixText = `<font color="#${ComputeNameColor(message.PrefixText.sub(1, message.PrefixText.size() - 1)).ToHex()}">${message.PrefixText}</font>`;

                let text = message.Text;
                if (c !== undefined) {
                    text = `<font color="#${c.ToHex()}">${text}</font>`;
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