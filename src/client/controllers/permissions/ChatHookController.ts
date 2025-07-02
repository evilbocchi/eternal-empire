import ComputeNameColor from "@antivivi/rbxnamecolor";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { LOCAL_PLAYER } from "client/constants";
import { getTextChannels } from "shared/constants";
import Packets from "shared/Packets";

@Controller()
export default class ChatHookController implements OnInit, OnStart {

    systemColor = new Color3(0.05, 0.75, 0.05).ToHex();

    onChannelAdded(channel: Instance) {
        if (!channel.IsA("TextChannel")) {
            return;
        }
        const color = channel.GetAttribute("Color") as Color3 | undefined;
        const onMessageAdded = (message: TextChatMessage) => {
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
        task.spawn(() => { // annoyance workaround
            while (task.wait(1)) {
                channel.OnIncomingMessage = onMessageAdded;
            }
        });
    }

    showPersonalMessage(message: string, metadata = "") {
        this.display(LOCAL_PLAYER.Name, message, metadata);
    }

    private display(channel: string, message: string, metadata: string) {
        (getTextChannels().WaitForChild(channel) as TextChannel).DisplaySystemMessage(message, metadata);
    }

    onInit() {
        Packets.systemMessageSent.connect((channel, message, metadata) => this.display(channel, message, metadata));
    }

    onStart() {
        const TEXT_CHANNELS = getTextChannels();
        TEXT_CHANNELS.ChildAdded.Connect((child) => this.onChannelAdded(child));
        for (const channel of TEXT_CHANNELS.GetChildren()) {
            this.onChannelAdded(channel);
        }
    }
}