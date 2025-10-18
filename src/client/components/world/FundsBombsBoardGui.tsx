import { OnoeNum } from "@rbxts/serikanum";
import React, { useEffect } from "@rbxts/react";
import { MarketplaceService } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { showErrorToast } from "client/components/toast/ToastService";
import { RobotoSlabBold, RobotoSlabHeavy, RobotoSlabMedium } from "shared/asset/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import { BOMBS_PRODUCTS } from "shared/devproducts/BombsProducts";
import Packets from "shared/Packets";
import FundsBombsBoard from "shared/world/nodes/FundsBombsBoard";

export default function FundsBombsBoardGui() {
    const [amount, setAmount] = React.useState<OnoeNum>(new OnoeNum(Packets.balance.get().get("Funds Bombs") ?? 0));

    useEffect(() => {
        const connection = Packets.balance.observe((newBalance) => {
            setAmount(new OnoeNum(newBalance.get("Funds Bombs") ?? 0));
        });
        return () => connection.disconnect();
    }, []);

    return (
        <surfacegui
            Adornee={FundsBombsBoard.waitForInstance()}
            ClipsDescendants={true}
            LightInfluence={1}
            MaxDistance={150}
            ResetOnSpawn={false}
            SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Size={new UDim2(1, 0, 0.2, 0)}
                Text="Speed it up!"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={4}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(20, 29, 14)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
            </textlabel>
            <uipadding
                PaddingBottom={new UDim(0, 25)}
                PaddingLeft={new UDim(0, 25)}
                PaddingRight={new UDim(0, 25)}
                PaddingTop={new UDim(0, 25)}
            >
                <uipadding
                    PaddingBottom={new UDim(0, 15)}
                    PaddingLeft={new UDim(0, 15)}
                    PaddingRight={new UDim(0, 15)}
                    PaddingTop={new UDim(0, 15)}
                />
            </uipadding>
            <imagelabel
                BackgroundTransparency={1}
                Image={getAsset("assets/FundsBomb.png")}
                Position={new UDim2(0, 0, 0.525, 0)}
                ScaleType={Enum.ScaleType.Fit}
                Size={new UDim2(0.4, 0, 0.35, 0)}
            />
            <imagelabel
                BackgroundTransparency={1}
                Image={getAsset("assets/StripedRadialBeams.png")}
                Position={new UDim2(0, 0, 0.5, 0)}
                ScaleType={Enum.ScaleType.Fit}
                Size={new UDim2(0.4, 0, 0.5, 0)}
                ZIndex={-2}
            />
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabMedium}
                Position={new UDim2(0.4, 0, 0.3, 0)}
                Size={new UDim2(0.6, 0, 0.225, 0)}
                Text="Use a Funds Bomb for a x2 Funds boost across ALL servers for 15 minutes!"
                TextColor3={Color3.fromRGB(193, 193, 193)}
                TextSize={40}
                TextWrapped={true}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uistroke Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(20, 29, 14)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
            </textlabel>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabMedium}
                Position={new UDim2(0, 0, 0.3, 0)}
                Size={new UDim2(0.4, 0, 0.1, 0)}
                Text="You have"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={50}
                TextWrapped={true}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uistroke Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(20, 29, 14)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
            </textlabel>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Position={new UDim2(0, 0, 0.4, 0)}
                Size={new UDim2(0.4, 0, 0.15, 0)}
                Text={amount.toString()}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={50}
                TextWrapped={true}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uistroke Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(20, 29, 14)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 170, 0)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 85, 0)),
                        ])
                    }
                    Rotation={90}
                />
            </textlabel>
            <textbutton
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={0}
                Position={new UDim2(0.45, 0, 0.65, 0)}
                Size={new UDim2(0.5, 0, 0.15, 0)}
                Text={""}
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextSize={14}
                Event={{
                    Activated: () => {
                        playSound("MenuClick.mp3");
                        if (LOCAL_PLAYER === undefined) return;
                        MarketplaceService.PromptProductPurchase(LOCAL_PLAYER, BOMBS_PRODUCTS["Funds Bombs"]);
                    },
                }}
            >
                <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
                <uicorner CornerRadius={new UDim(0.2, 0)} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 170, 0)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 112, 41)),
                        ])
                    }
                    Rotation={90}
                />
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabHeavy}
                    Size={new UDim2(1, 0, 1, 0)}
                    Text="Use"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                >
                    <uistroke Thickness={3}>
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(20, 29, 14)),
                                ])
                            }
                            Rotation={90}
                        />
                    </uistroke>
                </textlabel>
                <uipadding
                    PaddingBottom={new UDim(0, 15)}
                    PaddingLeft={new UDim(0, 15)}
                    PaddingRight={new UDim(0, 15)}
                    PaddingTop={new UDim(0, 15)}
                />
            </textbutton>
            <textbutton
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={0}
                Position={new UDim2(0.5, 0, 0.825, 0)}
                Size={new UDim2(0.4, 0, 0.1, 0)}
                Text={""}
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextSize={14}
                Event={{
                    Activated: () => {
                        if (Packets.useBomb.toServer("Funds Bombs") === true) {
                            playSound("ItemPurchase.mp3");
                        } else {
                            playSound("Error.mp3");
                        }
                        showErrorToast("Unable to purchase Funds Bombs.");
                    },
                }}
            >
                <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
                <uicorner CornerRadius={new UDim(0.2, 0)} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(170, 255, 127)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(85, 170, 0)),
                        ])
                    }
                    Rotation={90}
                />
                <textlabel
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabBold}
                    Size={new UDim2(1, 0, 1, 0)}
                    Text="Buy 4 for 200 Robux"
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                >
                    <uistroke Thickness={3}>
                        <uigradient
                            Color={
                                new ColorSequence([
                                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(20, 29, 14)),
                                ])
                            }
                            Rotation={90}
                        />
                    </uistroke>
                </textlabel>
                <uipadding
                    PaddingBottom={new UDim(0, 10)}
                    PaddingLeft={new UDim(0, 25)}
                    PaddingRight={new UDim(0, 25)}
                    PaddingTop={new UDim(0, 10)}
                />
            </textbutton>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlabMedium}
                Position={new UDim2(0.4, 0, 0.525, 0)}
                Size={new UDim2(0.6, 0, 0.075, 0)}
                Text="(this is not p2w i swear)"
                TextColor3={Color3.fromRGB(139, 139, 139)}
                TextSize={25}
                TextWrapped={true}
                TextYAlignment={Enum.TextYAlignment.Top}
            >
                <uistroke Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(20, 29, 14)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
            </textlabel>
        </surfacegui>
    );
}
