import React, { useState, useCallback } from "@rbxts/react";
import { getMaxXp } from "shared/constants";
import { RobotoSlabBold, RobotoSlabHeavy, RobotoSlabMedium } from "shared/ui/GameFonts";
import { useQuestData } from "./useQuestData";

export default function TrackedQuestWindow() {
    const {
        questInfo,
        stagePerQuest,
        level,
        xp,
        trackedQuest
    } = useQuestData();

    const [showProgressBar, setShowProgressBar] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);
    const [completionMessage, setCompletionMessage] = useState("");

    // Get current quest data
    const currentQuest = trackedQuest ? questInfo.get(trackedQuest) : undefined;
    const currentStage = trackedQuest ? (stagePerQuest.get(trackedQuest) ?? 0) : 0;
    const hasQuest = currentQuest !== undefined && currentStage >= 0;

    // Format description for current stage
    const getFormattedDescription = useCallback(() => {
        if (!currentQuest || !trackedQuest) return "";

        if (currentStage < 0) {
            return "Quest complete.";
        }

        const stage = currentQuest.stages[currentStage];
        let desc = stage?.description || "<no description provided>";

        // Note: In original implementation, this would replace %%coords%% with actual coordinates
        // For now, we'll keep it simple
        return desc;
    }, [currentQuest, trackedQuest, currentStage]);

    // XP Progress calculation
    const maxXp = getMaxXp(level);
    const xpProgress = maxXp > 0 ? xp / maxXp : 0;
    const xpText = `${xp}/${maxXp} XP to Lv. ${level + 1}`;

    // Quest color
    const questColor = currentQuest ? new Color3(currentQuest.colorR, currentQuest.colorG, currentQuest.colorB) : Color3.fromRGB(255, 255, 255);

    if (!hasQuest) {
        return undefined; // Don't render if no quest is tracked
    }

    return (
        <frame
            key="TrackedQuestWindow"
            AnchorPoint={new Vector2(0.5, 0)}
            AutomaticSize={Enum.AutomaticSize.Y}
            BackgroundTransparency={1}
            Position={new UDim2(0.5, 0, 0.045, 61)}
            Size={new UDim2(0.425, 200, 0, 0)}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />

            {/* Quest Title */}
            <textlabel
                key="TitleLabel"
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                Size={new UDim2(1, 0, 0, 0)}
                Text={currentQuest.name || "no name"}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextSize={30}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>

            {/* Quest Description */}
            <textlabel
                key="DescriptionLabel"
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoSlabBold}
                LayoutOrder={1}
                Size={new UDim2(1, 0, 0, 0)}
                Text={getFormattedDescription()}
                TextColor3={Color3.fromRGB(182, 182, 182)}
                TextSize={20}
                TextWrapped={true}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uistroke Thickness={1.5} />
            </textlabel>

            {/* Background Color Indicator */}
            <frame
                key="Background"
                BackgroundTransparency={1}
                LayoutOrder={-1}
                Size={new UDim2(0, 0, 0, 0)}
                Visible={false}
            >
                <frame
                    key="Frame"
                    BackgroundColor3={questColor}
                    Size={new UDim2(1, 0, 1, 0)}
                />
            </frame>

            {/* Quest Completion Notification */}
            {showCompletion && (
                <frame
                    key="Completion"
                    BackgroundTransparency={1}
                    LayoutOrder={-5}
                    Size={new UDim2(0.5, 0, 0, 85)}
                >
                    <textlabel
                        AnchorPoint={new Vector2(0.5, 0)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0.5, 0, 0, 0)}
                        Rotation={-2}
                        Size={new UDim2(2, 0, 0.7, 0)}
                        Text="Quest Complete!"
                        TextColor3={Color3.fromRGB(175, 255, 194)}
                        TextScaled={true}
                        TextSize={30}
                        TextWrapped={true}
                    >
                        <uigradient
                            Color={new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(170, 255, 0))
                            ])}
                            Rotation={90}
                        />
                        <uistroke Thickness={2} />
                    </textlabel>

                    <imagelabel
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundTransparency={1}
                        Image="http://www.roblox.com/asset/?id=917186750"
                        ImageColor3={Color3.fromRGB(170, 255, 127)}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Size={new UDim2(1.5, 0, 3, 0)}
                        ZIndex={0}
                    />

                    <textlabel
                        key="RewardLabel"
                        AnchorPoint={new Vector2(0.5, 0)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabMedium}
                        Position={new UDim2(0.5, 0, 0.7, 0)}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text={completionMessage}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextSize={20}
                        TextWrapped={true}
                        TextYAlignment={Enum.TextYAlignment.Top}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>

                    <uipadding PaddingBottom={new UDim(0, 15)} />
                </frame>
            )}

            {/* XP Progress Bar */}
            {showProgressBar && (
                <canvasgroup
                    key="ProgressBar"
                    AnchorPoint={new Vector2(0.5, 0)}
                    BackgroundTransparency={1}
                    LayoutOrder={6}
                    Position={new UDim2(0.5, 0, 1, 15)}
                    Size={new UDim2(0.5, 0, 0, 45)}
                    ZIndex={5}
                >
                    <frame
                        key="Bar"
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundColor3={Color3.fromRGB(39, 39, 39)}
                        BorderSizePixel={0}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Size={new UDim2(0.9, 0, 1, -15)}
                    >
                        <textlabel
                            key="BarLabel"
                            AnchorPoint={new Vector2(0.5, 0.5)}
                            BackgroundTransparency={1}
                            FontFace={RobotoSlabBold}
                            Position={new UDim2(0.5, 0, 0.5, 0)}
                            Size={new UDim2(0.8, 0, 0.8, 0)}
                            Text={xpText}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextScaled={true}
                            ZIndex={2}
                        >
                            <uistroke Thickness={2} />
                        </textlabel>

                        <frame
                            key="Fill"
                            BackgroundColor3={Color3.fromRGB(255, 170, 255)}
                            BorderSizePixel={0}
                            Size={new UDim2(xpProgress, 0, 1, 0)}
                            Visible={xp > 0}
                        >
                            <uigradient
                                Color={new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(189, 58, 255))
                                ])}
                                Rotation={90}
                            />
                            <uicorner CornerRadius={new UDim(0, 10)} />
                        </frame>

                        <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
                        <uicorner CornerRadius={new UDim(0, 10)} />
                    </frame>
                </canvasgroup>
            )}

            <uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
        </frame>
    );
}