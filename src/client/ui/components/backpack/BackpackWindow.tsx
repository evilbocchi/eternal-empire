/**
 * @fileoverview Main backpack window React component
 *
 * Displays the player's tool inventory with hotkey numbers and selection states.
 * Manages visibility based on adaptive tab and build mode states.
 */

import React from "@rbxts/react";
import ToolOption, { ToolOptionData } from "client/ui/components/backpack/ToolOption";

export interface BackpackWindowState {
    /** Whether the backpack window is visible */
    visible: boolean;
    /** Array of tool data to display */
    tools: ToolOptionData[];
}

export interface BackpackWindowCallbacks {
    /** Called when a tool option is clicked */
    onToolClick: (tool: Tool) => void;
}

interface BackpackWindowProps {
    /** Current backpack window state */
    state: BackpackWindowState;
    /** Event callbacks */
    callbacks: BackpackWindowCallbacks;
    /** Whether animations are enabled */
    animationsEnabled?: boolean;
}

/**
 * Main backpack window component that displays tool options
 */
export default function BackpackWindow({ state, callbacks, animationsEnabled = true }: BackpackWindowProps) {
    const { visible, tools } = state;
    const { onToolClick } = callbacks;

    return (
        <frame
            key="BackpackWindow"
            AnchorPoint={new Vector2(0.5, 1)}
            BackgroundTransparency={1}
            Position={new UDim2(0.5, 0, 0.985, -5)}
            Size={new UDim2(0.45, 200, 0.035, 35)}
            Visible={visible}
            ZIndex={0}
        >
            {/* Tool options */}
            {tools.map((toolData) => (
                <ToolOption
                    key={`tool-${toolData.name}`}
                    data={toolData}
                    onClick={onToolClick}
                    animationsEnabled={animationsEnabled}
                />
            ))}

            {/* Layout */}
            <uilistlayout
                FillDirection={Enum.FillDirection.Horizontal}
                HorizontalAlignment={Enum.HorizontalAlignment.Center}
                Padding={new UDim(0, 10)}
                SortOrder={Enum.SortOrder.LayoutOrder}
                VerticalAlignment={Enum.VerticalAlignment.Center}
            />
        </frame>
    );
}
