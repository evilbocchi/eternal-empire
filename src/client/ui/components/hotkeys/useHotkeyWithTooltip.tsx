/**
 * @fileoverview Hooks for integrating hotkeys with tooltips and UI components.
 *
 * Provides hooks that combine hotkey functionality with tooltip display,
 * matching the patterns from the original HotkeysController.
 */

import { useCallback } from "@rbxts/react";
import { useHotkey } from "client/ui/components/hotkeys/HotkeyManager";
import { useTooltipProps } from "client/ui/components/tooltip/TooltipManager";

declare global {
    type TooltipProps = ReturnType<typeof useHotkeyWithTooltip>;

    type HotkeyWithTooltipOptions = {
        action: (usedHotkey: boolean) => boolean;
        priority?: number;
        label: HotkeyLabel;
        endAction?: () => boolean;
        onEnter?: () => void;
        onLeave?: () => void;
    };
}

/**
 * Hook that combines hotkey binding with tooltip integration
 * Similar to the original HotkeysController.setHotkey method
 */
export default function useHotkeyWithTooltip({
    action,
    priority,
    label,
    endAction,
    onEnter,
    onLeave,
}: HotkeyWithTooltipOptions) {
    // Bind the hotkey
    useHotkey({
        action,
        priority: priority ?? 0,
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
