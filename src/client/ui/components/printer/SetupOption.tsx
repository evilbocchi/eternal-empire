import React from "@rbxts/react";
import { playSound } from "shared/asset/GameAssets";
import SetupBody from "client/ui/components/printer/SetupBody";
import SetupHeader from "client/ui/components/printer/SetupHeader";

interface SetupOptionProps {
    setupName?: string;
    cost?: string;
    isAutoloadEnabled?: boolean;
    onEditName?: () => void;
    onToggleAutoload?: () => void;
}

export default function SetupOption({
    setupName = "Setup 1",
    cost = "Cost: $1Qd, 100 W, 140 Purifier Clicks",
    isAutoloadEnabled = false,
    onEditName,
    onToggleAutoload,
}: SetupOptionProps) {
    const onSave = () => {
        playSound("MagicSprinkle.mp3", undefined, (sound) => {
            sound.PlaybackSpeed = 1.15;
        });
    };

    const onLoad = () => {
        playSound("MagicSprinkle.mp3", undefined, (sound) => {
            sound.PlaybackSpeed = 0.95;
            const reverb = new Instance("ReverbSoundEffect");
            reverb.Parent = sound;
        });
    };

    return (
        <frame
            key="SetupOption"
            BackgroundColor3={Color3.fromRGB(0, 0, 0)}
            BackgroundTransparency={0.8}
            BorderSizePixel={0}
            Size={new UDim2(1, 0, 0, 125)}
        >
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <SetupHeader setupName={setupName} cost={cost} onEditClick={onEditName} />
            <SetupBody
                isAutoloadEnabled={isAutoloadEnabled}
                onSave={onSave}
                onLoad={onLoad}
                onToggleAutoload={onToggleAutoload}
            />
        </frame>
    );
}
