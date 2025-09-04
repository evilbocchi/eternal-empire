import React from "@rbxts/react";
import { LOCAL_PLAYER } from "client/constants";
import { useCharacterPosition } from "client/ui/components/position/usePlayerPosition";
import PositionWindow from "./PositionWindow";

interface PositionManagerProps {
    /** The player to track position for (defaults to LocalPlayer) */
    player?: Player;
    /** Whether the component is visible */
    visible?: boolean;
    /** Custom styling props to pass to PositionWindow */
    anchorPoint?: Vector2;
    windowPosition?: UDim2;
    size?: UDim2;
}

/**
 * PositionManager is a smart wrapper around PositionWindow that automatically
 * tracks player position and handles character spawning/despawning.
 *
 * This component integrates the position tracking hook with the UI component,
 * providing a complete solution for displaying player coordinates.
 */
export default function PositionManager({
    player = LOCAL_PLAYER,
    visible = true,
    anchorPoint,
    windowPosition,
    size,
}: PositionManagerProps) {
    const { position } = useCharacterPosition(player);

    return (
        <PositionWindow
            position={position}
            visible={visible}
            anchorPoint={anchorPoint}
            windowPosition={windowPosition}
            size={size}
        />
    );
}
