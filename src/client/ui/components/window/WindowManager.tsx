/**
 * @fileoverview Global window management system for handling window state and hotkeys across React roots.
 *
 * Provides a centralized system for managing window visibility and the global close hotkey.
 * This solves the issue of multiple close buttons competing for the same hotkey.
 * Works across multiple React render cycles using static methods.
 */

import { useEffect, useState } from "@rbxts/react";
import HotkeyManager from "client/ui/components/hotkeys/HotkeyManager";
import eat from "shared/hamster/eat";
import Packets from "shared/Packets";

/**
 * Information about a registered document.
 */
export interface DocumentInfo {
    /** Unique identifier for the document */
    id: string;

    visible: boolean;

    setVisible: (visible: boolean) => void;

    /** Priority for closing documents (higher priority closes first) */
    priority?: number;
}

/**
 * Global document manager with static methods for managing documents across React roots
 */
export default class DocumentManager {
    static readonly INFO_PER_DOCUMENT = new Map<string, DocumentInfo>();

    /**
     * Registers a new document with the document manager, allowing it to be tracked and managed
     * with features like the global close hotkey.
     * @param documentInfo Information about the document to register (id, onClose, priority).
     */
    static register(documentInfo: DocumentInfo): void {
        this.INFO_PER_DOCUMENT.set(documentInfo.id, documentInfo);
    }

    /**
     * Unregisters a document from the document manager, removing it from tracking.
     * @param id The unique identifier of the document to unregister.
     */
    static unregister(id: string): void {
        this.INFO_PER_DOCUMENT.delete(id);
    }

    /**
     * Triggers the `setVisible` function of the specified document to change its visibility.
     * @param id The unique identifier of the document to modify.
     * @param visible The new visibility state to set.
     * @returns Whether the visibility change was successful.
     */
    static setVisible(id: string, visible: boolean) {
        const documentInfo = this.INFO_PER_DOCUMENT.get(id);
        if (!documentInfo) return false;
        documentInfo.setVisible(visible);
        return true;
    }

    /**
     * Toggles the `visible` state of the specified document with `setVisible`.
     * @param id The unique identifier of the document to toggle.
     * @returns Whether the toggle was successful.
     */
    static toggle(id: string) {
        const documentInfo = this.INFO_PER_DOCUMENT.get(id);
        if (!documentInfo) return false;
        documentInfo.setVisible(!documentInfo.visible);
        return true;
    }

    /**
     * Gets a list of all currently visible documents, sorted by priority (higher priority first).
     *
     * @returns Array of visible DocumentInfo objects.
     */
    static getVisibleDocuments(): DocumentInfo[] {
        const visibleDocuments: DocumentInfo[] = [];
        for (const [_, document] of this.INFO_PER_DOCUMENT) {
            if (document.visible) {
                visibleDocuments.push(document);
            }
        }
        // Sort by priority (higher priority first)
        table.sort(visibleDocuments, (a, b) => (b.priority || 0) < (a.priority || 0));
        return visibleDocuments;
    }

    static isVisible(id: string): boolean {
        const documentInfo = this.INFO_PER_DOCUMENT.get(id);
        return documentInfo ? documentInfo.visible : false;
    }

    static {
        // Register global close hotkey
        HotkeyManager.bindHotkey({
            action: () => {
                const visibleWindows = this.getVisibleDocuments();
                if (visibleWindows.size() > 0) {
                    // Close the highest priority visible window
                    const windowToClose = visibleWindows[0];
                    if (windowToClose.priority !== undefined && windowToClose.priority < 0) return false; // Ignore windows with negative priority

                    windowToClose.setVisible(false);
                    return true;
                }
                return false;
            },
            label: "Close Window",
        });

        const tabOpenedConnection = Packets.tabOpened.fromServer((tab) => this.setVisible(tab, true));
        eat(tabOpenedConnection);
    }
}

/**
 * Hook for document components to register themselves with the {@link DocumentManager} that
 * works across different React roots.
 */
export function useDocument({
    id,
    defaultVisible = false,
    priority = 0,
}: {
    /** Unique identifier for the document */
    id: string;
    /** Initial visibility state of the document */
    defaultVisible?: boolean;
    /** Priority for closing documents (higher priority closes first) */
    priority?: number;
}) {
    const [visible, setVisible] = useState(defaultVisible);

    // Register/unregister the document (only when id or priority changes)
    useEffect(() => {
        DocumentManager.register({
            id,
            visible,
            setVisible,
            priority,
        });
        return () => DocumentManager.unregister(id);
    }, [id, priority]);

    // Update visibility when it changes
    useEffect(() => {
        const documentInfo = DocumentManager.INFO_PER_DOCUMENT.get(id);
        if (!documentInfo) return;
        documentInfo.visible = visible;
    }, [id, visible]);

    return { id, visible, setVisible };
}
