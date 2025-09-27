import type { Binding } from "@rbxts/react";
import React from "@rbxts/react";
import PlayerListRow, { PlayerRosterEntry } from "client/components/playerlist/PlayerListRow";
import { RobotoMono, RobotoSlabBold, RobotoSlabSemiBold } from "shared/asset/GameFonts";

interface PlayerListPanelProps {
    players: PlayerRosterEntry[];
    visible: boolean;
    progress: Binding<number>;
    size: UDim2;
    slideOffset: number;
}

const PANEL_MARGIN = 12;

export default function PlayerListPanel({ players, visible, progress, size, slideOffset }: PlayerListPanelProps) {
    const playerCount = players.size();
    const positionBinding = progress.map(
        (alpha) => new UDim2(1, -PANEL_MARGIN + (1 - alpha) * slideOffset, 0, PANEL_MARGIN),
    );
    return (
        <frame
            key="PlayerListPanel"
            AnchorPoint={new Vector2(1, 0)}
            BackgroundColor3={Color3.fromRGB(10, 14, 22)}
            BackgroundTransparency={progress.map((alpha) => 0.08 + (1 - alpha) * 0.35)}
            BorderSizePixel={0}
            Position={positionBinding}
            Size={size}
            Visible={visible}
            ZIndex={20}
        >
            <uicorner CornerRadius={new UDim(0, 14)} />
            <uistroke
                Color={Color3.fromRGB(30, 44, 64)}
                Transparency={progress.map((alpha) => 0.3 + (1 - alpha) * 0.5)}
                Thickness={1.5}
            />
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(16, 19, 28)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(12, 15, 24)),
                    ])
                }
                Rotation={-12}
            />
            <uipadding
                PaddingBottom={new UDim(0, 16)}
                PaddingLeft={new UDim(0, 16)}
                PaddingRight={new UDim(0, 16)}
                PaddingTop={new UDim(0, 16)}
            />
            <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                Padding={new UDim(0, 12)}
                SortOrder={Enum.SortOrder.LayoutOrder}
            />

            <frame
                key="Header"
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                LayoutOrder={0}
                Size={new UDim2(1, 0, 0, 0)}
            >
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Top}
                />
                <textlabel
                    key="Title"
                    AutomaticSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    LayoutOrder={0}
                    Size={new UDim2(1, 0, 0, 0)}
                    Text="EMPIRE ROSTER"
                    TextColor3={Color3.fromRGB(218, 228, 255)}
                    TextScaled={false}
                    TextSize={28}
                    TextWrapped={false}
                    TextXAlignment={Enum.TextXAlignment.Left}
                />
                <frame
                    key="HeaderMeta"
                    AutomaticSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    LayoutOrder={1}
                    Size={new UDim2(1, 0, 0, 0)}
                >
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Horizontal}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                    />
                    <textlabel
                        key="Count"
                        AutomaticSize={Enum.AutomaticSize.XY}
                        BackgroundTransparency={1}
                        FontFace={RobotoMono}
                        LayoutOrder={0}
                        Text={`${playerCount} player${playerCount === 1 ? "" : "s"} online`}
                        TextColor3={Color3.fromRGB(167, 190, 234)}
                        TextSize={16}
                        TextTransparency={0.05}
                        TextWrapped={false}
                        TextXAlignment={Enum.TextXAlignment.Left}
                    />
                </frame>
            </frame>
            <frame key="ListFrame" BackgroundTransparency={1} LayoutOrder={1} Size={new UDim2(1, 0, 1, -50)}>
                <scrollingframe
                    key="Roster"
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    BorderSizePixel={0}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    ScrollBarImageColor3={Color3.fromRGB(60, 80, 122)}
                    ScrollBarThickness={6}
                    Size={new UDim2(1, 0, 1, 0)}
                >
                    <uipadding
                        PaddingLeft={new UDim(0, 5)}
                        PaddingRight={new UDim(0, 10)}
                        PaddingTop={new UDim(0, 5)}
                        PaddingBottom={new UDim(0, 5)}
                    />
                    <uilistlayout
                        FillDirection={Enum.FillDirection.Vertical}
                        Padding={new UDim(0, 10)}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                    />

                    {playerCount === 0 ? (
                        <textlabel
                            key="Empty"
                            AutomaticSize={Enum.AutomaticSize.Y}
                            BackgroundTransparency={1}
                            FontFace={RobotoSlabSemiBold}
                            Size={new UDim2(1, 0, 0, 0)}
                            Text="No empires enlisted."
                            TextColor3={Color3.fromRGB(178, 196, 233)}
                            TextSize={18}
                            TextTransparency={0.1}
                            TextWrapped={false}
                            TextXAlignment={Enum.TextXAlignment.Center}
                        />
                    ) : undefined}

                    {players.map((entry) => (
                        <PlayerListRow key={`row-${entry.userId}`} entry={entry} />
                    ))}
                </scrollingframe>
            </frame>
        </frame>
    );
}
