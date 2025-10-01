/**
 * @fileoverview Header component for leaderboards showing column titles.
 */

import React from "@rbxts/react";
import { RobotoMonoBold, RobotoSlabHeavy } from "shared/asset/GameFonts";

interface LeaderboardHeaderProps {
    title: string;
    gradient: ColorSequence;
}

/**
 * Header section for leaderboards showing the title and column labels.
 */
export default function LeaderboardHeader({ title, gradient }: LeaderboardHeaderProps) {
    return (
        <textlabel
            key="Header"
            BackgroundTransparency={1}
            FontFace={RobotoSlabHeavy}
            Position={new UDim2(0, 0, 0.02, 0)}
            Size={new UDim2(1, 0, 0, 50)}
            Text={title}
            TextColor3={Color3.fromRGB(255, 255, 255)}
            TextScaled={true}
            TextSize={36}
            TextWrapped={true}
        >
            <uigradient Color={gradient} Rotation={89} />
        </textlabel>
    );
}

export function ColumnHeader({ valueLabel }: { valueLabel: string }) {
    return (
        <frame key="ColumnHeaders" BackgroundTransparency={1} LayoutOrder={-1} Size={new UDim2(1, 0, 0, 40)}>
            <textlabel
                key="PlaceHeader"
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Size={new UDim2(0.125, 0, 1, 0)}
                Text="#"
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextScaled={true}
                TextSize={14}
                TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
                TextStrokeTransparency={0.9}
                TextWrapped={true}
            />
            <textlabel
                key="NameHeader"
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.15, 0, 0, 0)}
                Size={new UDim2(0.6, 0, 1, 0)}
                Text="Name"
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextScaled={true}
                TextSize={14}
                TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
                TextStrokeTransparency={0.9}
                TextWrapped={true}
            />
            <textlabel
                key="ValueHeader"
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.85, 0, 0, 0)}
                Size={new UDim2(0.2, 0, 1, 0)}
                Text={valueLabel}
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextScaled={true}
                TextSize={14}
                TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
                TextStrokeTransparency={0.9}
                TextWrapped={true}
            />
            <uicorner CornerRadius={new UDim(0, 9)} />
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 5)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <uipadding PaddingLeft={new UDim(0, 6)} PaddingRight={new UDim(0, 6)} />
        </frame>
    );
}
