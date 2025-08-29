/**
 * @fileoverview React hotkey provider and hooks for managing keyboard shortcuts.
 * 
 * Provides a centralized hotkey system using React Context and hooks.
 * Supports hotkey binding, priority management, and integration with UI components.
 */

import React, { createContext, DependencyList, ReactNode, useContext, useEffect, useRef } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";

export interface HotkeyBinding {
    /** The key code to bind */
    keyCode: Enum.KeyCode;
    /** The action to execute */
    action: (usedHotkey: boolean) => boolean;
    /** Priority for execution order (higher = executes first) */
    priority?: number;
    /** Label for the hotkey */
    label?: string;
    /** Action to execute on key release */
    endAction?: () => boolean;
    /** Whether this binding is currently enabled */
    enabled?: boolean;
}

interface HotkeyContextValue {
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

    const executeHotkey = (keyCode: Enum.KeyCode): boolean => {
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
    };

    const bindHotkey = (binding: HotkeyBinding) => {
        const id = `hotkey_${binding.label}`;
        bindingsRef.current.set(id, binding);

        // Return cleanup function
        return () => {
            bindingsRef.current.delete(id);
        };
    };

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
    }, [executeHotkey]);

    const contextValue: HotkeyContextValue = {
        bindHotkey,
        executeHotkey,
    };

    return (
        <HotkeyContext.Provider value={contextValue}>
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