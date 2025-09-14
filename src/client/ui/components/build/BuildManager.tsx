/**
 * @fileoverview Build system manager component
 *
 * High-level manager that bridges build controller logic with the new React UI.
 * Manages state synchronization and provides callbacks for build operations.
 */

import React, { useCallback, useEffect, useState } from "@rbxts/react";
import type BuildController from "client/controllers/gameplay/BuildController";
import BuildWindow, { BuildWindowCallbacks, BuildWindowState } from "client/ui/components/build/BuildWindow";
import useHotkeyWithTooltip from "client/ui/components/hotkeys/useHotkeyWithTooltip";
import useProperty from "client/ui/hooks/useProperty";
import Packets from "shared/Packets";

interface BuildManagerProps {
    /** Interface to the build controller */
    buildController?: BuildController;
}

/**
 * High-level build manager component that handles UI state and coordinates with build logic.
 * This component should be integrated into your main UI controller.
 */
export default function BuildManager({ buildController }: BuildManagerProps) {
    const [buildState, setBuildState] = useState<BuildWindowState>({
        hasSelection: false,
        isRestricted: false,
        animationsEnabled: true,
    });
    const settings = useProperty(Packets.settings);

    // Update animations setting when prop changes
    useEffect(() => {
        setBuildState((prev) => ({ ...prev, animationsEnabled: settings.BuildAnimation }));
    }, [settings.BuildAnimation]);

    // Sync with build controller state
    useEffect(() => {
        if (!buildController) return;

        const updateState = () => {
            const hasSelection = buildController.hasSelection();
            const isRestricted = buildController.getRestricted();

            setBuildState((prev) => ({
                ...prev,
                visible: hasSelection && !isRestricted,
                hasSelection,
                isRestricted,
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
            buildController?.revertSelected();
            buildController?.deselectAll();
        }, [buildController]),

        onRotate: useCallback(() => {
            buildController?.rotateSelection();
        }, [buildController]),

        onDelete: useCallback(() => {
            buildController?.deleteSelection();
        }, [buildController]),

        onPlace: useCallback(() => {
            buildController?.placeSelection();
        }, [buildController]),
    };

    useHotkeyWithTooltip({
        label: "Deselect Build",
        action: () => {
            if (!buildState.hasSelection || buildState.isRestricted) return false;
            callbacks.onDeselect();
            return true;
        },
    });

    useHotkeyWithTooltip({
        label: "Rotate Build",
        action: () => {
            if (!buildState.hasSelection || buildState.isRestricted) return false;
            callbacks.onRotate();
            return true;
        },
    });

    useHotkeyWithTooltip({
        label: "Delete Build",
        action: () => {
            if (!buildState.hasSelection || buildState.isRestricted) return false;
            callbacks.onDelete();
            return true;
        },
    });

    return <BuildWindow state={buildState} callbacks={callbacks} />;
}
