import DocumentManager from "client/components/window/DocumentManager";

/**
 * Manages single-document interface behavior for sidebar windows
 */
namespace SingleDocumentManager {
    export let activeDocument: string | undefined;

    /**
     * Toggles the visibility of a document by its name, disabling the last opened document if necessary.
     * @param documentName The unique name of the document to toggle.
     * @returns True if the document was opened, false if it was closed.
     */
    export function toggle(documentName: string) {
        if (activeDocument === documentName) {
            activeDocument = undefined;
            DocumentManager.setVisible(documentName, false);
            return false;
        }

        if (activeDocument) {
            DocumentManager.setVisible(activeDocument, false);
        }

        activeDocument = documentName;
        DocumentManager.setVisible(documentName, true);
        return true;
    }

    /**
     * Opens a document by its name, closing any previously opened document.
     * @param documentName The unique name of the window to open.
     * @returns True if the document was opened, false if it was already open.
     */
    export function open(documentName: string) {
        if (activeDocument === documentName) {
            return false;
        }

        if (activeDocument) {
            DocumentManager.setVisible(activeDocument, false);
        }
        activeDocument = documentName;
        DocumentManager.setVisible(documentName, true);
    }

    /**
     * Closes a document by its name if it is currently open.
     * @param documentName The unique name of the document to close.
     * @returns True if the document was closed, false if it was not open.
     */
    export function close(documentName: string) {
        if (activeDocument !== documentName) {
            return false;
        }

        activeDocument = undefined;
        DocumentManager.setVisible(documentName, false);
        return true;
    }
}

export default SingleDocumentManager;
