import React, { useCallback, useMemo, useState } from "@rbxts/react";
import QuestOption from "client/components/quest/QuestOption";
import { useQuestData } from "client/components/quest/useQuestData";
import useSingleDocument from "client/components/sidebar/useSingleDocumentWindow";
import BasicWindow from "client/components/window/BasicWindow";
import ProgressBar from "client/components/window/ProgressBar";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { RobotoSlabHeavy } from "shared/asset/GameFonts";
import { getMaxXp } from "shared/constants";

export default function QuestWindow() {
    const { id, visible } = useSingleDocument({ id: "Quests" });
    const { questInfo, stagePerQuest, level, xp, trackedQuest, onTrackQuest } = useQuestData();
    const maxXp = getMaxXp(level);

    const [expandedQuests, setExpandedQuests] = useState(new Set<string>());

    const handleToggleQuestContent = useCallback((questId: string) => {
        setExpandedQuests((prev) => {
            const newSet = table.clone(prev);
            if (newSet.has(questId)) {
                playSound("CheckOff.mp3");
                newSet.delete(questId);
            } else {
                playSound("CheckOn.mp3");
                newSet.add(questId);
            }
            return newSet;
        });
    }, []);

    const handleTrackQuest = useCallback(
        (questId: string) => {
            if (trackedQuest === questId) {
                onTrackQuest(undefined); // Untrack
            } else {
                onTrackQuest(questId); // Track
            }
        },
        [trackedQuest, onTrackQuest],
    );

    const sortedQuests = useMemo(() => {
        const quests = new Array<[string, QuestInfo]>();
        for (const [questId, quest] of questInfo) {
            quests.push([questId, quest]);
        }
        return quests
            .filter(([id]) => {
                // Filter out very high level quests (likely admin/debug quests)
                const quest = questInfo.get(id);
                return quest && quest.level < 999;
            })
            .sort(([aId, aQuest], [bId, bQuest]) => {
                const aStage = stagePerQuest.get(aId) ?? 0;
                const bStage = stagePerQuest.get(bId) ?? 0;
                const aBelowReq = level < aQuest.level;
                const bBelowReq = level < bQuest.level;
                const aCompleted = aStage < 0;
                const bCompleted = bStage < 0;

                // Completed quests go to bottom
                if (aCompleted !== bCompleted) {
                    return aCompleted;
                }

                // Below requirement quests go to middle
                if (aBelowReq !== bBelowReq) {
                    return aBelowReq;
                }

                // Otherwise sort by level then order
                const levelDiff = aQuest.level - bQuest.level;
                if (levelDiff !== 0) return levelDiff < 0;

                return aQuest.order < bQuest.order;
            });
    }, [questInfo, stagePerQuest, level]);

    return (
        <BasicWindow
            id={id}
            icon={getAsset("assets/Quests.png")}
            backgroundColor={
                new ColorSequence([
                    new ColorSequenceKeypoint(0, Color3.fromRGB(89, 33, 46)),
                    new ColorSequenceKeypoint(1, Color3.fromRGB(56, 10, 10)),
                ])
            }
            strokeColor={
                new ColorSequence([
                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 94, 94)),
                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 18, 18)),
                ])
            }
            visible={visible}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 10)}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />

            {/* Level and XP Progress */}
            <frame key="Level" BackgroundTransparency={1} LayoutOrder={-1} Size={new UDim2(1, 0, 0, 32)}>
                {/* Current Level Display */}
                <frame
                    key="Current"
                    Active={true}
                    BackgroundColor3={Color3.fromRGB(255, 223, 62)}
                    BorderColor3={Color3.fromRGB(0, 0, 0)}
                    BorderSizePixel={5}
                    Selectable={true}
                    Size={new UDim2(0.3, 0, 1, 0)}
                >
                    <uistroke
                        ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                        Color={Color3.fromRGB(255, 255, 255)}
                        Thickness={3}
                    >
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 223, 62)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 137, 3)),
                                ])
                            }
                            Rotation={90}
                        />
                    </uistroke>
                    <textlabel
                        key="LevelLabel"
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabHeavy}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Size={new UDim2(0.8, 0, 0.8250000000000001, 0)}
                        Text={`Lv. ${level}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        TextSize={14}
                        TextWrapped={true}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 223, 41)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(255, 131, 7)),
                            ])
                        }
                        Rotation={90}
                    />
                </frame>

                {/* XP Progress Bar */}
                <ProgressBar
                    current={xp}
                    max={maxXp}
                    text={`${xp}/${maxXp} XP to Lv. ${level + 1}`}
                    colorSequence={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 170, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(189, 58, 255)),
                        ])
                    }
                    frameProps={{ Size: new UDim2(0.5, 0, 1, 0) }}
                />

                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                    FillDirection={Enum.FillDirection.Horizontal}
                    Padding={new UDim(0, 15)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
            </frame>

            {/* Quest List */}
            <scrollingframe
                key="QuestList"
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                BorderSizePixel={0}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                ScrollBarThickness={8}
                Size={new UDim2(1, 0, 1, -50)}
            >
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 15)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />

                <uipadding
                    PaddingBottom={new UDim(0, 5)}
                    PaddingLeft={new UDim(0, 15)}
                    PaddingRight={new UDim(0, 15)}
                    PaddingTop={new UDim(0, 8)}
                />

                {/* Render Quest Options */}
                {sortedQuests.map(([questId, quest]) => {
                    const currentStage = stagePerQuest.get(questId) ?? 0;
                    const isTracked = trackedQuest === questId;
                    const isExpanded = expandedQuests.has(questId);

                    return (
                        <QuestOption
                            key={questId}
                            questId={questId}
                            quest={quest}
                            currentStage={currentStage}
                            level={level}
                            isTracked={isTracked}
                            isExpanded={isExpanded}
                            onToggleExpanded={() => handleToggleQuestContent(questId)}
                            onTrack={() => handleTrackQuest(questId)}
                        />
                    );
                })}
            </scrollingframe>
        </BasicWindow>
    );
}
