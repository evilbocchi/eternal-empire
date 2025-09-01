/**
 * @fileoverview Individual inventory item slot React component
 * 
 * Displays an item with its icon, amount, and handles click interactions.
 * Replaces the traditional Roblox Studio ItemSlot with React implementation.
 */

import React from "@rbxts/react";
import type Item from "shared/item/Item";

interface InventoryItemSlotProps {
    /** The item to display */
    item: Item;
    /** Number of items in inventory */
    amount: number;
    /** Whether the item has any quantity */
    hasItem: boolean;
    /** Layout order for sorting */
    layoutOrder: number;
    /** Whether the slot is visible */
    visible: boolean;
    /** Callback when the item is clicked */
    onActivated: () => void;
    /** Reference for tooltip attachment */
    ref?: React.Ref<TextButton>;
}

/**
 * Individual inventory item slot component
 */
export default function InventoryItemSlot({ 
    item, 
    amount, 
    hasItem, 
    layoutOrder, 
    visible, 
    onActivated,
    ref
}: InventoryItemSlotProps) {
    const textColor = hasItem ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(150, 150, 150);

    return (
        <textbutton
            ref={ref}
            AutoButtonColor={false}
            BackgroundColor3={item.difficulty.color}
            BorderSizePixel={0}
            LayoutOrder={layoutOrder}
            Size={new UDim2(1, 0, 1, 0)}
            Text=""
            Visible={visible}
            Event={{
                Activated: onActivated
            }}
        >
            {/* Item stroke */}
            <uistroke 
                ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
                Color={Color3.fromRGB(255, 255, 255)}
                Thickness={2}
            />

            {/* Amount label */}
            <textlabel
                AnchorPoint={new Vector2(1, 1)}
                BackgroundTransparency={1}
                Font={Enum.Font.SourceSansBold}
                Position={new UDim2(1, -2, 1, -2)}
                Size={new UDim2(0.6, 0, 0.3, 0)}
                Text={tostring(amount)}
                TextColor3={textColor}
                TextScaled={true}
                TextStrokeTransparency={0}
                TextXAlignment={Enum.TextXAlignment.Right}
                TextYAlignment={Enum.TextYAlignment.Bottom}
                ZIndex={2}
            />

            {/* Viewport frame for 3D model */}
            <viewportframe
                BackgroundTransparency={1}
                Size={new UDim2(1, 0, 1, 0)}
                ZIndex={1}
            >
                <camera />
                {/* Note: 3D model rendering would need to be implemented separately */}
            </viewportframe>

            {/* Fallback image label for 2D icons */}
            <imagelabel
                BackgroundTransparency={1}
                Image={item.image ?? ""}
                Size={new UDim2(0.8, 0, 0.8, 0)}
                Position={new UDim2(0.1, 0, 0.1, 0)}
                ScaleType={Enum.ScaleType.Fit}
                ZIndex={1}
            />
        </textbutton>
    );
}