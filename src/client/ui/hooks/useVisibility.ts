import { useEffect } from "@rbxts/react";
import SingleDocumentManager from "client/ui/components/sidebar/SingleDocumentManager";
import DocumentManager from "client/ui/components/window/DocumentManager";

/**
 * A custom hook that sets the visibility of a window whenever the `id` or `visible` parameters change.
 * @internal Should only be used in storybooks.
 * @param id The unique identifier for the window
 * @param visible A boolean indicating whether the window should be visible
 */
export default function useVisibility(id: string, visible: boolean) {
    useEffect(() => {
        DocumentManager.setVisible(id, visible);
    }, [id, visible]);
}

/**
 * A custom hook that opens or closes a window in the SingleDocumentManager whenever the `id` or `visible` parameters change.
 * @internal Should only be used in storybooks.
 * @param id The unique identifier for the window
 * @param visible A boolean indicating whether the window should be visible
 */
export function useSingleDocumentVisibility(id: string, visible: boolean) {
    useEffect(() => {
        if (visible) {
            SingleDocumentManager.open(id);
        } else {
            SingleDocumentManager.close(id);
        }
    }, [id, visible]);
}

/**
 * Sets the visibility of main UI documents.
 * @param visible Whether the main UI documents should be visible
 * @internal Should only be used in storybooks.
 */
export function setVisibilityMain(visible: boolean) {
    DocumentManager.setVisible("Backpack", visible);
    DocumentManager.setVisible("Balance", visible);
    DocumentManager.setVisible("Sidebar", visible);
    DocumentManager.setVisible("Position", visible);
    DocumentManager.setVisible("TrackedQuest", visible);
}
