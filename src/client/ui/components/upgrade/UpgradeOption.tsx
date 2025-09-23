import React from "@rbxts/react";
import { RobotoMonoBold } from "client/ui/GameFonts";
import NamedUpgrade from "shared/namedupgrade/NamedUpgrade";

export default function UpgradeOption({
    upgrade,
    amount,
    isMaxed,
    onSelect,
    isSelected,
}: {
    upgrade: NamedUpgrade;
    amount: number;
    isMaxed: boolean;
    onSelect: () => void;
    isSelected: boolean;
}) {
    return (
        <frame Active={true} BackgroundTransparency={1} Selectable={true} Size={new UDim2(0, 125, 0, 125)}>
            <frame
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundColor3={Color3.fromRGB(115, 115, 115)}
                BorderSizePixel={0}
                LayoutOrder={-5}
                Position={new UDim2(0.5, 4, 0.5, 4)}
                Rotation={-2}
                Size={new UDim2(0.9, 0, 0.9, 0)}
                ZIndex={0}
            />
            <textlabel
                AnchorPoint={new Vector2(0, 0.5)}
                BackgroundTransparency={1}
                FontFace={RobotoMonoBold}
                Position={new UDim2(0, 0, 0.9, 0)}
                Size={new UDim2(1, 0, 0.4, 0)}
                Text={isMaxed ? "MAXED" : tostring(amount)}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
                ZIndex={2}
            >
                <uistroke Thickness={2} />
            </textlabel>
            <imagebutton
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderSizePixel={0}
                Image={upgrade.image}
                Position={new UDim2(0.5, -2, 0.5, -2)}
                Rotation={-2}
                Selectable={false}
                Size={new UDim2(0.9, 0, 0.9, 0)}
                Event={{
                    Activated: onSelect,
                }}
            />
        </frame>
    );
}
