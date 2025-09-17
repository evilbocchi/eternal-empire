import React from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";
import Item from "shared/item/Item";

interface ShopItemSlotProps {
    /** The item to display in the slot */
    item: Item;
    /** The current amount/price text to display */
    amountText: string;
    /** The amount text color */
    amountColor: Color3;
    /** Whether the slot is maxed */
    isMaxed?: boolean;
    /** Callback when the slot is clicked */
    onClick: () => void;
    /** Viewport frame content for the item */
    viewportContent?: Instance;
    /** Layout order for sorting */
    layoutOrder?: number;
}

/**
 * Individual shop item slot component
 */
export default function ShopItemSlot({
    item,
    amountText,
    amountColor,
    isMaxed = false,
    onClick,
    viewportContent,
    layoutOrder = 0,
}: ShopItemSlotProps) {
    const difficulty = item.difficulty;
    const borderColor = difficulty?.color ?? Color3.fromRGB(52, 155, 255);

    return (
        <textbutton
            BackgroundColor3={Color3.fromRGB(52, 155, 255)}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={5}
            LayoutOrder={layoutOrder}
            Selectable={false}
            Size={new UDim2(0, 100, 0, 100)}
            Text=""
            Event={{
                Activated: onClick,
            }}
        >
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

            {/* Border stroke with gradient */}
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={borderColor} Thickness={2}>
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

            {/* Amount/Price label */}
            <textlabel
                Active={true}
                AnchorPoint={new Vector2(0.5, 0.5)}
                AutomaticSize={Enum.AutomaticSize.X}
                BackgroundTransparency={1}
                Font={Enum.Font.Unknown}
                FontFace={new Font("rbxassetid://12187368625", Enum.FontWeight.Medium, Enum.FontStyle.Normal)}
                Position={new UDim2(0.5, 0, 0.9, 0)}
                Size={new UDim2(1, 0, 0.4, 0)}
                Text={isMaxed ? "MAXED" : amountText}
                TextColor3={isMaxed ? Color3.fromRGB(255, 156, 5) : amountColor}
                TextScaled={true}
                TextSize={14}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>

            {/* Glass reflection overlay */}
            <imagelabel
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Image={getAsset("assets/GlassReflection.png")}
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

            {/* Viewport frame for 3D item display */}
            <viewportframe
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0.8, 0, 0.8, 0)}
                ZIndex={0}
            />

            {/* Vignette overlay */}
            <imagelabel
                BackgroundTransparency={1}
                Image={getAsset("assets/Vignette.png")}
                ImageTransparency={0.2}
                Size={new UDim2(1, 0, 1, 0)}
                ZIndex={-4}
            />
        </textbutton>
    );
}
