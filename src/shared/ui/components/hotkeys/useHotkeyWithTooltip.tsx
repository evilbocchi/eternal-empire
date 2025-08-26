/**
 * @fileoverview Hooks for integrating hotkeys with tooltips and UI components.
 * 
 * Provides hooks that combine hotkey functionality with tooltip display,
 * matching the patterns from the original HotkeysController.
 */

import { useCallback } from "@rbxts/react";
import { useHotkey, useHotkeys } from "shared/ui/components/hotkeys/HotkeyProvider";
import { useTooltipProps } from "shared/ui/components/tooltip/useTooltipProps";

/**
 * Hook that combines hotkey binding with tooltip integration
 * Similar to the original HotkeysController.setHotkey method
 */
export function useHotkeyWithTooltip(
    keyCode: Enum.KeyCode | undefined,
    action: (usedHotkey: boolean) => boolean,
    options?: {
        priority?: number;
        label?: string;
        endAction?: () => boolean;
        enabled?: boolean;
        hideHotkey?: boolean;
    }
) {
    const label = options?.label;
    const hideHotkey = options?.hideHotkey;

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
        priority: options?.priority,
        label: options?.label,
        endAction: options?.endAction,
        enabled: options?.enabled,
    } : undefined);

    // Get tooltip props
    const tooltipProps = useTooltipProps(tooltipMessage ? { message: tooltipMessage } : {});

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

/**
 * Hook for simple hotkey binding without UI integration
 */
export function useSimpleHotkey(
    keyCode: Enum.KeyCode,
    action: () => void | boolean,
    options?: {
        priority?: number;
        enabled?: boolean;
    }
) {
    useHotkey({
        keyCode,
        action: (usedHotkey) => {
            const result = action();
            return result === true;
        },
        priority: options?.priority,
        enabled: options?.enabled,
    });
}

/**
 * Hook for toggle hotkeys (like settings windows)
 */
export function useToggleHotkey(
    keyCode: Enum.KeyCode,
    isOpen: boolean,
    onToggle: () => void,
    options?: {
        priority?: number;
        enabled?: boolean;
        label?: string;
    }
) {
    const { bindHotkey } = useHotkeys();

    useHotkey({
        keyCode,
        action: (usedHotkey) => {
            onToggle();
            return true; // Always consume the hotkey
        },
        priority: options?.priority,
        enabled: options?.enabled,
        label: options?.label,
    });

    return {
        hotkeyLabel: keyCode.Name,
        fullLabel: options?.label ? `${options.label} (${keyCode.Name})` : keyCode.Name,
    };
}
