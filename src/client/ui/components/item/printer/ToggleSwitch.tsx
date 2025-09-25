import React, { useState, useRef, useEffect } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";
import { RobotoSlab } from "client/ui/GameFonts";
import Packets from "shared/Packets";

export default function ToggleSwitch({
    setupName,
    label,
    initialEnabled = false,
    onToggle,
}: {
    setupName: string;
    label: string;
    initialEnabled?: boolean;
    onToggle?: (newState: boolean) => void;
}) {
    const [isEnabled, setIsEnabled] = useState(initialEnabled);
    const toggleRef = useRef<Frame>();
    const buttonRef = useRef<TextButton>();

    const handleToggle = () => {
        const newState = Packets.autoloadSetup.toServer(setupName);
        if (newState) {
            playSound("CheckOn.mp3");
        } else {
            playSound("CheckOff.mp3");
        }
        setIsEnabled(newState);

        // Animate the toggle
        if (toggleRef.current && buttonRef.current) {
            const targetPosition = newState ? new UDim2(1, -4, 0.5, 0) : new UDim2(0, 4, 0.5, 0);
            const targetAnchor = newState ? new Vector2(1, 0.5) : new Vector2(0, 0.5);
            const targetColor = newState ? Color3.fromRGB(127, 255, 127) : Color3.fromRGB(255, 79, 79);

            const tweenInfo = new TweenInfo(0.4, Enum.EasingStyle.Quart, Enum.EasingDirection.Out);

            // Tween position and color
            TweenService.Create(toggleRef.current, tweenInfo, {
                Position: targetPosition,
                AnchorPoint: targetAnchor,
                BackgroundColor3: targetColor,
            }).Play();
        }

        if (onToggle) {
            onToggle(newState);
        }
    };

    const toggleColor = isEnabled ? Color3.fromRGB(127, 255, 127) : Color3.fromRGB(255, 79, 79);
    const togglePosition = isEnabled ? new UDim2(1, -4, 0.5, 0) : new UDim2(0, 4, 0.5, 0);
    const toggleAnchor = isEnabled ? new Vector2(1, 0.5) : new Vector2(0, 0.5);

    return (
        <frame BackgroundTransparency={1} LayoutOrder={-5} Size={new UDim2(0.4, 0, 1, 0)}>
            <textlabel
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Size={new UDim2(1, 0, 0.35, 0)}
                Text={label}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>
            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
            <textbutton
                ref={buttonRef}
                BackgroundColor3={toggleColor.Lerp(Color3.fromRGB(0, 0, 0), 0.8)}
                BorderSizePixel={0}
                Font={Enum.Font.SourceSans}
                LayoutOrder={5}
                Size={new UDim2(0.4, 0, 0.25, 0)}
                Text={""}
                TextColor3={Color3.fromRGB(0, 0, 0)}
                TextSize={14}
                Event={{
                    Activated: handleToggle,
                }}
            >
                <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
                <frame
                    ref={toggleRef}
                    AnchorPoint={toggleAnchor}
                    BackgroundColor3={toggleColor}
                    BorderSizePixel={0}
                    Position={togglePosition}
                    Size={new UDim2(0.3, 0, 0.8, -2)}
                >
                    <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Thickness={2} />
                </frame>
            </textbutton>
        </frame>
    );
}
