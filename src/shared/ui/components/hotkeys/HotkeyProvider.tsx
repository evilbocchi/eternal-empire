/**
 * @fileoverview React hotkey provider and hooks for managing keyboard shortcuts.
 *
 * Provides a centralized hotkey system using React Context and hooks.
 * Supports hotkey binding, priority management, and integration with UI components.
 */

import React, {
    createContext,
    DependencyList,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import Packets from "shared/Packets";

declare global {
    type HotkeyLabel = (typeof HOTKEY_BINDINGS)[number]["label"];
    interface HotkeyBinding {
        keyCode: Enum.KeyCode;
        label: HotkeyLabel;
        priority: number;
    }
}

export interface HotkeyOptions {
    /** The hotkey label */
    label: HotkeyLabel;
    /** The action to execute */
    action: (usedHotkey: boolean) => boolean;
    /** Priority for execution order (higher = executes first) */
    priority: number;
    /** Action to execute on key release */
    endAction?: () => boolean;
}

interface HotkeyContextValue {
    /** Bind a hotkey */
    bindHotkey: (options: HotkeyOptions) => () => void;
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

export const HOTKEY_BINDINGS = [
    {
        keyCode: Enum.KeyCode.F,
        label: "Inventory",
        priority: 0,
    },
    {
        keyCode: Enum.KeyCode.V,
        label: "Quests",
        priority: 0,
    },
    {
        keyCode: Enum.KeyCode.X,
        label: "Close Window",
        priority: 0,
    },
] as const;

/**
 * Hotkey provider component that manages hotkey state and input handling
 */
export default function HotkeyProvider({ children }: HotkeyProviderProps) {
    const optionsPerLabelRef = useRef<Map<string, HotkeyOptions>>(new Map());
    const [isSettingHotkey, setIsSettingHotkey] = useState(false);

    const executeHotkey = useCallback(
        (keyCode: Enum.KeyCode, endAction?: boolean): boolean => {
            // Don't execute hotkeys when setting hotkeys
            if (isSettingHotkey) return false;

            // Get all bindings for this key and sort by priority
            const allBindings: HotkeyBinding[] = [];
            for (const binding of HOTKEY_BINDINGS) {
                const customValue = Packets.settings.get()!.hotkeys[binding.label];
                const binded = customValue !== undefined ? Enum.KeyCode.FromValue(customValue) : binding.keyCode;
                if (binded === keyCode) {
                    allBindings.push(binding);
                }
            }

            // Sort by priority (higher priority first)
            table.sort(allBindings, (a, b) => (b.priority || 0) > (a.priority || 0));

            for (const binding of allBindings) {
                const options = optionsPerLabelRef.current.get(binding.label);
                if (!options) continue;

                if (endAction === true) {
                    if (options.endAction?.()) {
                        return true;
                    }
                } else if (options.action(true)) {
                    return true;
                }
            }
            return false;
        },
        [isSettingHotkey],
    );

    const bindHotkey = useCallback((options: HotkeyOptions) => {
        optionsPerLabelRef.current.set(options.label, options);
        return () => {
            optionsPerLabelRef.current.delete(options.label);
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
        <HotkeyContext.Provider
            value={{
                bindHotkey,
                executeHotkey,
                isSettingHotkey,
                setIsSettingHotkey,
            }}
        >
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
export function useHotkey(options?: HotkeyOptions, deps?: DependencyList) {
    const { bindHotkey } = useHotkeys();

    useEffect(
        () => {
            if (!options) return;

            const cleanup = bindHotkey(options);
            return cleanup;
        },
        deps ? [bindHotkey, options, ...deps] : [bindHotkey, options],
    );
}
