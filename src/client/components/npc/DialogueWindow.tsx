/**
 * @fileoverview React component for displaying NPC dialogue windows.
 *
 * Handles:
 * - Displaying dialogue text with typing animation
 * - NPC name display with dynamic colors
 * - Headshot viewport integration
 * - Click-to-continue functionality
 * - Smooth entrance/exit animations
 */

import ComputeNameColor from "@antivivi/rbxnamecolor";
import { observeTag } from "@antivivi/vrldk";
import React, { useEffect, useRef, useState } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { TextChatService } from "@rbxts/services";
import DialogueHeadshot from "client/components/npc/DialogueHeadshot";
import NPCNotification from "client/components/npc/NPCNotification";
import { useDocument } from "client/components/window/DocumentManager";
import { RobotoSlab, RobotoSlabBold } from "shared/asset/GameFonts";
import { useTextAnimation } from "client/hooks/useTextAnimation";
import { getAsset } from "shared/asset/AssetMap";
import { ASSETS } from "shared/asset/GameAssets";
import { getDisplayName, getTextChannels } from "shared/constants";
import { IS_EDIT } from "shared/Context";
import Packets from "shared/Packets";

interface DialogueData {
    /** The NPC's name to display */
    name?: string;
    /** The dialogue text to show */
    text: string;
    /** The NPC model for headshot display */
    model?: Model;
    /** Custom text sound for this NPC */
    textSound?: Sound;
}

/**
 * Computes the background and stroke colors for the dialogue window based on NPC name
 * @param name The NPC's name
 * @returns Object containing backgroundColor and strokeColor
 */
function computeDialogueColors(name?: string): { backgroundColor: Color3; strokeColor: Color3 } {
    const baseColor =
        name === undefined ? Color3.fromRGB(165, 165, 165) : ComputeNameColor(name).Lerp(new Color3(), 0.3);

    return {
        backgroundColor: baseColor,
        strokeColor: baseColor,
    };
}

/**
 * Gets the appropriate text sound for an NPC model
 * @param model The NPC model
 * @returns The sound to use for text typing, if available
 */
function getTextSound(model?: Model): Sound | undefined {
    if (!model) return undefined;
    return ASSETS.NPCTextSounds.FindFirstChild(model.Name) as Sound | undefined;
}

let currentText = "";

