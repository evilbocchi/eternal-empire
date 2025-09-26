import React, { Fragment } from "@rbxts/react";
import PurchaseOption from "client/components/item/upgrade/PurchaseOption";
import { RobotoMono, RobotoMonoBold } from "client/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import NamedUpgrade from "shared/namedupgrade/NamedUpgrade";

export default function UpgradeActionsPanel({
    selectedUpgrade,
    upgradeAmount,
    costs,
    isMaxed,
    onBuy1,
    onBuyNext,
    onBuyMax,
}: {
    selectedUpgrade?: NamedUpgrade;
    upgradeAmount?: number;
    costs: {
        buy1: string;
        buyNext: string;
        buyMax: string;
    };
    isMaxed: boolean;
    onBuy1: () => void;
    onBuyNext: () => void;
    onBuyMax: () => void;
}) {
    const displayAmount = selectedUpgrade
        ? selectedUpgrade.cap !== undefined
            ? `${upgradeAmount}/${selectedUpgrade.cap}`
            : tostring(upgradeAmount)
        : undefined;

    return (
        <Fragment>
            {/* Background panel */}
            <frame
                BackgroundColor3={Color3.fromRGB(25, 25, 35)}
                BackgroundTransparency={0.1}
                BorderSizePixel={0}
                Size={new UDim2(1, 0, 1, 0)}
                ZIndex={-1}
            >
                <uicorner CornerRadius={new UDim(0, 12)} />
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(45, 45, 55)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(25, 25, 35)),
                        ])
                    }
                    Rotation={135}
                />
                <uistroke
                    ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                    Color={Color3.fromRGB(85, 170, 255)}
                    Thickness={2}
                >
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(0.5, Color3.fromRGB(85, 170, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                            ])
                        }
                        Rotation={35}
                    />
                </uistroke>
            </frame>

            {/* Upgrade icon with enhanced styling */}
            <imagelabel
                BackgroundTransparency={1}
                Image={selectedUpgrade ? selectedUpgrade.image : getAsset("assets/NamedUpgrade.png")}
                Position={new UDim2(0.05, 0, 0.05, 0)}
                Size={new UDim2(0.25, 0, 0.4, 0)}
                ScaleType={Enum.ScaleType.Fit}
            />

            {/* Amount display with enhanced styling */}
            <textlabel
                AnchorPoint={new Vector2(0, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.05, 0, 0.4, 0)}
                Size={new UDim2(0.25, 0, 0.125, 0)}
                Text={displayAmount ?? ""}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>

            {/* Upgrade name with better styling */}
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.35, 0, 0.05, 0)}
                Size={new UDim2(0.6, 0, 0.15, 0)}
                Text={selectedUpgrade?.name ?? "<no upgrade selected>"}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={2}>
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(85, 170, 255)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(25, 25, 35)),
                            ])
                        }
                        Rotation={90}
                    />
                </uistroke>
            </textlabel>

            {/* Description with better formatting */}
            <frame
                BackgroundColor3={Color3.fromRGB(35, 35, 45)}
                BackgroundTransparency={0.3}
                BorderSizePixel={0}
                Position={new UDim2(0.35, 0, 0.2, 0)}
                Size={new UDim2(0.6, 0, 0.25, 0)}
            >
                <uicorner CornerRadius={new UDim(0, 6)} />
                <uistroke Color={Color3.fromRGB(75, 75, 85)} Thickness={1} />

                <textlabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoMono}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(1, -10, 1, -10)}
                    Text={selectedUpgrade?.description ?? "Select an upgrade to get started."}
                    TextColor3={Color3.fromRGB(200, 200, 210)}
                    TextScaled={true}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    TextYAlignment={Enum.TextYAlignment.Top}
                >
                    <uitextsizeconstraint MaxTextSize={25} />
                    <uistroke Thickness={1} />
                </textlabel>
            </frame>

            {/* Purchase options container with improved styling */}
            <frame
                BackgroundColor3={Color3.fromRGB(35, 35, 45)}
                BackgroundTransparency={0.2}
                BorderSizePixel={0}
                Position={new UDim2(0.05, 0, 0.5, 0)}
                Size={new UDim2(0.9, 0, 0.45, 0)}
            >
                <uicorner CornerRadius={new UDim(0, 8)} />
                <uistroke Color={Color3.fromRGB(75, 75, 85)} Thickness={2} />

                <PurchaseOption label="Buy x1" cost={costs.buy1} isMaxed={isMaxed} onPurchase={onBuy1} />
                <PurchaseOption label="Buy NEXT" cost={costs.buyNext} isMaxed={isMaxed} onPurchase={onBuyNext} />
                <PurchaseOption label="Buy MAX" cost={costs.buyMax} isMaxed={isMaxed} onPurchase={onBuyMax} />

                <uilistlayout
                    Padding={new UDim(0, 10)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
                <uipadding
                    PaddingBottom={new UDim(0, 15)}
                    PaddingLeft={new UDim(0, 15)}
                    PaddingRight={new UDim(0, 15)}
                    PaddingTop={new UDim(0, 15)}
                />
            </frame>

            <uipadding
                PaddingBottom={new UDim(0, 20)}
                PaddingLeft={new UDim(0, 20)}
                PaddingRight={new UDim(0, 20)}
                PaddingTop={new UDim(0, 20)}
            />
        </Fragment>
    );
}
