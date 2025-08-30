/**
 * @fileoverview React hotkey provider and hooks for managing keyboard shortcuts.
 * 
 * Provides a centralized hotkey system using React Context and hooks.
 * Supports hotkey binding, priority management, and integration with UI components.
 */

import React, { createContext, DependencyList, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import Packets from "shared/Packets";

export interface HotkeyBinding {
    /** The key code to bind */
    keyCode: Enum.KeyCode;
    /** The action to execute */
    action: (usedHotkey: boolean) => boolean;
    /** Priority for execution order (higher = executes first) */
    priority: number;
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
    /** Whether hotkey setting mode is active (prevents hotkey execution) */
    isSettingHotkey: boolean;
    /** Set whether hotkey setting mode is active */
    setIsSettingHotkey: (setting: boolean) => void;
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
    const [isSettingHotkey, setIsSettingHotkey] = useState(false);

    const executeHotkey = useCallback((keyCode: Enum.KeyCode, endAction?: boolean): boolean => {
        // Don't execute hotkeys when setting hotkeys
        if (isSettingHotkey) return false;

        // Get all bindings for this key and sort by priority
        const allBindings: HotkeyBinding[] = [];
        for (const [id, binding] of bindingsRef.current) {
            const customValue = Packets.settings.get()!.hotkeys[id];
            const binded = customValue !== undefined ? Enum.KeyCode.FromValue(customValue) : binding.keyCode;
            if (binding.enabled !== false && binded === keyCode) {
                allBindings.push(binding);
            }
        }

        // Sort by priority (higher priority first)
        table.sort(allBindings, (a, b) => (b.priority || 0) > (a.priority || 0));

        for (const binding of allBindings) {
            if (endAction === true) {
                if (binding.endAction?.()) {
                    return true;
                }
            }
            else if (binding.action(true)) {
                return true;
            }
        }
        return false;
    }, [isSettingHotkey]);

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
            executeHotkey(input.KeyCode, true);
        });

        return () => {
            inputBeganConnection.Disconnect();
            inputEndedConnection.Disconnect();
        };
    }, [executeHotkey]);

    return (
        <HotkeyContext.Provider value={{
            bindingsRef,
            bindHotkey,
            executeHotkey,
            isSettingHotkey,
            setIsSettingHotkey,
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