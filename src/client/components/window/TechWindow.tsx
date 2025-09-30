import React, { useRef } from "@rbxts/react";
import { useWindowAnimation } from "client/components/window/BasicWindow";
import DocumentManager from "client/components/window/DocumentManager";
import WindowCloseButton from "client/components/window/WindowCloseButton";
import WindowTitle from "client/components/window/WindowTitle";

export default function TechWindow({
    icon,
    id,
    title,
    visible,
    children,
    size = new UDim2(0.9, 0, 0.9, -50),
}: WindowProps) {
    const frameRef = useRef<Frame>();
    const initialPosition = new UDim2(0.5, 0, 0.5, 0);

    useWindowAnimation({
        frameRef,
        initialPosition,
        visible,
    });

    return (
        <frame
            ref={frameRef}
            Active={true}
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
        </frame>
    );
}
