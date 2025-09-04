/**
 * @fileoverview Global window management system for handling window state and hotkeys across React roots.
 *
 * Provides a centralized system for managing window visibility and the global close hotkey.
 * This solves the issue of multiple close buttons competing for the same hotkey.
 * Works across multiple React render cycles using static methods.
 */

import { useEffect, useRef } from "@rbxts/react";
import { playSound } from "shared/asset/GameAssets";
import HotkeyManager from "shared/ui/components/hotkeys/HotkeyManager";

interface WindowInfo {
    id: string;
    visible: boolean;
    onClose: () => void;
    priority?: number; // Higher priority windows get closed first
}

/**
 * Global window manager with static methods for managing windows across React roots
 */
export default class WindowManager {
    private static windows = new Map<string, WindowInfo>();
    private static initialized = false;

    static registerWindow(id: string, onClose: () => void, priority = 0): void {
        this.windows.set(id, {
            id,
            visible: false,
            onClose,
            priority,
        });
    }

    static unregisterWindow(id: string): void {
        this.windows.delete(id);
    }

    static setWindowVisible(id: string, visible: boolean): void {
        const window = this.windows.get(id);
        if (window) {
            window.visible = visible;
        }
    }

    static getVisibleWindows(): WindowInfo[] {
        const visibleWindows: WindowInfo[] = [];
        for (const [_, window] of this.windows) {
            if (window.visible) {
                visibleWindows.push(window);
            }
        }
        // Sort by priority (higher priority first)
        table.sort(visibleWindows, (a, b) => (b.priority || 0) < (a.priority || 0));
        return visibleWindows;
    }

    static initialize(): void {
        if (this.initialized) return;
        this.initialized = true;

        // Register global close hotkey
        HotkeyManager.bindHotkey({
            action: () => {
                const visibleWindows = this.getVisibleWindows();
                if (visibleWindows.size() > 0) {
                    // Close the highest priority visible window
                    const windowToClose = visibleWindows[0];
                    playSound("MenuClose.mp3");
                    windowToClose.onClose();
                    return true;
                }
                return false;
            },
            priority: 0,
            label: "Close Window",
        });
    }

    static cleanup(): void {
        this.windows.clear();
        this.initialized = false;
    }

    static {
        this.initialize();
    }
}

/**
 * Hook for window components to register themselves with the window manager
 * Works across different React roots
 */
export function useWindow(id: string, visible: boolean, onClose: () => void, priority = 0) {
    const onCloseRef = useRef(onClose);

    // Update the onClose ref when it changes
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Register/unregister the window (only when id or priority changes)
    useEffect(() => {
        WindowManager.registerWindow(id, () => onCloseRef.current(), priority);
        return () => WindowManager.unregisterWindow(id);
    }, [id, priority]);

    // Update visibility when it changes
    useEffect(() => {
        WindowManager.setWindowVisible(id, visible);
    }, [id, visible]);
}
