import { useCallback, useState } from "@rbxts/react";
import SingleDocumentManager from "./SingleDocumentManager";
import { useWindow } from "client/ui/components/window/WindowManager";

/**
 * A custom hook for managing window visibility state with the SingleDocumentManager.
 *
 * This hook automatically handles:
 * - Initial visibility state based on SingleDocumentManager.activeWindow
 * - Listening to window toggle events
 * - Cleanup of event connections
 *
 * @param windowName The name of the window to manage visibility for
 * @returns An object containing the current visibility state and helper functions
 */
export default function useSingleDocumentWindow(windowName: string) {
    const [visible, setVisible] = useState(SingleDocumentManager.activeWindow === windowName);
    const closeWindow = useCallback(() => SingleDocumentManager.closeWindow(windowName), [windowName]);
    const openWindow = useCallback(() => SingleDocumentManager.openWindow(windowName), [windowName]);
    const toggleWindow = useCallback(() => SingleDocumentManager.toggleWindow(windowName), [windowName]);
    useWindow({
        id: windowName,
        visible,
        onClose: () => {
            setVisible(false);
            closeWindow();
        },
        onOpen: () => {
            setVisible(true);
            openWindow();
        },
    });

    return {
        visible,
        closeWindow,
        openWindow,
        toggleWindow,
    };
}
