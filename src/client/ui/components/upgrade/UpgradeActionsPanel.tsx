import React, { Fragment } from "@rbxts/react";
import { RobotoMono, RobotoMonoBold } from "client/ui/GameFonts";
import NamedUpgrade from "shared/namedupgrade/NamedUpgrade";
import PurchaseOption from "./PurchaseOption";

export function UpgradeActionsPanel({
    selectedUpgrade,
    upgradeAmount,
    costs,
    isMaxed,
    onBuy1,
    onBuyNext,
    onBuyMax,
}: {
    selectedUpgrade?: NamedUpgrade;
    upgradeAmount: number;
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
    const displayAmount =
        selectedUpgrade?.cap !== undefined ? `${upgradeAmount}/${selectedUpgrade.cap}` : tostring(upgradeAmount);

    return (
        <Fragment>
            <imagelabel
                BackgroundTransparency={1}
                Image={selectedUpgrade?.image}
                Size={new UDim2(0.25, 0, 0.25, 0)}
                SizeConstraint={Enum.SizeConstraint.RelativeXX}
            />
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.25, 0, 0, 0)}
                Size={new UDim2(0.75, 0, 0.125, 0)}
                Text={selectedUpgrade?.name ?? "<no upgrade selected>"}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke />
            </textlabel>
            <textlabel
                AutomaticSize={Enum.AutomaticSize.Y}
                BackgroundTransparency={1}
                FontFace={RobotoMono}
                Position={new UDim2(0.25, 0, 0.125, 0)}
                Size={new UDim2(0.75, 0, 0, 0)}
                Text={selectedUpgrade?.description ?? "Select an upgrade to get started."}
                TextColor3={Color3.fromRGB(172, 172, 172)}
                TextSize={30}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke />
                <uipadding PaddingLeft={new UDim(0, 25)} PaddingRight={new UDim(0, 25)} />
            </textlabel>
            <frame
                Active={true}
                BackgroundTransparency={1}
                Position={new UDim2(0, 0, 0.475, 0)}
                Size={new UDim2(1, 0, 0.5, 0)}
            >
                <PurchaseOption label="Buy x1" cost={costs.buy1} isMaxed={isMaxed} onPurchase={onBuy1} />
                <PurchaseOption label="Buy NEXT" cost={costs.buyNext} isMaxed={isMaxed} onPurchase={onBuyNext} />
                <PurchaseOption label="Buy MAX" cost={costs.buyMax} isMaxed={isMaxed} onPurchase={onBuyMax} />
                <uilistlayout Padding={new UDim(0, 15)} SortOrder={Enum.SortOrder.LayoutOrder} />
            </frame>
            <textlabel
                AnchorPoint={new Vector2(0, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0, 0, 0.35, 0)}
                Size={new UDim2(0.25, 0, 0.125, 0)}
                Text={displayAmount ?? ""}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
                ZIndex={2}
            >
                <uistroke Thickness={2} />
            </textlabel>

            <uipadding
                PaddingBottom={new UDim(0, 25)}
                PaddingLeft={new UDim(0, 25)}
                PaddingRight={new UDim(0, 25)}
                PaddingTop={new UDim(0, 25)}
            />
        </Fragment>
    );
}
