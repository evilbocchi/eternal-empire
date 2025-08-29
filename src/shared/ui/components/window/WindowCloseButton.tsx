import React, { useRef } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import useHotkeyWithTooltip from "shared/ui/components/hotkeys/useHotkeyWithTooltip";

interface WindowCloseButtonProps {
    onClick: () => void;
}

export default function WindowCloseButton({ onClick }: WindowCloseButtonProps) {
    const closeButtonRef = useRef<TextButton>();
    const defaultColor = Color3.fromRGB(255, 76, 76);
    const { events } = useHotkeyWithTooltip({
        keyCode: Enum.KeyCode.X,
        action: () => {
            const parent = closeButtonRef.current?.Parent;
            if (!parent || !parent.IsA("GuiObject") || !parent.Visible)
                return false;

            playSound("MenuClose.mp3");
            onClick();
            return true;
        },
        onEnter: () => TweenService.Create(closeButtonRef.current!, new TweenInfo(0.1), {
            BackgroundColor3: defaultColor.Lerp(new Color3(1, 1, 1), 0.5),
            Rotation: 5
        }).Play(),
        onLeave: () => TweenService.Create(closeButtonRef.current!, new TweenInfo(0.1), {
            BackgroundColor3: defaultColor,
            Rotation: 0
        }).Play()
    });

    return (<textbutton
        key="CloseButton"
        ref={closeButtonRef}
        AnchorPoint={new Vector2(0.5, 0.5)}
        AutoButtonColor={false}
        BackgroundColor3={defaultColor}
        BorderColor3={Color3.fromRGB(45, 45, 45)}
        BorderSizePixel={3}
        Event={{ ...events }}
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