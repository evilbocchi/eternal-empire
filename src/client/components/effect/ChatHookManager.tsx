import ComputeNameColor from "@antivivi/rbxnamecolor";
import { simpleInterval } from "@antivivi/vrldk";
import React, { Fragment, useEffect, useRef } from "@rbxts/react";
import { LOCAL_PLAYER } from "client/constants";
import { getTextChannels } from "shared/constants";
import Packets from "shared/Packets";
import Sandbox from "shared/Sandbox";

const SYSTEM_COLOR = new Color3(0.05, 0.75, 0.05).ToHex();

export default function ChatHookManager() {
    const channelCleanupRef = useRef(new Map<TextChannel, () => void>());

    useEffect(() => {
        if (Sandbox.getEnabled()) {
            return;
        }

        const channelCleanup = channelCleanupRef.current;

        const display = (channelName: string, message: string, metadata: string) => {
            const channel = getTextChannels().FindFirstChild(channelName);
            if (channel && channel.IsA("TextChannel")) {
                channel.DisplaySystemMessage(message, metadata);
            }
        };

        const setupChannel = (instance: Instance) => {
            if (!instance.IsA("TextChannel") || channelCleanup.has(instance)) {
                return;
            }

            const channel = instance;
            const previousHandler = channel.OnIncomingMessage;

            const onMessageAdded = (message: TextChatMessage) => {
                const metadatas = message.Metadata.split(";");
                let color: Color3 | undefined;
                let showTag = true;

                for (const data of metadatas) {
                    const [propName, prop] = data.split(":");
                    if (propName === "color") {
                        const [r, g, b] = prop.split(",");
                        if (r === "255" && g === "255" && b === "255") {
                            color = undefined;
                        } else {
                            color = Color3.fromRGB(tonumber(r) ?? 0, tonumber(g) ?? 0, tonumber(b) ?? 0);
                        }
                    } else if (propName === "tag" && prop === "hidden") {
                        showTag = false;
                    }
                }

                if (message.PrefixText === "") {
                    if (showTag) {
                        message.PrefixText = `<font color="#${SYSTEM_COLOR}">[SYSTEM]:</font>`;
                    }
                } else {
                    const nameColor = ComputeNameColor(
                        message.PrefixText.sub(1, message.PrefixText.size() - 1),
                    ).ToHex();
                    message.PrefixText = `<font color="#${nameColor}">${message.PrefixText}</font>`;
                }

                let text = message.Text;
                if (color !== undefined) {
                    text = `<font color="#${color.ToHex()}">${text}</font>`;
                }

                const overrideProperties = new Instance("TextChatMessageProperties");
                if (color !== undefined) {
                    overrideProperties.Text = text;
                }
                return overrideProperties;
            };
            const noopHandler: typeof onMessageAdded = () => new Instance("TextChatMessageProperties");

            const messageReceivedConnection = channel.MessageReceived.Connect((incomingMessage) => {
                if (incomingMessage.TextSource?.UserId !== LOCAL_PLAYER?.UserId) {
                    return;
                }

                if (channel.Name === "Global") {
                    Packets.sendGlobalMessage.toServer(incomingMessage.Text);
                }
            });

            const intervalCleanup = simpleInterval(() => {
                channel.OnIncomingMessage = onMessageAdded;
            }, 1);

            channel.OnIncomingMessage = onMessageAdded;

            channelCleanup.set(channel, () => {
                messageReceivedConnection.Disconnect();
                intervalCleanup();
                channel.OnIncomingMessage = previousHandler ?? noopHandler;
            });
        };

        const teardownChannel = (instance: Instance) => {
            if (!instance.IsA("TextChannel")) {
                return;
            }

            const cleanup = channelCleanup.get(instance);
            if (cleanup !== undefined) {
                cleanup();
                channelCleanup.delete(instance);
            }
        };

        const textChannels = getTextChannels();
        const childAddedConnection = textChannels.ChildAdded.Connect(setupChannel);
        const childRemovedConnection = textChannels.ChildRemoved.Connect(teardownChannel);

        for (const child of textChannels.GetChildren()) {
            setupChannel(child);
        }

        const systemMessageConnection = Packets.systemMessageSent.fromServer(display);

        return () => {
            systemMessageConnection.Disconnect();
            childAddedConnection.Disconnect();
            childRemovedConnection.Disconnect();

            for (const [, cleanup] of channelCleanup) {
                cleanup();
            }
            channelCleanup.clear();
        };
    }, []);

    return <Fragment />;
}
