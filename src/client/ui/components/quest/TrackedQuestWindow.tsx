import React, { useEffect, useState } from "@rbxts/react";
import { ReplicatedStorage } from "@rbxts/services";
import { RobotoSlabBold } from "client/ui/GameFonts";
import { playSound } from "shared/asset/GameAssets";
import { useQuestData } from "./useQuestData";

/**
 * Returns the formatted quest description for a given quest and stage.
 * @param id The quest ID.
 * @param quest The quest info.
 * @param stageNum The stage number.
 */
function getFormattedDescription(id?: string, quest?: QuestInfo, stageNum = 0) {
    if (stageNum < 0) {
        return "Quest complete.";
    }
    let desc = quest?.stages[stageNum]?.description;
    if (desc === undefined || id === undefined) {
        return "<no description provided>";
    }
    const position = ReplicatedStorage.GetAttribute(id + stageNum) as Vector3 | undefined;
    if (position !== undefined) {
        desc = desc.gsub(
            "%%coords%%",
            `(${math.round(position.X)}, ${math.round(position.Y)}, ${math.round(position.Z)})`,
        )[0];
    }
    return desc;
}

export default function TrackedQuestWindow() {
    const { questInfo, stagePerQuest, trackedQuest } = useQuestData();
    const currentQuest = trackedQuest ? questInfo.get(trackedQuest) : undefined;
    const currentStage = trackedQuest ? (stagePerQuest.get(trackedQuest) ?? 0) : 0;
    const hasQuest = currentQuest !== undefined && currentStage >= 0;
    const [lastKey, setLastKey] = useState<string | undefined>();

    useEffect(() => {
        if (!currentQuest || trackedQuest === undefined) return; // Don't play sound if no quest
        const key = `${currentQuest}${currentStage}`;
        if (key === lastKey) return;
        playSound("QuestNextStage.mp3");
        setLastKey(key);
    }, [currentQuest, currentStage]);

    const questColor = currentQuest
        ? new Color3(currentQuest.colorR, currentQuest.colorG, currentQuest.colorB)
        : Color3.fromRGB(255, 255, 255);

    if (!hasQuest) {
        return undefined;
    }

    return (
        <frame
            key="TrackedQuestWindow"
            AnchorPoint={new Vector2(1, 0)}
            AutomaticSize={Enum.AutomaticSize.Y}
            BackgroundTransparency={1}
            Position={new UDim2(1, -5, 0, 30)}
            Size={new UDim2(0.2, 200, 0, 0)}
            ZIndex={-1}
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
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uigradient
                    Color={new ColorSequence(questColor.Lerp(new Color3(1, 1, 1), 0.5), questColor)}
                    Rotation={50}
                />
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
                Text={getFormattedDescription(trackedQuest, currentQuest, currentStage)}
                TextColor3={Color3.fromRGB(182, 182, 182)}
                TextSize={20}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uistroke Thickness={1.5} />
            </textlabel>
            <uipadding PaddingBottom={new UDim(0, 10)} PaddingTop={new UDim(0, 10)} />
        </frame>
    );
}
