/**
 * @fileoverview React ItemSlot component for displaying item slots in inventory/UI.
 * 
 * This component is based on the exported ItemSlot structure and can be used
 * for inventory slots, item displays, and other item-related UI elements.
 * Note: Tooltip functionality is now handled separately by TooltipWindow.
 */

import React from "@rbxts/react";

interface ItemSlotProps {
    /** The item to display (optional for empty slots) */
    item?: unknown;
    /** Amount/quantity to display */
    amount?: number;
    /** Whether the slot is interactive */
    interactive?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Additional styling */
    size?: UDim2;
    position?: UDim2;
    layoutOrder?: number;
}

/**
 * ItemSlot component based on the exported Roblox Studio structure
 */
export default function ItemSlot({
    item,
    amount = 1,
    interactive = true,
    onClick,
    size = new UDim2(0, 100, 0, 100),
    position,
    layoutOrder
}: ItemSlotProps) {
    return (
        <textbutton
            key="ItemSlot"
            BackgroundColor3={Color3.fromRGB(52, 155, 255)}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={5}
            Position={position}
            Selectable={interactive}
            Size={size}
            Text=""
            LayoutOrder={layoutOrder}
            Event={onClick ? { Activated: onClick } : undefined}
        >
            <uigradient
                Color={new ColorSequence([
                    new ColorSequenceKeypoint(0, Color3.fromRGB(72, 72, 72)),
                    new ColorSequenceKeypoint(1, Color3.fromRGB(76, 76, 76))
                ])}
                Rotation={90}
            />
            <uistroke
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                Color={Color3.fromRGB(52, 155, 255)}
                Thickness={2}
            >
                <uigradient
                    Color={new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                        new ColorSequenceKeypoint(0.299, Color3.fromRGB(255, 255, 255)),
                        new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)),
                        new ColorSequenceKeypoint(0.822, Color3.fromRGB(255, 255, 255)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255))
                    ])}
                    Rotation={35}
                />
            </uistroke>

            {/* Amount Label */}
            {amount > 1 && (
                <textlabel
                    key="AmountLabel"
                    Active={true}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    AutomaticSize={Enum.AutomaticSize.X}
                    BackgroundTransparency={1}
                    Font={Enum.Font.Unknown}
                    FontFace={new Font("rbxassetid://12187368625", Enum.FontWeight.Medium, Enum.FontStyle.Normal)}
                    Position={new UDim2(0.5, 0, 0.9, 0)}
                    Size={new UDim2(0.5, 0, 0.4, 0)}
                    Text={tostring(amount)}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    TextScaled={true}
                    TextSize={14}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Right}
                >
                    <uistroke Thickness={2}>
                        <uistroke Thickness={2} />
                    </uistroke>
                </textlabel>
            )}

            {/* Reflection Effect */}
            <imagelabel
                key="Reflection"
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Image="rbxassetid://9734894135"
                ImageColor3={Color3.fromRGB(126, 126, 126)}
                ImageTransparency={0.85}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                ScaleType={Enum.ScaleType.Tile}
                Size={new UDim2(1, 0, 1, 0)}
                TileSize={new UDim2(0.5, 0, 0.5, 0)}
                ZIndex={-5}
            >
                <uicorner CornerRadius={new UDim(0, 4)} />
            </imagelabel>

            {/* ViewportFrame for 3D item preview */}
            <viewportframe
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0.8, 0, 0.8, 0)}
                ZIndex={0}
            />

            {/* Background decoration */}
            <imagelabel
                BackgroundTransparency={1}
                Image="rbxassetid://4576475446"
                ImageTransparency={0.2}
                Size={new UDim2(1, 0, 1, 0)}
                ZIndex={-4}
            />
        </textbutton>
    );
}
