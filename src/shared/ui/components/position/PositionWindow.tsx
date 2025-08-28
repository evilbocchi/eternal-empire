import React from "@rbxts/react";
import { useTooltipProps } from "shared/ui/components/tooltip/useTooltipProps";

interface PositionWindowProps {
    /** The position coordinates to display */
    position?: Vector3;
    /** Whether the window is visible */
    visible?: boolean;
    /** Custom styling for the window */
    anchorPoint?: Vector2;
    windowPosition?: UDim2;
    size?: UDim2;
}

/**
 * PositionWindow displays the player's current coordinates in a styled frame.
 * 
 * Features a compass icon and coordinates display with gradient styling.
 * The component is designed to be positioned in the top-right corner of the screen.
 */
export default function PositionWindow({
    position = new Vector3(),
    visible = true,
    anchorPoint = new Vector2(1, 0),
    windowPosition = new UDim2(1, -20, 0, 10),
    size = new UDim2(0, 0, 0, 16)
}: PositionWindowProps) {
    const positionText = `${math.round(position.X)}, ${math.round(position.Y)}, ${math.round(position.Z)}`;
    const tooltipProps = useTooltipProps({
        message: `Position of your character.\n<font color="rgb(200, 200, 200)" size="16">Use these coordinates to search your way through the world.</font>`
    });

    return (
        <frame
            key="PositionWindow"
            AnchorPoint={anchorPoint}
            BackgroundTransparency={1}
            Event={{
                MouseEnter: tooltipProps.onMouseEnter,
                MouseLeave: tooltipProps.onMouseLeave,
            }}
            Position={windowPosition}
            Size={size}
            Visible={visible}
        >
            {/* Compass Icon */}
            <imagelabel
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Image="rbxassetid://132386902355520"
                Position={new UDim2(1, 0, 0.5, 0)}
                Size={new UDim2(1.75, 0, 1.75, 0)}
                SizeConstraint={Enum.SizeConstraint.RelativeYY}
                ZIndex={2}
            />

            {/* Main Frame with Background */}
            <imagelabel
                key="Frame"
                AnchorPoint={new Vector2(1, 0.5)}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundColor3={Color3.fromRGB(255, 255, 255)}
                BorderColor3={Color3.fromRGB(0, 0, 0)}
                BorderSizePixel={2}
                Image="rbxassetid://9734894135"
                ImageTransparency={0.6}
                Position={new UDim2(0, 0, 0.5, 0)}
                ScaleType={Enum.ScaleType.Tile}
                Size={new UDim2(0, 0, 0, 16)}
                TileSize={new UDim2(0, 32, 0, 32)}
            >
                {/* Position Text Label */}
                <textlabel
                    key="PositionLabel"
                    AnchorPoint={new Vector2(1, 0.5)}
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    Font={Enum.Font.Unknown}
                    FontFace={new Font("rbxassetid://12187368625", Enum.FontWeight.Heavy, Enum.FontStyle.Normal)}
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
                    Color={new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(85, 254, 171)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(0, 164, 170))
                    ])}
                    Rotation={90}
                />

                {/* Border Stroke with Gradient */}
                <uistroke
                    ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                    Color={Color3.fromRGB(255, 255, 255)}
                    Transparency={0.2}
                >
                    <uigradient
                        Color={new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.587, Color3.fromRGB(173, 173, 173)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))
                        ])}
                        Rotation={80}
                    />
                </uistroke>

                {/* Layout and Constraints */}
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
                <uipadding
                    PaddingLeft={new UDim(0, 10)}
                    PaddingRight={new UDim(0, 20)}
                />
                <uisizeconstraint MinSize={new Vector2(70, 0)} />
            </imagelabel>
        </frame>
    );
}