export default function DialogueWindow() {
    const { visible, setVisible } = useDocument({ id: "Dialogue", priority: -1 });
    const [dialogueData, setDialogueData] = useState<DialogueData>();
    const frameRef = useRef<TextButton>();
    const textLabelRef = useRef<TextLabel>();
    const hintLabelRef = useRef<TextLabel>();

    const { backgroundColor, strokeColor } = computeDialogueColors(dialogueData?.name);
    const textSound = getTextSound(dialogueData?.model);

    // Handle window show/hide animations
    const openPosition = new UDim2(0.5, 0, 0.975, -30);
    const closedPosition = new UDim2(0.5, 0, 1.5, 0);

    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;
        if (visible) {
            frame.TweenPosition(openPosition, Enum.EasingDirection.Out, Enum.EasingStyle.Quad, 0.3, true);
        } else {
            frame.TweenPosition(closedPosition, Enum.EasingDirection.In, Enum.EasingStyle.Linear, 0.2, true);
        }
    }, [visible]);

    useEffect(() => {
        const channel = IS_EDIT ? undefined : (getTextChannels().WaitForChild("RBXGeneral") as TextChannel);
        const npcTagColor = Color3.fromRGB(201, 255, 13).ToHex();
        const emptyColor = Color3.fromRGB(0, 181, 28).ToHex();
        const connection = Packets.npcMessage.fromServer((message, pos, endPos, prompt, model) => {
            currentText = message;
            print(`Received NPC message: ${message} (pos ${pos}/${endPos})`);
            const humanoid = model?.FindFirstChildOfClass("Humanoid");
            let name = undefined as string | undefined;

            if (model !== undefined && humanoid !== undefined) {
                name = getDisplayName(humanoid);
                channel?.DisplaySystemMessage(
                    `<font color="#${npcTagColor}">[${pos}/${endPos}]</font> <font color="#${ComputeNameColor(name).ToHex()}">${name}:</font> ${message}`,
                    "tag:hidden",
                );
                TextChatService.DisplayBubble(model.WaitForChild("Head") as BasePart, message);
            } else {
                channel?.DisplaySystemMessage(`<font color="#${emptyColor}">${message}</font>`, "tag:hidden");
            }

            // Show dialogue window if prompted
            if (prompt === true) {
                setDialogueData({
                    name,
                    text: message,
                    model: model as Model,
                    textSound: getTextSound(model as Model),
                });
                setVisible(true);
            }
        });

        const cleanupPerPrompt = new Map<ProximityPrompt, () => void>();
        const cleanup = observeTag(
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

        return () => {
            connection.Disconnect();
            cleanup();
            cleanupPerPrompt.forEach((fn) => fn());
            cleanupPerPrompt.clear();
        };
    }, []);

    // Handle text typing animation
    const { displayText, isComplete, skipToEnd } = useTextAnimation({
        text: dialogueData?.text ?? "",
        textLabelRef,
        hintLabelRef,
        visible,
        textSound,
    });

    return (
        <textbutton
            ref={frameRef}
            AnchorPoint={new Vector2(0.5, 1)}
            AutoButtonColor={false}
            BackgroundColor3={backgroundColor}
            BorderSizePixel={0}
            Position={closedPosition}
            Size={new UDim2(0.25, 250, 0.15, 100)}
            Text=""
            TextColor3={Color3.fromRGB(0, 0, 0)}
            TextSize={14}
            Event={{
                Activated: () => {
                    if (!isComplete) {
                        // Skip to end of text if still typing
                        skipToEnd();
                        return;
                    }
                    let message = currentText;
                    if (Packets.nextDialogue.toServer()) {
                        if (currentText !== message) {
                            return; // We have a new message, don't close yet
                        }
                        setVisible(false);
                    }
                },
            }}
        >
            <folder>
                <imagelabel
                    AnchorPoint={new Vector2(1, 0)}
                    BackgroundTransparency={1}
                    Image={getAsset("assets/GlassReflection.png")}
                    ImageColor3={Color3.fromRGB(0, 0, 0)}
                    ImageTransparency={0.9}
                    Position={new UDim2(1, 0, 0, 0)}
                    Rotation={270}
                    ScaleType={Enum.ScaleType.Fit}
                    Size={new UDim2(1, 0, 1, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                    ZIndex={-2}
                />
                <frame
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                    BackgroundTransparency={0.8}
                    BorderSizePixel={0}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(1, 14, 1, -6)}
                    ZIndex={-2}
                >
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(0, 0, 0)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(0, 0, 0)),
                            ])
                        }
                    />
                </frame>
                <imagelabel
                    AnchorPoint={new Vector2(0.5, 0)}
                    BackgroundTransparency={1}
                    Image={getAsset("assets/GridCheckers.png")}
                    ImageColor3={Color3.fromRGB(0, 0, 0)}
                    ImageTransparency={0.95}
                    Position={new UDim2(0.5, 0, 0, 0)}
                    ScaleType={Enum.ScaleType.Tile}
                    Size={new UDim2(1, 20, 1, 0)}
                    TileSize={new UDim2(0, 25, 0, 25)}
                    ZIndex={-4}
                />
            </folder>
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(189, 189, 189)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                    ])
                }
                Rotation={272}
            />
            <uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 10)} />
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={strokeColor} Thickness={2}>
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(97, 97, 97)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(63, 63, 63)),
                        ])
                    }
                    Rotation={90}
                />
            </uistroke>

            {/* NPC Name Label */}
            <textlabel
                key="NameLabel"
                Active={true}
                AnchorPoint={new Vector2(0, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Position={new UDim2(0, 10, 0, 0)}
                Size={new UDim2(0.5, 0, 0, 40)}
                Text={dialogueData?.name ?? ""}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={34}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Color={Color3.fromRGB(50, 50, 50)} Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(97, 97, 97)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(63, 63, 63)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
            </textlabel>

            {/* Dialogue Text Label */}
            <textlabel
                ref={textLabelRef}
                key="TextLabel"
                Active={true}
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Position={new UDim2(0.5, 0, 0, 25)}
                Size={new UDim2(1, -30, 1, -75)}
                Text={displayText}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={25}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uistroke Color={Color3.fromRGB(50, 50, 50)} Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(97, 97, 97)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(63, 63, 63)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
                <uitextsizeconstraint MaxTextSize={25} />
            </textlabel>

            {/* Click to continue hint */}
            <textlabel
                ref={hintLabelRef}
                key="HintLabel"
                Active={true}
                AnchorPoint={new Vector2(0.5, 1)}
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Position={new UDim2(0.5, 0, 1, -20)}
                Size={new UDim2(1, -30, 0, 20)}
                Text="Click to continue"
                TextColor3={Color3.fromRGB(198, 198, 198)}
                TextScaled={true}
                TextSize={25}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Right}
                TextYAlignment={Enum.TextYAlignment.Top}
                Visible={isComplete}
            >
                <uistroke Color={Color3.fromRGB(50, 50, 50)} Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(97, 97, 97)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(63, 63, 63)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
            </textlabel>

            {/* NPC Headshot Viewport */}
            <DialogueHeadshot model={dialogueData?.model} />
        </textbutton>
    );
}
