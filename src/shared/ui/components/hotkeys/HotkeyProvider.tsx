/**
 * @fileoverview React hotkey provider and hooks for managing keyboard shortcuts.
 * 
 * Provides a centralized hotkey system using React Context and hooks.
 * Supports hotkey binding, priority management, and integration with UI components.
 */

import React, { createContext, DependencyList, ReactNode, useCallback, useContext, useEffect, useRef } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import Packets from "shared/Packets";
import useProperty from "shared/ui/hooks/useProperty";

export interface HotkeyBinding {
    /** The key code to bind */
    keyCode: Enum.KeyCode;
    /** The action to execute */
    action: (usedHotkey: boolean) => boolean;
    /** Priority for execution order (higher = executes first) */
    priority?: number;
    /** Label for the hotkey */
    label: string;
    /** Action to execute on key release */
    endAction?: () => boolean;
    /** Whether this binding is currently enabled */
    enabled?: boolean;
}

interface HotkeyContextValue {

    bindingsRef: React.MutableRefObject<Map<string, HotkeyBinding>>;
    /** Bind a hotkey */
    bindHotkey: (binding: HotkeyBinding) => () => void;
    /** Execute a specific hotkey */
    executeHotkey: (keyCode: Enum.KeyCode) => boolean;
}

const HotkeyContext = createContext<HotkeyContextValue | undefined>(undefined);

interface HotkeyProviderProps {
    children: ReactNode;
}

/**
 * Hotkey provider component that manages hotkey state and input handling
 */
export default function HotkeyProvider({ children }: HotkeyProviderProps) {
    const bindingsRef = useRef<Map<string, HotkeyBinding>>(new Map());
    const settings = useProperty(Packets.settings);
    const hotkeys = settings.hotkeys;

    useEffect(() => {
        if (!hotkeys) return;

        for (const [label, value] of pairs(hotkeys)) {
            const hotkeyBinding = bindingsRef.current.get(tostring(label));
            if (hotkeyBinding)
                hotkeyBinding.keyCode = Enum.KeyCode.FromValue(value) ?? Enum.KeyCode.Unknown;
        }
    }, [hotkeys]);

    const executeHotkey = useCallback((keyCode: Enum.KeyCode): boolean => {
        // Get all bindings for this key and sort by priority
        const allBindings: HotkeyBinding[] = [];
        for (const [_, binding] of pairs(bindingsRef.current)) {
            if (binding.enabled !== false && binding.keyCode === keyCode) {
                allBindings.push(binding);
            }
        }

        // Sort by priority (higher priority first)
        table.sort(allBindings, (a, b) => (b.priority || 0) > (a.priority || 0));

        for (const binding of allBindings) {
            if (binding.action(true)) {
                return true;
            }
        }
        return false;
    }, []);

    const bindHotkey = useCallback((binding: HotkeyBinding) => {
        const id = binding.label ?? "Unknown";
        bindingsRef.current.set(id, binding);

        // Return cleanup function
        return () => {
            bindingsRef.current.delete(id);
        };
    }, []);

    // Set up input listeners
    useEffect(() => {
        const inputBeganConnection = UserInputService.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed) return;
            executeHotkey(input.KeyCode);
        });

        const inputEndedConnection = UserInputService.InputEnded.Connect((input, gameProcessed) => {
            if (gameProcessed) return;

            // Execute end actions for this key
            const endBindings: HotkeyBinding[] = [];
            for (const [_, binding] of pairs(bindingsRef.current)) {
                if (binding.enabled !== false && binding.keyCode === input.KeyCode && binding.endAction) {
                    endBindings.push(binding);
                }
            }

            // Sort by priority (higher priority first)
            table.sort(endBindings, (a, b) => (b.priority || 0) > (a.priority || 0));

            for (const binding of endBindings) {
                if (binding.endAction && binding.endAction()) {
                    break;
                }
            }
        });

        return () => {
            inputBeganConnection.Disconnect();
            inputEndedConnection.Disconnect();
        };
    }, []);

    return (
        <HotkeyContext.Provider value={{
            bindingsRef,
            bindHotkey,
            executeHotkey,
        }}>
            {children}
        </HotkeyContext.Provider>
    );
}

/**
 * Hook to access hotkey functionality
 */
export function useHotkeys() {
    const context = useContext(HotkeyContext);
    if (context === undefined) {
        error("useHotkeys must be used within a HotkeyProvider");
    }
    return context;
}

/**
 * Hook to bind a hotkey with automatic cleanup
 */
export function useHotkey(binding: HotkeyBinding | undefined, deps?: DependencyList) {
    const { bindHotkey } = useHotkeys();

    useEffect(() => {
        if (!binding) return;

        const cleanup = bindHotkey(binding);
        return cleanup;
    }, deps ? [bindHotkey, binding, ...deps] : [bindHotkey, binding]);
}