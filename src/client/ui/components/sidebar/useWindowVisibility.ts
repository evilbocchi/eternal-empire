import { useCallback, useEffect, useState } from "@rbxts/react";
import { SidebarManager } from "client/ui/components/sidebar/SidebarButtons";

/**
 * A custom hook for managing window visibility state with the SidebarManager.
 *
 * This hook automatically handles:
 * - Initial visibility state based on SidebarManager.activeWindow
 * - Listening to window toggle events
 * - Cleanup of event connections
 *
 * @param windowName The name of the window to manage visibility for
 * @returns An object containing the current visibility state and helper functions
 */
export default function useWindowVisibility(windowName: string) {
    const [visible, setVisible] = useState(SidebarManager.activeWindow === windowName);

    useEffect(() => {
        const connection = SidebarManager.windowToggled.connect((toggledWindowName, isOpen) => {
            if (toggledWindowName === windowName) {
                setVisible(isOpen);
            } else if (isOpen && toggledWindowName !== windowName) {
                setVisible(false);
            }
        });
        return () => connection.disconnect();
    }, [windowName]);

    const closeWindow = useCallback(() => SidebarManager.closeWindow(windowName), [windowName]);
    const openWindow = useCallback(() => SidebarManager.openWindow(windowName), [windowName]);
    const toggleWindow = useCallback(() => SidebarManager.toggleWindow(windowName), [windowName]);

    return {
        visible,
        closeWindow,
        openWindow,
        toggleWindow,
    };
}
