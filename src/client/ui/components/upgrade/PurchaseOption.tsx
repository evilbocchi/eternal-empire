import React from "@rbxts/react";
import { RobotoMonoBold } from "client/ui/GameFonts";

export default function PurchaseOption({
    label,
    cost,
    isMaxed,
    onPurchase,
}: {
    label: string;
    cost: string;
    isMaxed: boolean;
    onPurchase: () => void;
}) {
    return (
        <frame Active={true} BackgroundTransparency={1} Size={new UDim2(1, 0, 0.3, 0)}>
            <textbutton
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={0}
                Rotation={2}
                Size={new UDim2(0.25, 0, 1, 0)}
                Text={""}
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextSize={14}
                Event={{
                    Activated: onPurchase,
                }}
            >
                <textlabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    FontFace={RobotoMonoBold}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Size={new UDim2(0.8, 0, 0.75, 0)}
                    Text={label}
                    TextColor3={Color3.fromRGB(0, 0, 0)}
                    TextScaled={true}
                    TextWrapped={true}
                />
            </textbutton>
            <frame
                Active={true}
                BackgroundColor3={Color3.fromRGB(115, 115, 115)}
                BorderSizePixel={0}
                Position={new UDim2(0, -4, 0, -4)}
                Rotation={2}
                Selectable={true}
                Size={new UDim2(0.25, 0, 1, 0)}
                ZIndex={0}
            />
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0.25, 0, 0, 0)}
                Size={new UDim2(0.75, 0, 1, 0)}
                Text={isMaxed ? "MAXED" : cost}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uipadding PaddingBottom={new UDim(0, 5)} PaddingLeft={new UDim(0, 25)} PaddingTop={new UDim(0, 5)} />
                <uistroke />
            </textlabel>
        </frame>
    );
}
