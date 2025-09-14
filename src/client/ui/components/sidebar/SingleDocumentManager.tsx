import WindowManager from "client/ui/components/window/WindowManager";

/**
 * Manages single-document interface behavior for sidebar windows
 */
export default class SingleDocumentManager {
    static activeWindow?: string;

    /**
     * Toggles the visibility of a window by its name, disabling the last opened window if necessary.
     * @param windowName The unique name of the window to toggle.
     * @returns True if the window was opened, false if it was closed.
     */
    static toggleWindow(windowName: string) {
        if (this.activeWindow === windowName) {
            this.activeWindow = undefined;
            WindowManager.setWindowVisible(windowName, false);
            return false;
        }

        if (this.activeWindow) {
            WindowManager.setWindowVisible(this.activeWindow, false);
        }

        this.activeWindow = windowName;
        WindowManager.setWindowVisible(windowName, true);
        return true;
    }

    /**
     * Opens a window by its name, closing any previously opened window.
     * @param windowName The unique name of the window to open.
     * @returns True if the window was opened, false if it was already open.
     */
    static openWindow(windowName: string) {
        if (this.activeWindow === windowName) {
            return false;
        }

        if (this.activeWindow) {
            WindowManager.setWindowVisible(this.activeWindow, false);
        }
        this.activeWindow = windowName;
        WindowManager.setWindowVisible(windowName, true);
    }

    /**
     * Closes a window by its name if it is currently open.
     * @param windowName The unique name of the window to close.
     * @returns True if the window was closed, false if it was not open.
     */
    static closeWindow(windowName: string) {
        if (this.activeWindow !== windowName) {
            return false;
        }

        this.activeWindow = undefined;
        WindowManager.setWindowVisible(windowName, false);
        return true;
    }
}
