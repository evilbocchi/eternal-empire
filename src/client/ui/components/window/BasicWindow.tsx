import React, { useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import WindowCloseButton from "client/ui/components/window/WindowCloseButton";
import { useWindow } from "client/ui/components/window/WindowManager";
import WindowTitle from "client/ui/components/window/WindowTitle";
import { getAsset } from "shared/asset/AssetMap";

declare global {
    interface WindowProps {
        visible: boolean;
        icon: string;
        title: string;
        colorSequence?: ColorSequence;
        onClose: () => void;
        children: React.ReactNode;
        priority?: number; // Optional priority for close order
        size?: UDim2; // Optional size for the window
    }
}

export default function BasicWindow({
    visible,
    icon,
    title,
    children,
    onClose,
    colorSequence,
    priority = 0,
}: WindowProps) {
    const frameRef = useRef<Frame>();
    const [previousVisible, setPreviousVisible] = useState(visible);
    const initialPosition = new UDim2(0.5, 0, 1, -40);

    useWindow({ id: title, visible, onClose, priority });

    useEffect(() => {
        const action = visible && !previousVisible ? "open" : !visible && previousVisible ? "close" : undefined;
        // Handle animation
        if (action) {
            const frame = frameRef.current!;

            if (action === "open") frame.Visible = true;

            const middle = initialPosition;
            const below = middle.sub(new UDim2(0, 0, 0, 30));
            frame.Position = action === "open" ? below : middle;

            const tweenInfo = action === "open" ? new TweenInfo(0.2) : new TweenInfo(0.1, Enum.EasingStyle.Linear);
            const tween = TweenService.Create(frame, tweenInfo, {
                Position: action === "open" ? middle : below,
            });

            tween.Play();
            tween.Completed.Connect(() => {
                frame.Visible = visible;
            });
        }
        setPreviousVisible(visible);
    }, [visible]);

    return (
        <frame
            ref={frameRef}
            AnchorPoint={new Vector2(0.5, 1)}
            BackgroundColor3={Color3.fromRGB(255, 255, 255)}
            BackgroundTransparency={0.6}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={4}
            Position={initialPosition}
            Size={new UDim2(0.45, 200, 0.4, 100)}
            ZIndex={0}
            Visible={false}
        >
            <WindowTitle icon={icon} title={title} />
            <WindowCloseButton onClick={onClose} />
            <frame
                key="MainWindow"
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundTransparency={1}
                Position={new UDim2(0.5, 0, 0.075, 0)}
                Size={new UDim2(1, -30, 0.925, -15)}
            >
                {children}
            </frame>
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(255, 255, 255)} Thickness={2}>
                <uigradient Color={colorSequence} Rotation={80} />
            </uistroke>
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(35, 35, 35)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(89, 89, 89)),
                    ])
                }
                Rotation={270}
            />
            <canvasgroup BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} ZIndex={-5}>
                <imagelabel
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    BackgroundTransparency={1}
                    Image={getAsset("assets/GridHighContrast.png")}
                    ImageColor3={Color3.fromRGB(0, 0, 0)}
                    ImageTransparency={0.95}
                    Position={new UDim2(0.5, 0, 0.5, 0)}
                    Rotation={5}
                    ScaleType={Enum.ScaleType.Tile}
                    Size={new UDim2(1.1, 0, 1.5, 0)}
                    TileSize={new UDim2(0, 100, 0, 100)}
                />
            </canvasgroup>
        </frame>
    );
}
