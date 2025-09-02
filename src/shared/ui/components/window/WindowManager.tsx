/**
 * @fileoverview Window management system for handling global window state and hotkeys.
 * 
 * Provides a centralized system for managing window visibility and the global close hotkey.
 * This solves the issue of multiple close buttons competing for the same hotkey.
 */

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef } from "@rbxts/react";
import { playSound } from "shared/asset/GameAssets";
import { useHotkey } from "shared/ui/components/hotkeys/HotkeyProvider";

interface WindowInfo {
    id: string;
    visible: boolean;
    onClose: () => void;
    priority?: number; // Higher priority windows get closed first
}

interface WindowManagerContextValue {
    /** Register a window with the manager */
    registerWindow: (id: string, onClose: () => void, priority?: number) => void;
    /** Unregister a window from the manager */
    unregisterWindow: (id: string) => void;
    /** Update a window's visibility */
    setWindowVisible: (id: string, visible: boolean) => void;
    /** Get the currently visible windows */
    getVisibleWindows: () => WindowInfo[];
}

const WindowManagerContext = createContext<WindowManagerContextValue | undefined>(undefined);

interface WindowManagerProps {
    children: ReactNode;
}

/**
 * Window manager component that provides centralized window state and hotkey management
 */
export default function WindowManager({ children }: WindowManagerProps) {
    const windowsRef = useRef<Map<string, WindowInfo>>(new Map());

    const registerWindow = useCallback((id: string, onClose: () => void, priority = 0) => {
        windowsRef.current.set(id, {
            id,
            visible: false,
            onClose,
            priority,
        });
    }, []);

    const unregisterWindow = useCallback((id: string) => {
        windowsRef.current.delete(id);
    }, []);

    const setWindowVisible = useCallback((id: string, visible: boolean) => {
        const window = windowsRef.current.get(id);
        if (window) {
            window.visible = visible;
        }
    }, []);

    const getVisibleWindows = useCallback(() => {
        const visibleWindows: WindowInfo[] = [];
        for (const [_, window] of windowsRef.current) {
            if (window.visible) {
                visibleWindows.push(window);
            }
        }
        // Sort by priority (higher priority first)
        table.sort(visibleWindows, (a, b) => (b.priority || 0) < (a.priority || 0));
        return visibleWindows;
    }, []);

    // Global hotkey for closing windows
    useHotkey({
        action: () => {
            const visibleWindows = getVisibleWindows();
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


    return (
        <WindowManagerContext.Provider value={{
            registerWindow,
            unregisterWindow,
            setWindowVisible,
            getVisibleWindows,
        }}>
            {children}
        </WindowManagerContext.Provider>
    );
}

/**
 * Hook to access window manager functionality
 */
export function useWindowManager() {
    const context = useContext(WindowManagerContext);
    if (context === undefined) {
        error("useWindowManager must be used within a WindowManager");
    }
    return context;
}

/**
 * Hook for window components to register themselves with the window manager
 */
export function useWindow(id: string, visible: boolean, onClose: () => void, priority = 0) {
    const { registerWindow, unregisterWindow, setWindowVisible } = useWindowManager();
    const onCloseRef = useRef(onClose);

    // Update the onClose ref when it changes
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Register/unregister the window (only when id or priority changes)
    useEffect(() => {
        registerWindow(id, () => onCloseRef.current(), priority);
        return () => unregisterWindow(id);
    }, [id, priority, registerWindow, unregisterWindow]);

    // Update visibility when it changes
    useEffect(() => {
        setWindowVisible(id, visible);
    }, [id, visible, setWindowVisible]);
}
