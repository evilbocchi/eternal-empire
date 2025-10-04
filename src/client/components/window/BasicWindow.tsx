import React, { ReactNode, RefObject, useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import DocumentManager from "client/components/window/DocumentManager";
import WindowCloseButton from "client/components/window/WindowCloseButton";
import WindowTitle from "client/components/window/WindowTitle";
import { playSound } from "shared/asset/GameAssets";

export function useWindowAnimation({
    frameRef,
    initialPosition,
    visible,
}: {
    frameRef: RefObject<GuiObject>;
    initialPosition: UDim2;
    visible: boolean;
}) {
    const [previousVisible, setPreviousVisible] = useState(visible);

    useEffect(() => {
        const action = visible && !previousVisible ? "open" : !visible && previousVisible ? "close" : undefined;
        // Handle animation
        if (action) {
            const frame = frameRef.current!;

            if (action === "open") {
                frame.Visible = true;
                playSound("MenuOpen.mp3");
            } else {
                playSound("MenuClose.mp3");
            }

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
}

export default function BasicWindow({
    icon,
    id,
    title,
    visible,
    children,
    backgroundColor,
    strokeColor,
}: {
    icon: string;
    id: string;
    title?: string;
    visible: boolean;
    backgroundColor?: ColorSequence;
    strokeColor: ColorSequence;
    children: ReactNode;
    size?: UDim2;
}) {
    if (backgroundColor === undefined) {
        const keypoints = new Array<ColorSequenceKeypoint>();
        for (const keypoint of strokeColor.Keypoints) {
            keypoints.push(new ColorSequenceKeypoint(keypoint.Time, keypoint.Value.Lerp(Color3.fromRGB(0, 0, 0), 0.3)));
        }
        backgroundColor = new ColorSequence(keypoints);
    }
    const frameRef = useRef<Frame>();
    const initialPosition = new UDim2(0.5, 0, 1, -40);

    useWindowAnimation({
        frameRef,
        initialPosition,
        visible,
    });

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
            <WindowTitle icon={icon} title={title ?? id} />
            <WindowCloseButton onClick={() => DocumentManager.setVisible(id, false)} />
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
                <uigradient Color={strokeColor} Rotation={90} />
            </uistroke>
            <uigradient Color={backgroundColor} Rotation={90} />
        </frame>
    );
}
