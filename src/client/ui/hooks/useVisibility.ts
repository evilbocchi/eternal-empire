import { useEffect } from "@rbxts/react";
import SingleDocumentManager from "client/ui/components/sidebar/SingleDocumentManager";
import WindowManager from "client/ui/components/window/WindowManager";

/**
 * A custom hook to manage the visibility of a window.
 *
 * This hook sets the visibility of a window based on the provided `visible` state.
 * It updates the visibility whenever the `id` or `visible` parameters change.
 *
 * @param id The unique identifier for the window
 * @param visible A boolean indicating whether the window should be visible
 */
export default function useVisibility(id: string, visible: boolean) {
    useEffect(() => {
        WindowManager.setWindowVisible(id, visible);
    }, [id, visible]);
}

/**
 * A custom hook to manage the visibility of a single document window.
 *
 * This hook opens or closes a window in the SingleDocumentManager based on the provided `visible` state.
 * It updates the visibility whenever the `id` or `visible` parameters change.
 *
 * @param id The unique identifier for the window
 * @param visible A boolean indicating whether the window should be visible
 */
export function useSingleDocumentVisibility(id: string, visible: boolean) {
    useEffect(() => {
        if (visible) {
            SingleDocumentManager.openWindow(id);
        } else {
            SingleDocumentManager.closeWindow(id);
        }
    }, [id, visible]);
}
