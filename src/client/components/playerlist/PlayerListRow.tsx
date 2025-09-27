import React from "@rbxts/react";
import { RobotoMono, RobotoSlabBold } from "shared/asset/GameFonts";

export interface PlayerRosterEntry {
    userId: number;
    displayName: string;
    username: string;
    area: string;
    donated: number;
    accountAgeDays: number;
    isLocal: boolean;
    isDeveloper: boolean;
    thumbnail?: string;
    joinOrder: number;
}

interface PlayerListRowProps {
    entry: PlayerRosterEntry;
}

function getAccentColor(entry: PlayerRosterEntry) {
    if (entry.isLocal) {
        return Color3.fromRGB(0, 176, 255);
    }
    if (entry.isDeveloper) {
        return Color3.fromRGB(217, 131, 255);
    }
    return Color3.fromRGB(146, 186, 255);
}

function getBaseColor(entry: PlayerRosterEntry) {
    if (entry.isLocal) {
        return Color3.fromRGB(20, 28, 40);
    }
    if (entry.isDeveloper) {
        return Color3.fromRGB(33, 24, 39);
    }
    return Color3.fromRGB(18, 21, 27);
}

function formatDonated(amount: number) {
    if (amount >= 1000) {
        return `${math.floor(amount / 10) / 100}K R$ :D`;
    }
    return `${math.floor(amount * 100) / 100} R$`;
}

