/**
 * @fileoverview Global window management system for handling window state and hotkeys across React roots.
 *
 * Provides a centralized system for managing window visibility and the global close hotkey.
 * This solves the issue of multiple close buttons competing for the same hotkey.
 * Works across multiple React render cycles using static methods.
 */

import { useEffect, useRef } from "@rbxts/react";
import HotkeyManager from "client/ui/components/hotkeys/HotkeyManager";
import Packets from "shared/Packets";

/**
 * Information about a registered window.
 */
export interface WindowInfo {
    /** Unique identifier for the window */
    id: string;

    /** Whether the window is currently visible */
    visible: boolean;

    /** Callback function to be called when the window is opened */
    onOpen?: () => void;

    /** Callback function to be called when the window is closed */
    onClose?: () => void;

    /** Priority for closing windows (higher priority closes first) */
    priority?: number;
}

/**
 * Global window manager with static methods for managing windows across React roots
 */
export default class WindowManager {
    private static windows = new Map<string, WindowInfo>();
    private static tabOpenedConnection: RBXScriptConnection;
    private static initialized = false;

    /**
     * Registers a new window with the window manager, allowing it to be tracked and managed
     * with features like the global close hotkey.
     *
     * @param windowInfo Information about the window to register (id, onClose, priority).
     */
    static registerWindow(windowInfo: Omit<WindowInfo, "visible">): void {
        const { id, onOpen, onClose, priority = 0 } = windowInfo;
        this.windows.set(id, {
            id,
            visible: false,
            onOpen,
            onClose,
            priority,
        });
    }

    /**
     * Unregisters a window from the window manager, removing it from tracking.
     *
     * @param id The unique identifier of the window to unregister.
     */
    static unregisterWindow(id: string): void {
        this.windows.delete(id);
    }

    /**
     * Sets the visibility of a registered window.
     * @param id The unique identifier of the window.
     * @param visible Whether the window should be visible or not.
     * @returns True if the window was found and updated, false otherwise.
     */
    static setWindowVisible(id: string, visible: boolean): boolean {
        const window = this.windows.get(id);
        if (!window) return false;
        window.visible = visible;
        if (visible) window.onOpen?.();
        else window.onClose?.();
        return true;
    }

    /**
     * Gets a list of all currently visible windows, sorted by priority (higher priority first).
     *
     * @returns Array of visible WindowInfo objects.
     */
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

    static isWindowVisible(id: string): boolean {
        const window = this.windows.get(id);
        return window ? window.visible : false;
    }

    private static initialize(): void {
        if (this.initialized) {
            this.cleanup();
        }

        // Register global close hotkey
        HotkeyManager.bindHotkey({
            action: () => {
                const visibleWindows = this.getVisibleWindows();
                if (visibleWindows.size() > 0) {
                    // Close the highest priority visible window
                    const windowToClose = visibleWindows[0];
                    if (windowToClose.priority !== undefined && windowToClose.priority < 0) return false; // Ignore windows with negative priority

                    return this.setWindowVisible(windowToClose.id, false);
                }
                return false;
            },
            priority: 0,
            label: "Close Window",
        });

        this.tabOpenedConnection = Packets.tabOpened.fromServer((tab) => this.setWindowVisible(tab, true));
        this.initialized = true;
    }

    private static cleanup(): void {
        this.windows.clear();
        this.tabOpenedConnection?.Disconnect();
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
export function useWindow({ id, visible, onOpen, onClose, priority = 0 }: WindowInfo) {
    const onOpenRef = useRef(onOpen);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onOpenRef.current = onOpen;
    }, [onOpen]);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Register/unregister the window (only when id or priority changes)
    useEffect(() => {
        WindowManager.registerWindow({
            id,
            onOpen: () => onOpenRef.current?.(),
            onClose: () => onCloseRef.current?.(),
            priority,
        });
        return () => WindowManager.unregisterWindow(id);
    }, [id, priority]);

    // Update visibility when it changes
    useEffect(() => {
        WindowManager.setWindowVisible(id, visible);
    }, [id, visible]);
}
