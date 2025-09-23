import { RefObject, useEffect, useState } from "@rbxts/react";
import { PARALLEL } from "client/constants";
import { loadItemIntoViewport, loadItemViewportManagement } from "client/ui/components/item/ItemViewport";
import { IS_EDIT } from "shared/Context";

/**
 * A special hook to manage item viewports in CI environments.
 * @returns The shared ItemViewportManagement instance, or undefined if not in CI.
 */
export default function useCIViewportManagement({ enabled = IS_EDIT }): ItemViewportManagement | undefined {
    const [viewportManagement, setViewportManagement] = useState<ItemViewportManagement | undefined>();

    // Initialize viewport management when component mounts
    useEffect(() => {
        let newViewportManagement: ItemViewportManagement | undefined;
        if (enabled) {
            if (viewportManagement !== undefined) return;
            newViewportManagement = loadItemViewportManagement();
            setViewportManagement(newViewportManagement);
        } else {
            setViewportManagement(undefined);
        }
        // Cleanup when component unmounts
        return () => {
            newViewportManagement?.destroy();
            setViewportManagement(undefined);
        };
    }, [enabled]);

    return viewportManagement;
}

/**
 * Hook to load an item into a viewport frame using shared viewport management.
 * @param viewportRef The reference to the viewport frame.
 * @param itemId The ID of the item to load.
 * @param viewportManagement Optional shared viewport management instance.
 */
export function useItemViewport(
    viewportRef: RefObject<ViewportFrame>,
    itemId: string,
    viewportManagement?: ItemViewportManagement,
) {
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        loadItemIntoViewport(PARALLEL, viewport, itemId, viewportManagement);
    }, [viewportManagement, itemId]);
}
