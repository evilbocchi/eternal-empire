/**
 * @fileoverview Tool option button component for the backpack system
 *
 * A styled button component representing a tool in the player's backpack.
 * Displays tool icon, hotkey number, and handles selection state visualization.
 */

import React from "@rbxts/react";
import { TooltipManager } from "client/ui/components/tooltip/TooltipWindow";
import { getAsset } from "shared/asset/AssetMap";
import HarvestingTool from "shared/item/traits/HarvestingTool";

/** Determine layout order based on tool type */
export function layoutOrderFromTool(harvestingTool: HarvestingTool): number {
    switch (harvestingTool.toolType) {
        case "Pickaxe":
            return 1;
        case "Axe":
            return 2;
        case "Scythe":
            return 3;
        case "Rod":
            return 4;
        case "None":
        default:
            return harvestingTool.item.layoutOrder;
    }
}

/**
 * Individual tool option button component
 */
export default function ToolOption({
    harvestingTool,
    isEquipped,
    onClick,
}: {
    harvestingTool: HarvestingTool;
    isEquipped: boolean;
    onClick: () => void;
}) {
    // Color based on equipped state
    const backgroundColor = isEquipped ? Color3.fromRGB(0, 184, 255) : Color3.fromRGB(31, 31, 31);
    const strokeColor = isEquipped ? Color3.fromRGB(0, 184, 255) : Color3.fromRGB(61, 61, 61);

    return (
        <textbutton
            key={harvestingTool.item.id}
            BackgroundColor3={backgroundColor}
            BorderColor3={Color3.fromRGB(0, 0, 0)}
            BorderSizePixel={4}
            LayoutOrder={layoutOrderFromTool(harvestingTool)}
            Size={new UDim2(1, 0, 1, 0)}
            SizeConstraint={Enum.SizeConstraint.RelativeYY}
            Text=""
            Event={{
                Activated: onClick,
                MouseMoved: () => {
                    TooltipManager.showTooltip({ item: harvestingTool.item });
                },
                MouseLeave: () => {
                    TooltipManager.hideTooltip();
                },
            }}
        >
            {/* Background gradient */}
            <uigradient
                Color={
                    new ColorSequence([
                        new ColorSequenceKeypoint(0, Color3.fromRGB(143, 143, 143)),
                        new ColorSequenceKeypoint(1, Color3.fromRGB(198, 198, 198)),
                    ])
                }
                Rotation={272}
            />

            {/* Tool icon */}
            <imagelabel
                key="ImageLabel"
                AnchorPoint={new Vector2(0.5, 0.5)}
                BackgroundTransparency={1}
                Image={harvestingTool.item.image}
                Position={new UDim2(0.5, 0, 0.5, 0)}
                Size={new UDim2(0.75, 0, 0.75, 0)}
                ZIndex={0}
            />

            {/* Background pattern */}
            <imagelabel
                key="Pattern"
                AnchorPoint={new Vector2(0.5, 0)}
                BackgroundTransparency={1}
                Image={getAsset("assets/GridCheckers.png")}
                ImageColor3={Color3.fromRGB(255, 255, 255)}
                ImageTransparency={0.975}
                Position={new UDim2(0.5, 0, 0, 0)}
                ScaleType={Enum.ScaleType.Tile}
                Size={new UDim2(1, 0, 1, 0)}
                TileSize={new UDim2(0, 50, 0, 50)}
                ZIndex={-4}
            />

            {/* Border stroke */}
            <uistroke ApplyStrokeMode={Enum.ApplyStrokeMode.Border} Color={strokeColor} Thickness={2}>
                <uigradient
                    Color={
                        new ColorSequence([
                            new ColorSequenceKeypoint(0, Color3.fromRGB(255, 255, 255)),
                            new ColorSequenceKeypoint(0.587, Color3.fromRGB(173, 173, 173)),
                            new ColorSequenceKeypoint(1, Color3.fromRGB(255, 255, 255)),
                        ])
                    }
                    Rotation={75}
                />
            </uistroke>
        </textbutton>
    );
}
