import React, { Fragment, useCallback, useEffect, useState } from "@rbxts/react";
import { LOCAL_PLAYER } from "client/constants";
import { RobotoSlab, RobotoSlabMedium } from "client/GameFonts";

interface ProximityPromptInfo {
    prompt: ProximityPrompt;
    name: string;
    distance: number;
    actionText: string;
    objectText?: string;
}

/**
 * Component that allows triggering proximity prompts in simulation stories
 */
export default function ProximityPromptTrigger() {
    const [isVisible, setIsVisible] = useState(false);
    const [proximityPrompts, setProximityPrompts] = useState<ProximityPromptInfo[]>([]);

    const refreshProximityPrompts = useCallback(() => {
        if (!LOCAL_PLAYER.Character) return;

        const character = LOCAL_PLAYER.Character;
        const humanoidRootPart = character.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
        if (!humanoidRootPart) return;

        const prompts: ProximityPromptInfo[] = [];

        // Find all proximity prompts in the workspace
        const findPrompts = (parent: Instance) => {
            for (const child of parent.GetChildren()) {
                if (child.IsA("ProximityPrompt") && child.Enabled) {
                    const parentPart = child.Parent;
                    if (parentPart && parentPart.IsA("BasePart")) {
                        const distance = humanoidRootPart.Position.sub(parentPart.Position).Magnitude;

                        // Get a readable name for the prompt
                        let name = child.ObjectText || parentPart.Name;
                        if (parentPart.Parent && parentPart.Parent.IsA("Model")) {
                            name = parentPart.Parent.Name + " - " + name;
                        }

                        prompts.push({
                            prompt: child,
                            name: name,
                            distance: distance,
                            actionText: child.ActionText,
                            objectText: child.ObjectText,
                        });
                    }
                }
                findPrompts(child);
            }
        };

        findPrompts(game.Workspace);

        // Sort by distance (closest first)
        prompts.sort((a, b) => a.distance < b.distance);

        setProximityPrompts(prompts);
    }, []);

    const triggerPrompt = useCallback((prompt: ProximityPrompt) => {
        // Simulate the proximity prompt being triggered
        prompt.InputHoldBegin();
    }, []);

    // Handle keyboard shortcuts (only R for refresh when visible)
    useEffect(() => {
        const connection = game.GetService("UserInputService").InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed) return;

            // Refresh prompts with R when visible
            if (isVisible && input.KeyCode === Enum.KeyCode.R) {
                refreshProximityPrompts();
            }
        });

        return () => connection.Disconnect();
    }, [isVisible, refreshProximityPrompts]);

    // Auto-refresh prompts every few seconds when visible
    useEffect(() => {
        if (!isVisible) return;

        const refreshInterval = task.spawn(() => {
            while (isVisible) {
                refreshProximityPrompts();
                task.wait(2); // Refresh every 2 seconds
            }
        });

        return () => {
            task.cancel(refreshInterval);
        };
    }, [isVisible, refreshProximityPrompts]);

    if (!isVisible) {
        return (
            <textbutton
                BackgroundTransparency={0.5}
                BackgroundColor3={Color3.fromRGB(80, 80, 160)}
                BorderSizePixel={0}
                FontFace={RobotoSlabMedium}
                Position={new UDim2(0, 10, 1, -90)}
                Size={new UDim2(0, 200, 0, 30)}
                Text="Proximity Prompts"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={12}
                ZIndex={1000}
                Event={{
                    Activated: () => {
                        setIsVisible(true);
                        refreshProximityPrompts();
                    },
                }}
            >
                <uicorner CornerRadius={new UDim(0, 4)} />
                <uitextsizeconstraint MaxTextSize={12} />
            </textbutton>
        );
    }

    return (
        <Fragment>
            {/* Background overlay */}
            <frame
                BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                BackgroundTransparency={0.5}
                BorderSizePixel={0}
                Size={new UDim2(1, 0, 1, 0)}
                ZIndex={998}
            />

            {/* Main proximity prompt interface */}
            <frame
                AnchorPoint={new Vector2(1, 0.5)}
                BackgroundColor3={Color3.fromRGB(40, 40, 40)}
                BorderSizePixel={0}
                Position={new UDim2(1, -20, 0.5, 0)}
                Size={new UDim2(0, 400, 0, 500)}
                ZIndex={999}
            >
                <uicorner CornerRadius={new UDim(0, 8)} />
                <uistroke Color={Color3.fromRGB(100, 100, 100)} Thickness={2} />

                {/* Header with Close Button */}
                <frame BackgroundTransparency={1} Position={new UDim2(0, 0, 0, 10)} Size={new UDim2(1, 0, 0, 30)}>
                    <textlabel
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabMedium}
                        Position={new UDim2(0, 0, 0, 0)}
                        Size={new UDim2(1, -40, 1, 0)}
                        Text="Proximity Prompts"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={18}
                    >
                        <uitextsizeconstraint MaxTextSize={18} />
                    </textlabel>

                    {/* Close Button */}
                    <textbutton
                        BackgroundColor3={Color3.fromRGB(160, 80, 80)}
                        BorderSizePixel={0}
                        FontFace={RobotoSlabMedium}
                        Position={new UDim2(1, -35, 0, 0)}
                        Size={new UDim2(0, 30, 0, 30)}
                        Text="×"
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={18}
                        Event={{
                            Activated: () => setIsVisible(false),
                        }}
                    >
                        <uicorner CornerRadius={new UDim(0, 4)} />
                        <uitextsizeconstraint MaxTextSize={18} />
                    </textbutton>
                </frame>

                {/* Refresh Button */}
                <textbutton
                    BackgroundColor3={Color3.fromRGB(80, 160, 80)}
                    BorderSizePixel={0}
                    FontFace={RobotoSlabMedium}
                    Position={new UDim2(1, -80, 0, 50)}
                    Size={new UDim2(0, 70, 0, 30)}
                    Text="Refresh"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={12}
                    Event={{
                        Activated: refreshProximityPrompts,
                    }}
                >
                    <uicorner CornerRadius={new UDim(0, 4)} />
                    <uitextsizeconstraint MaxTextSize={12} />
                </textbutton>

                {/* Proximity Prompts List */}
                <scrollingframe
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    BackgroundColor3={Color3.fromRGB(50, 50, 50)}
                    BorderSizePixel={0}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    Position={new UDim2(0, 10, 0, 90)}
                    ScrollBarThickness={4}
                    Size={new UDim2(1, -20, 1, -140)}
                >
                    <uicorner CornerRadius={new UDim(0, 6)} />
                    <uilistlayout Padding={new UDim(0, 5)} SortOrder={Enum.SortOrder.LayoutOrder} />
                    <uipadding
                        PaddingBottom={new UDim(0, 10)}
                        PaddingLeft={new UDim(0, 10)}
                        PaddingRight={new UDim(0, 10)}
                        PaddingTop={new UDim(0, 10)}
                    />

                    {proximityPrompts.map((promptInfo, index) => (
                        <frame
                            key={`prompt-${index}-${promptInfo.name}`}
                            BackgroundColor3={Color3.fromRGB(60, 60, 60)}
                            BorderSizePixel={0}
                            LayoutOrder={index}
                            Size={new UDim2(1, -10, 0, 80)}
                        >
                            <uicorner CornerRadius={new UDim(0, 4)} />
                            <uistroke Color={Color3.fromRGB(120, 120, 120)} Thickness={1} />

                            {/* Prompt Name */}
                            <textlabel
                                BackgroundTransparency={1}
                                FontFace={RobotoSlabMedium}
                                Position={new UDim2(0, 10, 0, 5)}
                                Size={new UDim2(1, -120, 0, 20)}
                                Text={promptInfo.name}
                                TextColor3={Color3.fromRGB(255, 255, 255)}
                                TextScaled={true}
                                TextSize={14}
                                TextTruncate={Enum.TextTruncate.AtEnd}
                                TextXAlignment={Enum.TextXAlignment.Left}
                            >
                                <uitextsizeconstraint MaxTextSize={14} />
                            </textlabel>

                            {/* Action Text */}
                            <textlabel
                                BackgroundTransparency={1}
                                FontFace={RobotoSlab}
                                Position={new UDim2(0, 10, 0, 25)}
                                Size={new UDim2(1, -120, 0, 15)}
                                Text={`Action: ${promptInfo.actionText}`}
                                TextColor3={Color3.fromRGB(150, 255, 150)}
                                TextScaled={true}
                                TextSize={12}
                                TextXAlignment={Enum.TextXAlignment.Left}
                            >
                                <uitextsizeconstraint MaxTextSize={12} />
                            </textlabel>

                            {/* Distance */}
                            <textlabel
                                BackgroundTransparency={1}
                                FontFace={RobotoSlab}
                                Position={new UDim2(0, 10, 0, 45)}
                                Size={new UDim2(1, -120, 0, 15)}
                                Text={`Distance: ${math.floor(promptInfo.distance * 10) / 10} studs`}
                                TextColor3={Color3.fromRGB(200, 200, 200)}
                                TextScaled={true}
                                TextSize={10}
                                TextXAlignment={Enum.TextXAlignment.Left}
                            >
                                <uitextsizeconstraint MaxTextSize={10} />
                            </textlabel>

                            {/* Trigger Button */}
                            <textbutton
                                BackgroundColor3={Color3.fromRGB(160, 80, 80)}
                                BorderSizePixel={0}
                                FontFace={RobotoSlabMedium}
                                Position={new UDim2(1, -100, 0, 10)}
                                Size={new UDim2(0, 90, 0, 60)}
                                Text="Trigger"
                                TextColor3={Color3.fromRGB(255, 255, 255)}
                                TextScaled={true}
                                TextSize={14}
                                Event={{
                                    Activated: () => triggerPrompt(promptInfo.prompt),
                                }}
                            >
                                <uicorner CornerRadius={new UDim(0, 4)} />
                                <uitextsizeconstraint MaxTextSize={14} />
                            </textbutton>
                        </frame>
                    ))}
                </scrollingframe>

                {/* Help text */}
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlab}
                    Position={new UDim2(0, 10, 1, -40)}
                    Size={new UDim2(1, -20, 0, 30)}
                    Text="R: Refresh | Auto-refreshes every 2s | Click × to close"
                    TextColor3={Color3.fromRGB(150, 150, 150)}
                    TextScaled={true}
                    TextSize={10}
                    TextWrapped={true}
                >
                    <uitextsizeconstraint MaxTextSize={10} />
                </textlabel>
            </frame>
        </Fragment>
    );
}
