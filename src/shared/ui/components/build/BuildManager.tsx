/**
 * @fileoverview Build system manager component
 * 
 * High-level manager that bridges build controller logic with the new React UI.
 * Manages state synchronization and provides callbacks for build operations.
 */

import React, { useCallback, useEffect, useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import BuildWindow, { BuildWindowState, BuildWindowCallbacks } from "shared/ui/components/build/BuildWindow";

export interface BuildControllerInterface {
    /** Check if building is currently restricted */
    getRestricted(): boolean;
    /** Check if there are items selected */
    hasSelection(): boolean;
    /** Deselect all items and revert to original positions */
    revertAndDeselectAll(): void;
    /** Rotate selected items by 90 degrees */
    rotateSelection(): void;
    /** Delete/unplace selected items */
    deleteSelection(): void;
    /** Place selected items at current position */
    placeSelection(): void;
    /** Add a listener for state changes */
    onStateChange(callback: () => void): () => void;
}

interface BuildManagerProps {
    /** Interface to the build controller */
    buildController?: BuildControllerInterface;
    /** Whether animations are enabled globally */
    animationsEnabled?: boolean;
}

/**
 * High-level build manager component that handles UI state and coordinates with build logic.
 * This component should be integrated into your main UI controller.
 */
export default function BuildManager({
    buildController,
    animationsEnabled = true
}: BuildManagerProps) {
    const [buildState, setBuildState] = useState<BuildWindowState>({
        visible: false,
        hasSelection: false,
        isRestricted: false,
        animationsEnabled
    });

    // Update animations setting when prop changes
    useEffect(() => {
        setBuildState(prev => ({ ...prev, animationsEnabled }));
    }, [animationsEnabled]);

    // Sync with build controller state
    useEffect(() => {
        if (!buildController) return;

        const updateState = () => {
            const hasSelection = buildController.hasSelection();
            const isRestricted = buildController.getRestricted();

            setBuildState(prev => ({
                ...prev,
                visible: hasSelection && !isRestricted,
                hasSelection,
                isRestricted
            }));
        };

        // Initial state update
        updateState();

        // Listen for state changes
        const unsubscribe = buildController.onStateChange(updateState);

        return unsubscribe;
    }, [buildController]);

    // Callback handlers that delegate to build controller
    const callbacks: BuildWindowCallbacks = {
        onDeselect: useCallback(() => {
            buildController?.revertAndDeselectAll();
        }, [buildController]),

        onRotate: useCallback(() => {
            buildController?.rotateSelection();
        }, [buildController]),

        onDelete: useCallback(() => {
            buildController?.deleteSelection();
        }, [buildController]),

        onPlace: useCallback(() => {
            buildController?.placeSelection();
        }, [buildController])
    };

    return (
        <BuildWindow
            state={buildState}
            callbacks={callbacks}
        />
    );
}
