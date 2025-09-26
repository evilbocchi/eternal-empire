/**
 * @fileoverview Main build window React component
 *
 * Displays build mode controls including deselect, rotate, delete, and place buttons.
 * Manages visibility, animations, and user interactions for the build system.
 */

import React, { useEffect, useRef } from "@rbxts/react";
import { Environment } from "@rbxts/ui-labs";
import BuildButton from "client/components/build/BuildButton";
import BuildManager from "client/components/build/BuildManager";
import useHotkeyWithTooltip from "client/components/hotkeys/useHotkeyWithTooltip";
import { useDocument } from "client/components/window/DocumentManager";
import { getAsset } from "shared/asset/AssetMap";

/**
 * Main build window component that displays build controls
 */
export default function BuildWindow({
    hasSelection = BuildManager.hasSelection,
    getRestricted = BuildManager.getRestricted,
}: {
    hasSelection?: () => boolean;
    getRestricted?: () => boolean;
}) {
    const ref = useRef<Frame>();
    const { visible } = useDocument({ id: "Build", priority: -1 });
    const openPosition = new UDim2(0.5, 0, 0.95, -5);
    const closedPosition = new UDim2(0.5, 0, 1.2, 0);

    useEffect(() => {
        if (visible) {
            ref.current?.TweenPosition(openPosition, Enum.EasingDirection.Out, Enum.EasingStyle.Quad, 0.2, true);
        } else {
            ref.current?.TweenPosition(closedPosition, Enum.EasingDirection.Out, Enum.EasingStyle.Quad, 0.2, true);
        }
    }, [visible]);

    useEffect(() => {
        return BuildManager.init();
    }, []);

    const { events: deselectEvents } = useHotkeyWithTooltip({
        label: "Deselect Build",
        action: () => {
            if (!hasSelection() || getRestricted()) return false;
            BuildManager.revertSelected();
            BuildManager.deselectAll();
            return true;
        },
    });

    const { events: rotateEvents } = useHotkeyWithTooltip({
        label: "Rotate Build",
        action: () => {
            if (!hasSelection() || getRestricted()) return false;
            BuildManager.rotateSelection();
            return true;
        },
    });

    const { events: deleteEvents } = useHotkeyWithTooltip({
        label: "Delete Build",
        action: () => {
            if (!hasSelection() || getRestricted()) return false;
            BuildManager.deleteSelection();
            return true;
        },
    });

    return (
        <frame
            ref={ref}
            Active={true}
            AnchorPoint={new Vector2(0.5, 1)}
            BackgroundTransparency={1}
            Position={closedPosition}
            Size={new UDim2(0.3, 0, 0, 75)}
        >
            {/* Deselect button */}
            <BuildButton
                anchorPoint={new Vector2(0.5, 0)}
                text="Deselect"
                position={new UDim2(0.5, 0, 0.05, 0)}
                size={new UDim2(0.7, 0, 0.4, -2)}
                onClick={deselectEvents.Activated}
            />

            {/* Options container */}
            <frame
                AnchorPoint={new Vector2(0, 1)}
                BackgroundTransparency={1}
                Position={new UDim2(0, 0, 1, 0)}
                Size={new UDim2(1, 0, 0.5, -2)}
            >
                {/* Rotate button */}
                <BuildButton
                    text="Rotate"
                    icon={getAsset("assets/building/Rotate.png")}
                    layoutOrder={4}
                    onClick={rotateEvents.Activated}
                />

                {/* Place button (only visible on touch devices) */}
                <BuildButton
                    text="Place"
                    icon={getAsset("assets/building/Place.png")}
                    iconColor={Color3.fromRGB(170, 255, 127)}
                    layoutOrder={5}
                    visible={Environment.UserInput.TouchEnabled}
                    onClick={() => {
                        BuildManager.placeSelection();
                    }}
                />

                {/* Delete button */}
                <BuildButton
                    text="Delete"
                    icon={getAsset("assets/building/Delete.png")}
                    iconColor={Color3.fromRGB(255, 70, 70)}
                    layoutOrder={6}
                    onClick={deleteEvents.Activated}
                />

                {/* Layout for option buttons */}
                <uilistlayout
                    FillDirection={Enum.FillDirection.Horizontal}
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 5)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                    VerticalAlignment={Enum.VerticalAlignment.Center}
                />
            </frame>
        </frame>
    );
}
