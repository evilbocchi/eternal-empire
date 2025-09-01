/**
 * @fileoverview Empty state component for the inventory
 * 
 * Displays a message when the player has no items in their inventory.
 */

import React from "@rbxts/react";
import { RobotoSlab, RobotoSlabHeavy } from "shared/ui/GameFonts";

interface InventoryEmptyStateProps {
    /** Whether the empty state should be visible */
    visible: boolean;
}

/**
 * Empty state component shown when inventory has no items
 */
export default function InventoryEmptyState({ visible }: InventoryEmptyStateProps) {
    return (
        <frame
            BackgroundTransparency={1}
            Size={new UDim2(1, 0, 1, 0)}
            Visible={visible}
        >
            <textlabel
                Active={true}
                AnchorPoint={new Vector2(0.5, 0.5)}
                AutomaticSize={Enum.AutomaticSize.XY}
                BackgroundTransparency={1}
                FontFace={RobotoSlabHeavy}
                Position={new UDim2(0.5, 0, 0.3, 0)}
                Text="You don't have any items!"
                TextColor3={Color3.fromRGB(206, 206, 206)}
                TextSize={30}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>

            <textlabel
                Active={true}
                AnchorPoint={new Vector2(0.5, 0.5)}
                AutomaticSize={Enum.AutomaticSize.XY}
                BackgroundTransparency={1}
                FontFace={RobotoSlab}
                LayoutOrder={1}
                Position={new UDim2(0.5, 0, 0.34, 20)}
                Text="Buy some stuff in the shop to get started."
                TextColor3={Color3.fromRGB(129, 129, 129)}
                TextSize={25}
                TextWrapped={true}
            >
                <uistroke Thickness={2} />
            </textlabel>

            <uilistlayout
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
        </frame>
    );
}