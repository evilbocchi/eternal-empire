/**
 * @fileoverview Hooks for integrating hotkeys with tooltips and UI components.
 * 
 * Provides hooks that combine hotkey functionality with tooltip display,
 * matching the patterns from the original HotkeysController.
 */

import { useCallback } from "@rbxts/react";
import { useHotkey } from "shared/ui/components/hotkeys/HotkeyProvider";
import { useTooltipProps } from "shared/ui/components/tooltip/useTooltipProps";

declare global {
    type TooltipProps = ReturnType<typeof useHotkeyWithTooltip>;

    type HotkeyWithTooltipOptions = {
        keyCode: Enum.KeyCode | undefined,
        action: (usedHotkey: boolean) => boolean,
        priority?: number;
        label?: string;
        endAction?: () => boolean;
        enabled?: boolean;
        hideHotkey?: boolean;
        onEnter?: () => void;
        onLeave?: () => void;
    };
}

/**
 * Hook that combines hotkey binding with tooltip integration
 * Similar to the original HotkeysController.setHotkey method
 */
export default function useHotkeyWithTooltip({ keyCode, action, priority, label, endAction, enabled, hideHotkey, onEnter, onLeave }: HotkeyWithTooltipOptions) {
    // Create tooltip message that includes hotkey if not hidden
    const tooltipMessage = (() => {
        if (!label) return undefined;
        if (!keyCode || hideHotkey) return label;
        return `${label} (${keyCode.Name})`;
    })();

    // Bind the hotkey
    useHotkey(keyCode ? {
        keyCode,
        action,
        priority: priority,
        label: label,
        endAction: endAction,
        enabled: enabled,
    } : undefined);

    // Get tooltip props
    const tooltipProps = useTooltipProps(tooltipMessage ? { message: tooltipMessage } : {}, onEnter, onLeave);

    // Return both the action handler and tooltip props
    const handleClick = useCallback(() => {
        return action(false);
    }, [action]);

    return {
        ...tooltipProps,
        onClick: handleClick,
        hotkeyLabel: keyCode ? keyCode.Name : undefined,
    };
}