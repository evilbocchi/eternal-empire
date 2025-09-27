/**
 * @fileoverview Hooks for integrating hotkeys with tooltips and UI components.
 *
 * Provides hooks that combine hotkey functionality with tooltip display,
 * matching the patterns from the original HotkeysController.
 */

import { useCallback } from "@rbxts/react";
import { HotkeyLabel, useHotkey } from "client/components/hotkeys/HotkeyManager";
import { useTooltipProps } from "client/components/tooltip/TooltipManager";

/**
 * Hook that combines hotkey binding with tooltip integration
 * Similar to the original HotkeysController.setHotkey method
 */
export default function useHotkeyWithTooltip({
    action,
    label,
    endAction,
    onEnter,
    onLeave,
}: {
    /**
     * The action to execute when the hotkey is pressed
     * @param usedHotkey Whether the action was triggered by a hotkey (true) or a click (false)
     */
    action: (usedHotkey: boolean) => boolean;
    /** The label for the hotkey */
    label: HotkeyLabel;
    /** Optional action to execute when the hotkey is released */
    endAction?: () => boolean;
    /** Optional callback when the tooltip is shown */
    onEnter?: () => void;
    /** Optional callback when the tooltip is hidden */
    onLeave?: () => void;
}) {
    // Bind the hotkey
    useHotkey({
        action,
        label: label,
        endAction: endAction,
    });

    // Get tooltip props
    const tooltipProps = useTooltipProps({ data: { message: label }, onEnter, onLeave });

    // Return both the action handler and tooltip props
    const handleClick = useCallback(() => {
        return action(false);
    }, [action]);

    return {
        hovering: tooltipProps.hovering,
        onEnter: tooltipProps.onEnter,
        onLeave: tooltipProps.onLeave,
        onClick: handleClick,
        events: {
            ...tooltipProps.events,
            Activated: handleClick,
        },
    };
}
