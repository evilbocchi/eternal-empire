/**
 * @fileoverview Client controller for customizing chat appearance and handling system messages.
 *
 * Handles:
 * - Customizing chat message colors and tags based on metadata
 * - Displaying system and personal messages in chat channels
 * - Integrating with text channels and listening for new messages
 *
 * The controller manages chat message formatting, color overrides, and system message display for enhanced chat experience.
 *
 * @since 1.0.0
 */
import ComputeNameColor from "@antivivi/rbxnamecolor";
import { Controller, OnInit, OnStart } from "@flamework/core";
import { LOCAL_PLAYER } from "client/constants";
import { getTextChannels } from "shared/constants";
import Packets from "shared/Packets";

/**
 * Controller responsible for customizing chat appearance and handling system messages.
 *
 * Handles chat message formatting, color overrides, and system/personal message display.
 */
@Controller()
export default class ChatHookController implements OnInit, OnStart {

    /** Hex color string for system messages. */
    systemColor = new Color3(0.05, 0.75, 0.05).ToHex();

    /**
     * Sets up a chat channel for custom message formatting and color overrides.
     * @param channel The chat channel instance to set up.
     */
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

    /**
     * Displays a personal system message in the player's chat channel.
     * @param message The message to display.
     * @param metadata Optional metadata for formatting.
     */
    showPersonalMessage(message: string, metadata = "") {
        this.display(LOCAL_PLAYER.Name, message, metadata);
    }

    /**
     * Displays a system message in the specified chat channel.
     * @param channel The channel name.
     * @param message The message to display.
     * @param metadata Optional metadata for formatting.
     */
    private display(channel: string, message: string, metadata: string) {
        (getTextChannels().WaitForChild(channel) as TextChannel).DisplaySystemMessage(message, metadata);
    }

    /**
     * Initializes the ChatHookController, sets up system message listener.
     */
    onInit() {
        Packets.systemMessageSent.fromServer((channel, message, metadata) => this.display(channel, message, metadata));
    }

    /**
     * Starts the ChatHookController, sets up chat channel listeners for formatting.
     */
    onStart() {
        const TEXT_CHANNELS = getTextChannels();
        TEXT_CHANNELS.ChildAdded.Connect((child) => this.onChannelAdded(child));
        for (const channel of TEXT_CHANNELS.GetChildren()) {
            this.onChannelAdded(channel);
        }
    }
}