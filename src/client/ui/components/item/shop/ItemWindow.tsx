import React, { useRef } from "@rbxts/react";
import { useWindowAnimation } from "client/ui/components/window/BasicWindow";
import WindowCloseButton from "client/ui/components/window/WindowCloseButton";
import DocumentManager from "client/ui/components/window/DocumentManager";
import WindowTitle from "client/ui/components/window/WindowTitle";
import { getAsset } from "shared/asset/AssetMap";

export default function ItemWindow({
    icon,
    id,
    visible,
    children,
    size = new UDim2(0.45, 200, 0.4, 100),
    backgroundColor,
}: WindowProps & { backgroundColor: Color3 }) {
    const wrapperRef = useRef<ImageLabel>();
    const initialPosition = new UDim2(0.5, 0, 1, -40);

    useWindowAnimation({
        frameRef: wrapperRef,
        initialPosition,
        visible,
    });

    return (
        <imagelabel
            ref={wrapperRef}
            Active={true}
            AnchorPoint={new Vector2(0.5, 1)}
            BackgroundColor3={backgroundColor}
            BackgroundTransparency={0.2}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={3}
            Image={getAsset("assets/Grid.png")}
            ImageColor3={Color3.fromRGB(126, 126, 126)}
            ImageTransparency={0.6}
            ScaleType={Enum.ScaleType.Tile}
            Selectable={true}
            Size={size}
            Position={initialPosition}
            TileSize={new UDim2(0, 100, 0, 100)}
            Visible={false}
            ZIndex={0}
        >
            <uistroke
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                Color={backgroundColor}
                Thickness={2}
                Transparency={0.2}
            >
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(236, 236, 236)),
                            new ColorSequenceKeypoint(0.299, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)),
                            new ColorSequenceKeypoint(0.822, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(220, 220, 220)),
                        ])
                    }
                    Rotation={35}
                />
            </uistroke>
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(39, 39, 39)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(58, 58, 58)),
                    ])
                }
                Rotation={270}
            />

            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={Color3.fromRGB(255, 255, 255)} />
            <uisizeconstraint MaxSize={new Vector2(800, 600)} />
            <WindowTitle icon={icon} title={id} />
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
        </imagelabel>
    );
}
