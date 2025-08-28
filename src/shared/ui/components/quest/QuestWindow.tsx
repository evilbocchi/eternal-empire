import React from "@rbxts/react";
import { getMaxXp } from "shared/constants";
import QuestOption from "shared/ui/components/quest/QuestOption";
import { useQuestData } from "shared/ui/components/quest/useQuestData";
import { RobotoSlabBold } from "shared/ui/GameFonts";


export default function QuestWindow() {
    const {
        questInfo,
        stagePerQuest,
        level,
        xp,
        availableQuests,
        trackedQuest,
        onTrackQuest
    } = useQuestData();

    const [expandedQuests, setExpandedQuests] = React.useState(new Set<string>());

    const handleToggleQuestContent = React.useCallback((questId: string) => {
        setExpandedQuests(prev => {
            const newSet = table.clone(prev);
            if (newSet.has(questId)) {
                newSet.delete(questId);
            } else {
                newSet.add(questId);
            }
            return newSet;
        });
    }, []);

    const handleTrackQuest = React.useCallback((questId: string) => {
        if (trackedQuest === questId) {
            onTrackQuest(undefined); // Untrack
        } else {
            onTrackQuest(questId); // Track
        }
    }, [trackedQuest, onTrackQuest]);

    // Calculate XP progress
    const maxXp = getMaxXp(level);
    const xpProgress = maxXp > 0 ? xp / maxXp : 0;
    const xpText = `${xp}/${maxXp} XP to Lv. ${level + 1}`;

    // Sort quests by their natural order
    const sortedQuests = React.useMemo(() => {
        const quests = new Array<[string, QuestInfo]>();
        for (const questId of availableQuests) {
            const quest = questInfo.get(questId);
            if (quest) {
                quests.push([questId, quest]);
            }
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
                if (levelDiff !== 0)
                    return levelDiff < 0;

                return aQuest.order < bQuest.order;
            });
    }, [questInfo, stagePerQuest, level]);

    return (
        <frame
            key="Quests"
            BackgroundTransparency={1}
            Size={new UDim2(1, 0, 1, 0)}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 10)}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />

            {/* Level and XP Progress */}
            <frame
                key="Level"
                BackgroundTransparency={1}
                LayoutOrder={-1}
                Size={new UDim2(1, 0, 0, 60)}
            >
                {/* Current Level Display */}
                <frame
                    key="Current"
                    AnchorPoint={new Vector2(0, 0.5)}
                    BackgroundTransparency={1}
                    Position={new UDim2(0, 10, 0.5, 0)}
                    Size={new UDim2(0.3, 0, 0.8, 0)}
                >
                    <textlabel
                        key="LevelLabel"
                        AnchorPoint={new Vector2(0.5, 0.5)}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        Position={new UDim2(0.5, 0, 0.5, 0)}
                        Size={new UDim2(1, 0, 1, 0)}
                        Text={`Lv. ${level}`}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                    >
                        <uistroke Thickness={2} />
                    </textlabel>
                </frame>

                {/* XP Progress Bar */}
                <frame
                    key="ProgressBar"
                    AnchorPoint={new Vector2(1, 0.5)}
                    BackgroundColor3={Color3.fromRGB(39, 39, 39)}
                    BorderSizePixel={0}
                    Position={new UDim2(1, -10, 0.5, 0)}
                    Size={new UDim2(0.65, 0, 0.6, 0)}
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
            </frame>

            {/* Quest List */}
            <scrollingframe
                key="QuestList"
                AutomaticCanvasSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                BorderSizePixel={0}
                CanvasSize={new UDim2(0, 0, 0, 0)}
                ScrollBarThickness={8}
                Size={new UDim2(1, 0, 1, -70)}
                TopImage="rbxasset://textures/ui/Scroll/scroll-middle.png"
                BottomImage="rbxasset://textures/ui/Scroll/scroll-middle.png"
            >
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 5)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />

                <uipadding
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 10)}
                    PaddingTop={new UDim(0, 10)}
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
        </frame>
    );
}