export default function PlayerListRow({ entry }: PlayerListRowProps) {
    const accent = getAccentColor(entry);
    const base = getBaseColor(entry);

    return (
        <frame
            key={`player-${entry.userId}`}
            BackgroundColor3={base}
            BorderSizePixel={0}
            LayoutOrder={entry.isLocal ? -1 : entry.joinOrder}
            Size={new UDim2(1, 0, 0, 72)}
        >
            <uicorner CornerRadius={new UDim(0, 10)} />
            <uistroke Color={accent} Transparency={entry.isLocal ? 0.35 : 0.65} Thickness={1.5} />
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, base),
                        new ColorSequenceKeypoint(1, base.Lerp(accent, 0.18)),
                    ])
                }
                Rotation={0}
            />
            <uipadding
                PaddingBottom={new UDim(0, 10)}
                PaddingLeft={new UDim(0, 12)}
                PaddingRight={new UDim(0, 12)}
                PaddingTop={new UDim(0, 10)}
            />
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Left}
                Padding={new UDim(0, 0)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />

            <frame
                key="Identity"
                AutomaticSize={Enum.AutomaticSize.XY}
                BackgroundTransparency={1}
                LayoutOrder={0}
                Size={new UDim2(0.65, 0, 1, 0)}
            >
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Left}
                    Padding={new UDim(0, 10)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />

                <imagelabel
                    key="Avatar"
                    BackgroundColor3={accent}
                    BackgroundTransparency={entry.thumbnail === undefined ? 0 : 1}
                    BorderSizePixel={0}
                    Image={entry.thumbnail ?? ""}
                    LayoutOrder={0}
                    Size={new UDim2(0, 48, 0, 48)}
                >
                    <uicorner CornerRadius={new UDim(0.5, 0)} />
                    <uistroke Color={accent.Lerp(new Color3(0, 0, 0), 0.4)} Transparency={0.4} Thickness={1.5} />
                </imagelabel>

                <frame
                    key="IdentityTexts"
                    AutomaticSize={Enum.AutomaticSize.XY}
                    BackgroundTransparency={1}
                    LayoutOrder={1}
                >
                    <uilistlayout
                        HorizontalAlignment={Enum.HorizontalAlignment.Left}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                        VerticalAlignment={Enum.VerticalAlignment.Center}
                    />

                    <textlabel
                        key="DisplayName"
                        AutomaticSize={Enum.AutomaticSize.XY}
                        BackgroundTransparency={1}
                        FontFace={RobotoSlabBold}
                        LayoutOrder={0}
                        Text={entry.displayName}
                        TextColor3={Color3.fromRGB(230, 238, 255)}
                        TextSize={18}
                        TextWrapped={true}
                    />
                    <frame key="Meta" AutomaticSize={Enum.AutomaticSize.XY} BackgroundTransparency={1} LayoutOrder={1}>
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Horizontal}
                            HorizontalAlignment={Enum.HorizontalAlignment.Left}
                            Padding={new UDim(0, 6)}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                            VerticalAlignment={Enum.VerticalAlignment.Center}
                        />
                        <textlabel
                            key="Username"
                            AutomaticSize={Enum.AutomaticSize.XY}
                            BackgroundTransparency={1}
                            FontFace={RobotoMono}
                            LayoutOrder={0}
                            Text={`@${entry.username}`}
                            TextColor3={Color3.fromRGB(175, 190, 222)}
                            TextSize={14}
                            TextTransparency={0.1}
                            TextWrapped={false}
                        />
                        {entry.isDeveloper && (
                            <textlabel
                                key="DeveloperBadge"
                                AutomaticSize={Enum.AutomaticSize.XY}
                                BackgroundColor3={accent}
                                FontFace={RobotoMono}
                                LayoutOrder={1}
                                Text="DEV"
                                TextColor3={Color3.fromRGB(14, 18, 23)}
                                TextSize={12}
                            >
                                <uicorner CornerRadius={new UDim(0.5, 0)} />
                                <uipadding
                                    PaddingBottom={new UDim(0, 2)}
                                    PaddingLeft={new UDim(0, 6)}
                                    PaddingRight={new UDim(0, 6)}
                                    PaddingTop={new UDim(0, 2)}
                                />
                            </textlabel>
                        )}
                        {entry.isLocal && (
                            <textlabel
                                key="YouBadge"
                                AutomaticSize={Enum.AutomaticSize.XY}
                                BackgroundColor3={accent}
                                FontFace={RobotoMono}
                                LayoutOrder={2}
                                Text="YOU"
                                TextColor3={Color3.fromRGB(13, 17, 22)}
                                TextSize={12}
                            >
                                <uicorner CornerRadius={new UDim(0.5, 0)} />
                                <uipadding
                                    PaddingBottom={new UDim(0, 2)}
                                    PaddingLeft={new UDim(0, 6)}
                                    PaddingRight={new UDim(0, 6)}
                                    PaddingTop={new UDim(0, 2)}
                                />
                            </textlabel>
                        )}
                    </frame>
                </frame>
            </frame>

            <frame
                key="Stats"
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                LayoutOrder={1}
                Size={new UDim2(0.35, 0, 1, 0)}
            >
                <uilistlayout
                    FillDirection={Enum.FillDirection.Vertical}
                    HorizontalAlignment={Enum.HorizontalAlignment.Right}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />

                <textlabel
                    key="Area"
                    AutomaticSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    FontFace={RobotoMono}
                    LayoutOrder={0}
                    Text={entry.area}
                    TextColor3={Color3.fromRGB(197, 213, 243)}
                    TextSize={14}
                    TextXAlignment={Enum.TextXAlignment.Right}
                    TextWrapped={false}
                    Size={new UDim2(1, 0, 0, 0)}
                />

                <textlabel
                    key="Donated"
                    AutomaticSize={Enum.AutomaticSize.XY}
                    BackgroundTransparency={1}
                    FontFace={RobotoMono}
                    LayoutOrder={0}
                    Text={entry.donated > 0 ? `Donated ${formatDonated(entry.donated)}` : "-"}
                    TextColor3={Color3.fromRGB(181, 240, 214)}
                    TextSize={14}
                    TextXAlignment={Enum.TextXAlignment.Right}
                    TextWrapped={false}
                    Size={new UDim2(1, 0, 0, 0)}
                />
            </frame>
        </frame>
    );
}
