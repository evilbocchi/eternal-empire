/**
 * @fileoverview Main build window React component
 *
 * Displays build mode controls including deselect, rotate, delete, and place buttons.
 * Manages visibility, animations, and user interactions for the build system.
 */

import React from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import { getAsset } from "shared/asset/AssetMap";
import BuildButton from "client/ui/components/build/BuildButton";

export interface BuildWindowState {
    /** Whether the build window is visible */
    visible: boolean;
    /** Whether there are items currently selected */
    hasSelection: boolean;
    /** Whether building is currently restricted */
    isRestricted: boolean;
    /** Whether animations are enabled */
    animationsEnabled: boolean;
}

export interface BuildWindowCallbacks {
    /** Called when deselect button is pressed */
    onDeselect: () => void;
    /** Called when rotate button is pressed */
    onRotate: () => void;
    /** Called when delete button is pressed */
    onDelete: () => void;
    /** Called when place button is pressed */
    onPlace: () => void;
}

interface BuildWindowProps {
    /** Current build window state */
    state: BuildWindowState;
    /** Event callbacks */
    callbacks: BuildWindowCallbacks;
}

/**
 * Main build window component that displays build controls
 */
export default function BuildWindow({ state, callbacks }: BuildWindowProps) {
    const { visible, hasSelection, isRestricted, animationsEnabled } = state;
    const { onDeselect, onRotate, onDelete, onPlace } = callbacks;

    // Don't render if there's no selection or building is restricted
    const shouldShow = visible && hasSelection && !isRestricted;

    return (
        <frame
            Active={true}
            AnchorPoint={new Vector2(0.5, 1)}
            BackgroundTransparency={1}
            Position={new UDim2(0.5, 0, 0.95, -5)}
            Size={new UDim2(0.3, 0, 0, 75)}
            Visible={shouldShow}
        >
            {/* Deselect button */}
            <BuildButton
                anchorPoint={new Vector2(0.5, 0)}
                text="Deselect"
                position={new UDim2(0.5, 0, 0.05, 0)}
                size={new UDim2(0.7, 0, 0.4, -2)}
                animationsEnabled={animationsEnabled}
                onClick={onDeselect}
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
                    icon={getAsset("assets/Build/Rotate.png")}
                    layoutOrder={4}
                    animationsEnabled={animationsEnabled}
                    onClick={onRotate}
                />

                {/* Delete button */}
                <BuildButton
                    text="Delete"
                    icon={getAsset("assets/Build/Delete.png")}
                    iconColor={Color3.fromRGB(255, 70, 70)}
                    layoutOrder={6}
                    animationsEnabled={animationsEnabled}
                    onClick={onDelete}
                />

                {/* Place button (only visible on touch devices) */}
                <BuildButton
                    text="Place"
                    icon={getAsset("assets/Build/Place.png")}
                    iconColor={Color3.fromRGB(170, 255, 127)}
                    layoutOrder={5}
                    visible={UserInputService.TouchEnabled}
                    animationsEnabled={animationsEnabled}
                    onClick={onPlace}
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
