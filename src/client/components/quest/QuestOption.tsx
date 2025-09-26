import React, { useEffect, useRef } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { getPositionDetails } from "client/components/quest/TrackedQuestWindow";
import { getLengthColor, getLengthName, getRewardLabel } from "client/components/quest/useQuestData";
import { RobotoSlabBold, RobotoSlabExtraBold, RobotoSlabHeavy, RobotoSlabMedium } from "client/GameFonts";
import { getAsset } from "shared/asset/AssetMap";

interface QuestOptionProps {
    questId: string;
    quest: QuestInfo;
    currentStage: number;
    level: number;
    isTracked: boolean;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    onTrack: () => void;
}

export default function QuestOption({
    questId,
    quest,
    currentStage,
    level,
    isTracked,
    isExpanded,
    onToggleExpanded,
    onTrack,
}: QuestOptionProps) {
    const color = Color3.fromRGB(quest.colorR, quest.colorG, quest.colorB);
    const belowRequirement = level < quest.level;
    const isCompleted = currentStage < 0;
    const isAvailable = !isCompleted && !belowRequirement;

    // Create ref for the arrow image
    const arrowRef = useRef<ImageLabel>();

    // Set initial rotation without animation
    useEffect(() => {
        const arrow = arrowRef.current;
        if (!arrow) return;

        // Set initial rotation based on expanded state
        arrow.Rotation = isExpanded ? 0 : 180;
    }, []);

    // Animate arrow rotation when expanded state changes
    useEffect(() => {
        const arrow = arrowRef.current;
        if (!arrow) return;

        const targetRotation = isExpanded ? 0 : 180;

        const tweenInfo = new TweenInfo(
            0.3, // Duration in seconds
            Enum.EasingStyle.Quart,
            Enum.EasingDirection.Out,
        );

        const tween = TweenService.Create(arrow, tweenInfo, {
            Rotation: targetRotation,
        });

        tween.Play();

        return () => {
            tween.Cancel();
        };
    }, [isExpanded]); // Calculate layout order for quest sorting
    const getLayoutOrder = () => {
        const baseOrder = quest.level * 10 + (quest.order + 1);
        if (isCompleted) return baseOrder + 1000000000;
        if (belowRequirement) return baseOrder + 100000000;
        return baseOrder;
    };

    const transparency = isCompleted ? 0.5 : 0;
    const trackButtonColor = isTracked ? Color3.fromRGB(85, 255, 127) : Color3.fromRGB(255, 52, 52);

    return (
        <frame
            key={questId}
            AutomaticSize={Enum.AutomaticSize.Y}
            BackgroundColor3={color}
            BorderSizePixel={0}
            LayoutOrder={getLayoutOrder()}
            Size={new UDim2(1, 0, 0, 0)}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 10)}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />

            {/* Quest Header (Dropdown Button) */}
            <textbutton
                key="Dropdown"
                BackgroundTransparency={1}
                LayoutOrder={-1}
                Size={new UDim2(1, 0, 0, 30)}
                Text=""
                Event={{
                    Activated: onToggleExpanded,
                }}
            >
                {/* Dropdown Arrow */}
                <imagelabel
                    ref={arrowRef}
                    AnchorPoint={new Vector2(1, 0.5)}
                    BackgroundTransparency={1}
                    Image={getAsset("assets/Dropdown.png")}
                    Position={new UDim2(0.95, 0, 0.5, 0)}
                    ScaleType={Enum.ScaleType.Fit}
                    Size={new UDim2(0.8, 0, 0.8, 0)}
                    SizeConstraint={Enum.SizeConstraint.RelativeYY}
                />

                {/* Level Label */}
                <textlabel
                    key="LevelLabel"
                    AnchorPoint={new Vector2(0, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabExtraBold}
                    Position={new UDim2(0, 0, 0.5, 0)}
                    Size={new UDim2(0.2, 0, 0.9, 0)}
                    Text={`Lv. ${quest.level}`}
                    TextColor3={belowRequirement ? Color3.fromRGB(255, 52, 52) : Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextTransparency={transparency}
                >
                    <uistroke Thickness={2} Transparency={transparency} />
                </textlabel>

                {/* Quest Name */}
                <textlabel
                    key="NameLabel"
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabHeavy}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(0.5, 0, 1, 0)}
                    Text={quest.name || "no name"}
                    TextColor3={color}
                    TextScaled={true}
                    TextTransparency={transparency}
                >
                    <uistroke Thickness={2} Transparency={transparency} />
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(0.694, Color3.fromRGB(253, 253, 253)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(176, 176, 176)),
                            ])
                        }
                        Rotation={90}
                    />
                </textlabel>
            </textbutton>

            {/* Quest Content (Expandable) */}
            {isExpanded && (
                <frame
                    key="Content"
                    AutomaticSize={Enum.AutomaticSize.Y}
                    BackgroundColor3={Color3.fromRGB(0, 0, 0)}
                    BackgroundTransparency={0.95}
                    BorderSizePixel={0}
                    Size={new UDim2(1, 0, 0, 0)}
                >
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Center}
                        Padding={new UDim(0, 7)}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                    />

                    {/* Current Stage Description */}
                    <textlabel
                        key="CurrentStepLabel"
                        AutomaticSize={Enum.AutomaticSize.Y}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabMedium}
                        LayoutOrder={1}
                        Size={new UDim2(0.9, 0, 0, 0)}
                        Text={getPositionDetails(questId, quest, currentStage).description}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={20}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>

                    {/* Length Label */}
                    <textlabel
                        key="LengthLabel"
                        AutomaticSize={Enum.AutomaticSize.Y}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabExtraBold}
                        LayoutOrder={2}
                        Size={new UDim2(0.9, 0, 0, 0)}
                        Text={`Length: ${getLengthName(quest.length)}`}
                        TextColor3={getLengthColor(quest.length)}
                        TextSize={20}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Thickness={2} />
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(0.547, Color3.fromRGB(243, 243, 243)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(206, 206, 206)),
                                ])
                            }
                            Rotation={90}
                        />
                        <uipadding PaddingTop={new UDim(0, 10)} />
                    </textlabel>

                    {/* Reward Label */}
                    <textlabel
                        key="RewardLabel"
                        AutomaticSize={Enum.AutomaticSize.Y}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabExtraBold}
                        LayoutOrder={3}
                        Size={new UDim2(0.9, 0, 0, 0)}
                        Text={`Reward: ${getRewardLabel(quest.reward)}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={20}
                        TextWrapped={true}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    >
                        <uistroke Thickness={2} />
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 255)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(0, 255, 255)),
                                ])
                            }
                            Rotation={90}
                        />
                    </textlabel>

                    {/* Track Button */}
                    {isAvailable && (
                        <textbutton
                            key="Track"
                            AutomaticSize={Enum.AutomaticSize.Y}
                            BackgroundColor3={trackButtonColor}
                            BorderSizePixel={0}
                            LayoutOrder={15}
                            Size={new UDim2(0.4, 0, 0, 0)}
                            Text=""
                            Event={{
                                Activated: onTrack,
                            }}
                        >
                            <uigradient
                                Color={
                                    new ColorSequence([
                                        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                        new ColorSequenceKeypoint(1, Color3.fromRGB(156, 156, 156)),
                                    ])
                                }
                                Rotation={90}
                            />
                            <uistroke
                                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                                Color={trackButtonColor}
                                Thickness={2}
                            />

                            <textlabel
                                key="Label"
                                AutomaticSize={Enum.AutomaticSize.Y}
                                BackgroundTransparency={1}
                                FontFace={RobotoSlabBold}
                                Position={new UDim2(0.5, 0, 0.5, 0)}
                                AnchorPoint={new Vector2(0.5, 0.5)}
                                Size={new UDim2(0.9, 0, 0, 0)}
                                Text={isTracked ? "Untrack" : "Track"}
                                TextColor3={Color3.fromRGB(255, 255, 255)}
                                TextSize={20}
                                TextWrapped={true}
                            >
                                <uistroke Thickness={2} />
                            </textlabel>

                            <uilistlayout
                                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                                Padding={new UDim(0, 10)}
                                SortOrder={Enum.SortOrder.LayoutOrder}
                            />
                            <uipadding
                                PaddingBottom={new UDim(0, 5)}
                                PaddingLeft={new UDim(0, 5)}
                                PaddingRight={new UDim(0, 5)}
                                PaddingTop={new UDim(0, 5)}
                            />
                        </textbutton>
                    )}

                    <uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
                </frame>
            )}

            {/* Quest Option Styling */}
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(150, 150, 150)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(85, 85, 85)),
                    ])
                }
                Rotation={90}
            />
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={color} Thickness={4}>
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.375, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)),
                            new ColorSequenceKeypoint(0.583, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                        ])
                    }
                    Rotation={85}
                />
            </uistroke>
            <uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
        </frame>
    );
}
