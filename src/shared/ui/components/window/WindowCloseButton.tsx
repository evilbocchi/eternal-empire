import React from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";

interface WindowCloseButtonProps {
    onClick: () => void;
}

export default function WindowCloseButton({ onClick }: WindowCloseButtonProps) {
    const handleClick = () => {
        playSound("MenuClose.mp3");
        onClick();
    };

    return (<textbutton
        key="CloseButton"
        AnchorPoint={new Vector2(0.5, 0.5)}
        BackgroundColor3={Color3.fromRGB(255, 76, 76)}
        BorderColor3={Color3.fromRGB(45, 45, 45)}
        BorderSizePixel={3}
        Event={{
            Activated: handleClick,
            MouseEnter: () => {
                
            },
            MouseLeave: () => {
                
            }
        }}
        Position={new UDim2(1, -10, 0, 10)}
        Size={new UDim2(0, 30, 0, 30)}
        Text={""}
        TextColor3={Color3.fromRGB(255, 255, 255)}
        TextScaled={true}
        TextSize={14}
        TextStrokeTransparency={0}
        TextWrapped={true}
        ZIndex={104}
    >
        <uiaspectratioconstraint />
        <uigradient
            Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), new ColorSequenceKeypoint(0.467, Color3.fromRGB(206, 206, 206)), new ColorSequenceKeypoint(1, Color3.fromRGB(173, 0, 0))])}
            Rotation={90}
        />
        <imagelabel
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundTransparency={1}
            Image={getAsset("assets/Mul.png")}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            Size={new UDim2(1, -10, 1, -10)}
        />
        <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(255, 15, 15)} Thickness={2}>
            <uigradient
                Color={new ColorSequence([new ColorSequenceKeypoint(0, Color3.fromRGB(170, 170, 170)), new ColorSequenceKeypoint(0.5, Color3.fromRGB(171, 171, 171)), new ColorSequenceKeypoint(1, Color3.fromRGB(68, 68, 68))])}
                Rotation={90}
            />
        </uistroke>
    </textbutton>);
}