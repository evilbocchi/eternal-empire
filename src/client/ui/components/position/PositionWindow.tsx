import React, { useEffect, useRef } from "@rbxts/react";
import { RobotoSlabHeavy } from "client/ui/GameFonts";
import { useDocument } from "client/ui/components/window/WindowManager";
import { getAsset } from "shared/asset/AssetMap";
import { useMessageTooltip } from "../tooltip/TooltipManager";

/**
 * PositionWindow displays the player's current coordinates in a styled frame.
 *
 * Features a compass icon and coordinates display with gradient styling.
 * The component is designed to be positioned in the top-right corner of the screen.
 */
export default function PositionWindow({
    characterPosition = new Vector3(),
    anchorPoint = new Vector2(1, 0),
    windowPosition = new UDim2(1, -20, 0, 10),
    size = new UDim2(0, 0, 0, 16),
}: {
    /** The position coordinates to display */
    characterPosition?: Vector3;
    /** Custom styling for the window */
    anchorPoint?: Vector2;
    /** Custom position for the window */
    windowPosition?: UDim2;
    /** Custom size for the window */
    size?: UDim2;
}) {
    const ref = useRef<Frame>();
    const closedPosition = windowPosition.add(new UDim2(0, 0, 0, -50));
    const { visible } = useDocument({ id: "Position", priority: -1 });

    useEffect(() => {
        if (visible) {
            ref.current?.TweenPosition(windowPosition, Enum.EasingDirection.Out, Enum.EasingStyle.Quad, 1.5, true);
        } else {
            ref.current?.TweenPosition(closedPosition, Enum.EasingDirection.In, Enum.EasingStyle.Quad, 1.5, true);
        }
    }, [visible]);

    const positionText = `${math.round(characterPosition.X)}, ${math.round(characterPosition.Y)}, ${math.round(characterPosition.Z)}`;
    const { events } = useMessageTooltip(
        `Position of your character.\n<font color="rgb(200, 200, 200)" size="16">Use these coordinates to search your way through the world.</font>`,
    );

    return (
        <frame
            ref={ref}
            key="PositionWindow"
            AnchorPoint={anchorPoint}
            BackgroundTransparency={1}
            Position={closedPosition}
            Size={size}
        >
            {/* Compass Icon */}
            <imagelabel
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Image={getAsset("assets/Compass.png")}
                Position={new UDim2(1, 0, 0.5, 0)}
                Size={new UDim2(1.75, 0, 1.75, 0)}
                SizeConstraint={Enum.SizeConstraint.RelativeYY}
                ZIndex={2}
            />

            {/* Overlay */}
            <imagelabel
                key="Frame"
                AnchorPoint={new Vector2(1, 0.5)}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderColor3={Color3.fromRGB(0, 0, 0)}
                BorderSizePixel={2}
                Image={getAsset("assets/Grid.png")}
                ImageTransparency={0.6}
                Position={new UDim2(0, 0, 0.5, 0)}
                ScaleType={Enum.ScaleType.Tile}
                Size={new UDim2(0, 0, 0, 16)}
                TileSize={new UDim2(0, 32, 0, 32)}
                Event={{ ...events }}
            >
                {/* Position Text Label */}
                <textlabel
                    key="PositionLabel"
                    AnchorPoint={new Vector2(1, 0.5)}
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    FontFace={RobotoSlabHeavy}
                    Size={new UDim2(0, 0, 1, 0)}
                    Text={positionText}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextSize={20}
                    TextXAlignment={Enum.TextXAlignment.Right}
                >
                    <uistroke Thickness={2} />
                </textlabel>

                {/* Background Gradient */}
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(85, 254, 171)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(0, 164, 170)),
                        ])
                    }
                    Rotation={90}
                />

                {/* Border Stroke with Gradient */}
                <uistroke
                    ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                    Color={Color3.fromRGB(255, 255, 255)}
                    Transparency={0.2}
                >
                    <uigradient
                        Color={
                            new ColorSequence([
                                new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                                new ColorSequenceKeypoint(0.587, Color3.fromRGB(173, 173, 173)),
                                new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                            ])
                        }
                        Rotation={80}
                    />
                </uistroke>

                {/* Layout and Constraints */}
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
                <uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 20)} />
                <uisizeconstraint MinSize={new Vector2(70, 0)} />
            </imagelabel>
        </frame>
    );
}
