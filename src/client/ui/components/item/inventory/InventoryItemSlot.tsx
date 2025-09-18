/**
 * @fileoverview Individual inventory item slot React component
 *
 * Displays an item with its icon, amount, and handles click interactions.
 * Replaces the traditional Roblox Studio ItemSlot with React implementation.
 */

import React, { forwardRef, Ref, useRef } from "@rbxts/react";
import { ItemViewportManagement } from "client/ui/components/item/ItemViewport";
import { useItemViewport } from "client/ui/components/item/useCIViewportManagement";
import { useItemTooltip } from "client/ui/components/tooltip/TooltipManager";
import { RobotoSlab } from "client/ui/GameFonts";
import { getAsset } from "shared/asset/AssetMap";
import type Item from "shared/item/Item";

/**
 * Individual inventory item slot component
 */
const InventoryItemSlot = forwardRef<
    TextButton,
    {
        /** The item to display */
        item: Item;
        /** Number of items in inventory */
        amount?: number;
        /** Layout order for sorting */
        layoutOrder: number;
        /** Whether the slot is visible */
        visible: boolean;
        /** Callback when the item is clicked */
        onActivated: () => void;
        /** Size of the item slot */
        size?: UDim2;
        /** Whether tooltips are enabled */
        tooltipEnabled?: boolean;
        /** Shared viewport management instance */
        viewportManagement?: ItemViewportManagement;
    }
>((props, ref) => {
    const {
        item,
        amount = 0,
        layoutOrder,
        visible,
        onActivated,
        size = new UDim2(0, 100, 0, 100),
        tooltipEnabled = true,
        viewportManagement,
    } = props;
    const viewportRef = useRef<ViewportFrame>();
    const textColor = amount > 0 ? Color3.fromRGB(255, 255, 255) : Color3.fromRGB(150, 150, 150);
    const backgroundColor = item.difficulty.color ?? Color3.fromRGB(52, 155, 255);
    const hoverProps = tooltipEnabled ? useItemTooltip(item) : undefined;
    useItemViewport(viewportRef, item.id, viewportManagement);

    return (
        <textbutton
            ref={ref}
            BackgroundColor3={backgroundColor}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={5}
            LayoutOrder={layoutOrder}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            Selectable={false}
            Size={size}
            Text=""
            Visible={visible}
            Event={{
                Activated: onActivated,
                ...hoverProps?.events,
            }}
        >
            <uiaspectratioconstraint
                AspectRatio={1}
                AspectType={Enum.AspectType.ScaleWithParentSize}
                DominantAxis={Enum.DominantAxis.Height}
            />
            {/* Background gradient */}
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(72, 72, 72)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(76, 76, 76)),
                    ])
                }
                Rotation={90}
            />

            {/* Main stroke with gradient */}
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={backgroundColor} Thickness={2}>
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.299, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.51, Color3.fromRGB(118, 118, 118)),
                            new ColorSequenceKeypoint(0.822, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                        ])
                    }
                    Rotation={35}
                />
            </uistroke>

            {/* Amount label */}
            <textlabel
                key="AmountLabel"
                Active={true}
                AnchorPoint={new Vector2(0.5, 0.5)}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                Position={new UDim2(0.5, 0, 0.9, 0)}
                Size={new UDim2(0.5, 0, 0.4, 0)}
                Text={tostring(amount)}
                TextColor3={textColor}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Right}
            >
                <uistroke Thickness={2}>
                    <uistroke Thickness={2} />
                </uistroke>
            </textlabel>

            {/* Reflection overlay */}
            <imagelabel
                key="Reflection"
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Image={getAsset("assets/Grid.png")}
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

            {/* Viewport frame for 3D model */}
            <viewportframe
                ref={viewportRef}
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0.8, 0, 0.8, 0)}
                ZIndex={0}
            />

            {/* Background overlay image */}
            <imagelabel
                BackgroundTransparency={1}
                Image={getAsset("assets/Vignette.png")}
                ImageTransparency={0.2}
                Size={new UDim2(1, 0, 1, 0)}
                ZIndex={-4}
            />
        </textbutton>
    );
});

export default InventoryItemSlot;
