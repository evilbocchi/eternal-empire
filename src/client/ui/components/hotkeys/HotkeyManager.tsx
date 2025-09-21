/**
 * @fileoverview Global hotkey manager for managing keyboard shortcuts across multiple React roots.
 *
 * Provides a centralized hotkey system using static methods, similar to TooltipManager.
 * Supports hotkey binding, priority management, and integration with UI components
 * across different React render cycles.
 */

import { DependencyList, useEffect } from "@rbxts/react";
import { Environment } from "@rbxts/ui-labs";
import eat from "shared/hamster/eat";
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
    /** Action to execute on key release */
    endAction?: () => boolean;
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
        keyCode: Enum.KeyCode.P,
        label: "Settings",
        priority: 2,
    },
    {
        keyCode: Enum.KeyCode.E,
        label: "Purchase",
        priority: 0,
    },
    {
        keyCode: Enum.KeyCode.O,
        label: "Purchase All",
        priority: 0,
    },
    {
        keyCode: Enum.KeyCode.X,
        label: "Close Window",
        priority: 1,
    },
    {
        keyCode: Enum.KeyCode.Q,
        label: "Deselect Build",
        priority: 0,
    },
    {
        keyCode: Enum.KeyCode.R,
        label: "Rotate Build",
        priority: 0,
    },
    {
        keyCode: Enum.KeyCode.X,
        label: "Delete Build",
        priority: 0,
    },
    {
        keyCode: Enum.KeyCode.Z,
        label: "Previous Page",
        priority: 0,
    },
    {
        keyCode: Enum.KeyCode.C,
        label: "Next Page",
        priority: 0,
    },
] as const;

/**
 * Global hotkey manager with static methods for managing hotkeys across React roots
 */
export default class HotkeyManager {
    private static optionsPerLabel = new Map<string, HotkeyOptions>();
    private static isSettingHotkey = false;
    private static settingHotkeyCallbacks = new Set<(setting: boolean) => void>();

    static setIsSettingHotkey(setting: boolean) {
        this.isSettingHotkey = setting;
        // Notify all subscribers
        for (const callback of this.settingHotkeyCallbacks) {
            callback(setting);
        }
    }

    /**
     * Binds a hotkey with the specified options, returning an unbind function for cleanup.
     * @param options Hotkey options including label, action, and optional endAction.
     * @returns Unbind function to remove the hotkey binding.
     */
    static bindHotkey(options: HotkeyOptions): () => void {
        this.optionsPerLabel.set(options.label, options);
        return () => {
            this.optionsPerLabel.delete(options.label);
        };
    }

    static executeHotkey(keyCode: Enum.KeyCode, endAction?: boolean): boolean {
        // Don't execute hotkeys when setting hotkeys
        if (this.isSettingHotkey) return false;

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
            const options = this.optionsPerLabel.get(binding.label);
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
    }

    static subscribeToSettingHotkey(callback: (setting: boolean) => void): () => void {
        this.settingHotkeyCallbacks.add(callback);
        return () => {
            this.settingHotkeyCallbacks.delete(callback);
        };
    }

    static {
        const inputBeganConnection = Environment.UserInput.InputBegan.Connect((input, gameProcessed) => {
            if (gameProcessed) return;
            this.executeHotkey(input.KeyCode);
        });

        const inputEndedConnection = Environment.UserInput.InputEnded.Connect((input, gameProcessed) => {
            if (gameProcessed) return;
            this.executeHotkey(input.KeyCode, true);
        });

        eat(() => {
            inputBeganConnection.Disconnect();
            inputEndedConnection.Disconnect();
        });
    }
}

/**
 * Hook to bind a hotkey with automatic cleanup - works across different React roots
 */
export function useHotkey(options?: HotkeyOptions, deps?: DependencyList) {
    useEffect(
        () => {
            if (!options) return;
            return HotkeyManager.bindHotkey(options);
        },
        deps ? [options, ...deps] : [options],
    );
}
