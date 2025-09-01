/**
 * @fileoverview Tool option button component for the backpack system
 * 
 * A styled button component representing a tool in the player's backpack.
 * Displays tool icon, hotkey number, and handles selection state visualization.
 */

import React, { useCallback, useState } from "@rbxts/react";
import { RobotoSlabMedium } from "shared/ui/GameFonts";
import useHover from "shared/ui/hooks/useHover";

export interface ToolOptionData {
    /** The tool instance this option represents */
    tool: Tool;
    /** Display name of the tool */
    name: string;
    /** Tool icon/texture ID */
    textureId: string;
    /** Hotkey number (1-10) */
    hotkeyNumber: number;
    /** Whether the tool is currently equipped */
    isEquipped: boolean;
    /** Layout order for sorting */
    layoutOrder: number;
}

interface ToolOptionProps {
    /** Tool data to display */
    data: ToolOptionData;
    /** Click event handler */
    onClick?: (tool: Tool) => void;
    /** Whether animations are enabled */
    animationsEnabled?: boolean;
}

/**
 * Individual tool option button component
 */
export default function ToolOption({
    data,
    onClick,
    animationsEnabled = true
}: ToolOptionProps) {
    const { tool, name, textureId, hotkeyNumber, isEquipped, layoutOrder } = data;
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = useCallback(() => {
        onClick?.(tool);
    }, [onClick, tool]);

    const handleMouseDown = useCallback(() => {
        setIsPressed(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsPressed(false);
    }, []);

    const { hovering, events } = useHover({});

    // Color based on equipped state
    const backgroundColor = isEquipped 
        ? Color3.fromRGB(0, 184, 255) 
        : Color3.fromRGB(255, 255, 255);
    
    const strokeColor = isEquipped 
        ? Color3.fromRGB(0, 184, 255) 
        : Color3.fromRGB(255, 255, 255);

    // Apply press effect
    const currentBackgroundColor = isPressed 
        ? backgroundColor.Lerp(Color3.fromRGB(0, 0, 0), 0.2)
        : backgroundColor;

    return (
        <textbutton
            BackgroundColor3={currentBackgroundColor}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={4}
            LayoutOrder={layoutOrder}
            Name={name}
            Size={new UDim2(1, 0, 1, 0)}
            SizeConstraint={Enum.SizeConstraint.RelativeYY}
            Text=""
            AutoButtonColor={false}
            Event={{
                Activated: handleClick,
                MouseButton1Down: handleMouseDown,
                MouseButton1Up: handleMouseUp,
                ...events
            }}
        >
            {/* Background gradient */}
            <uigradient
                Color={new ColorSequence([
                    new ColorSequenceKeypoint(0, Color3.fromRGB(143, 143, 143)), 
                    new ColorSequenceKeypoint(1, Color3.fromRGB(198, 198, 198))
                ])}
                Rotation={272}
            />

            {/* Hotkey number label */}
            <textlabel
                key="AmountLabel"
                Active={true}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                FontFace={RobotoSlabMedium}
                Position={new UDim2(0, 10, 0, 0)}
                Size={new UDim2(1, 0, 0.4, 0)}
                Text={tostring(hotkeyNumber)}
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
            >
                <uistroke Thickness={2} />
            </textlabel>

            {/* Tool icon */}
            <imagelabel
                key="ImageLabel"
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Image={textureId}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0.75, 0, 0.75, 0)}
                ZIndex={0}
            />

            {/* Background pattern */}
            <imagelabel
                key="Pattern"
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundTransparency={1}
                Image="rbxassetid://15562720000"
                ImageColor3={Color3.fromRGB(0, 0, 0)}
                ImageTransparency={0.95}
                Position={new UDim2(0.5, 0, 0, 0)}
                ScaleType={Enum.ScaleType.Tile}
                Size={new UDim2(1, 0, 1, 0)}
                TileSize={new UDim2(0, 25, 0, 25)}
                ZIndex={-4}
            />

            {/* Border stroke */}
            <uistroke 
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border} 
                Color={strokeColor} 
                Thickness={2}
            >
                <uigradient
                    Color={new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)), 
                        new ColorSequenceKeypoint(0.587, Color3.fromRGB(173, 173, 173)), 
                        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))
                    ])}
                    Rotation={75}
                />
            </uistroke>
        </textbutton>
    );
}