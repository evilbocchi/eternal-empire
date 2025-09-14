import React, { useCallback, useEffect, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import WindowCloseButton from "client/ui/components/window/WindowCloseButton";
import { useWindow } from "client/ui/components/window/WindowManager";
import WindowTitle from "client/ui/components/window/WindowTitle";

export default function TechWindow({
    visible,
    icon,
    title,
    children,
    onClose,
    priority = 0,
    size = new UDim2(0.9, 0, 0.9, -50),
}: WindowProps) {
    const frameRef = useRef<Frame>();
    const [previousVisible, setPreviousVisible] = useState(visible);
    const initialPosition = new UDim2(0.5, 0, 0.5, 0);

    useWindow({ id: title, visible, onClose, priority });

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

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
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundColor3={Color3.fromRGB(13, 13, 13)}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={4}
            Selectable={true}
            Size={size}
            Position={initialPosition}
            ZIndex={0}
            Visible={false}
        >
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(255, 255, 255)} />
            <uisizeconstraint MaxSize={new Vector2(800, 600)} />
            <WindowTitle icon={icon} title={title} />
            <WindowCloseButton onClick={handleClose} />
            <frame
                key="MainWindow"
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundTransparency={1}
                Position={new UDim2(0.5, 0, 0.075, 0)}
                Size={new UDim2(1, -30, 0.925, -15)}
            >
                {children}
            </frame>
        </frame>
    );
}
