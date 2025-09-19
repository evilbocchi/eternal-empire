import { useEffect } from "@rbxts/react";
import { useDocument } from "client/ui/components/window/WindowManager";
import SingleDocumentManager from "./SingleDocumentManager";

/**
 * A custom hook for managing window visibility state with the SingleDocumentManager.
 * @param windowName The name of the window to manage visibility for
 * @returns An object containing the current visibility state and helper functions
 */
export default function useSingleDocument({
    id,
    defaultVisible = false,
    priority,
    onClose,
    onOpen,
}: {
    /** Unique identifier for the document */
    id: string;
    /** Initial visibility state of the document */
    defaultVisible?: boolean;
    /** Priority for closing documents (higher priority closes first) */
    priority?: number;
    /** Optional callback after the document is closed. */
    onClose?: () => void;
    /** Optional callback after the document is opened. */
    onOpen?: () => void;
}) {
    const { visible, setVisible } = useDocument({ id, defaultVisible, priority });

    useEffect(() => {
        if (visible) {
            SingleDocumentManager.open(id);
            onOpen?.();
        } else {
            SingleDocumentManager.close(id);
            onClose?.();
        }
    }, [visible]);

    return {
        id,
        visible,
        closeDocument: () => setVisible(false),
        openDocument: () => setVisible(true),
        toggleDocument: () => setVisible(!visible),
    };
}
