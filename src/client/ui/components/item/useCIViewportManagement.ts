import { useEffect, useState } from "@rbxts/react";
import { ItemViewportManagement, loadItemViewportManagement } from "client/ui/components/item/ItemViewport";
import { IS_CI } from "shared/Context";

/**
 * A special hook to manage item viewports in CI environments.
 * @returns The shared ItemViewportManagement instance, or undefined if not in CI.
 */
export default function useCIViewportManagement({ enabled = IS_CI }): ItemViewportManagement | undefined {
    const [viewportManagement, setViewportManagement] = useState<ItemViewportManagement | undefined>();

    // Initialize viewport management when component mounts
    useEffect(() => {
        let newViewportManagement: ItemViewportManagement | undefined;
        if (enabled) {
            newViewportManagement = loadItemViewportManagement();
            setViewportManagement(newViewportManagement);
        } else {
            setViewportManagement(undefined);
        }
        // Cleanup when component unmounts
        return () => {
            newViewportManagement?.cleanup();
            setViewportManagement(undefined);
        };
    }, [enabled]);

    return viewportManagement;
}
