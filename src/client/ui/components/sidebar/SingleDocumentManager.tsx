import DocumentManager from "client/ui/components/window/WindowManager";

/**
 * Manages single-document interface behavior for sidebar windows
 */
export default class SingleDocumentManager {
    static activeDocument?: string;

    /**
     * Toggles the visibility of a document by its name, disabling the last opened document if necessary.
     * @param documentName The unique name of the document to toggle.
     * @returns True if the document was opened, false if it was closed.
     */
    static toggle(documentName: string) {
        if (this.activeDocument === documentName) {
            this.activeDocument = undefined;
            DocumentManager.setVisible(documentName, false);
            return false;
        }

        if (this.activeDocument) {
            DocumentManager.setVisible(this.activeDocument, false);
        }

        this.activeDocument = documentName;
        DocumentManager.setVisible(documentName, true);
        return true;
    }

    /**
     * Opens a document by its name, closing any previously opened document.
     * @param documentName The unique name of the window to open.
     * @returns True if the document was opened, false if it was already open.
     */
    static open(documentName: string) {
        if (this.activeDocument === documentName) {
            return false;
        }

        if (this.activeDocument) {
            DocumentManager.setVisible(this.activeDocument, false);
        }
        this.activeDocument = documentName;
        DocumentManager.setVisible(documentName, true);
    }

    /**
     * Closes a document by its name if it is currently open.
     * @param documentName The unique name of the document to close.
     * @returns True if the document was closed, false if it was not open.
     */
    static close(documentName: string) {
        if (this.activeDocument !== documentName) {
            return false;
        }

        this.activeDocument = undefined;
        DocumentManager.setVisible(documentName, false);
        return true;
    }
}
