/**
 * @fileoverview React hook for integrating tooltips with components.
 * 
 * Provides a simple `useTooltipProps` hook that returns props to spread
 * onto components for automatic tooltip functionality.
 */

import { useCallback } from "@rbxts/react";
import Item from "shared/item/Item";
import { TooltipData, useTooltip } from "shared/ui/components/tooltip/TooltipProvider";

/**
 * Hook that provides tooltip event handlers for components
 * 
 * @param tooltipData Static tooltip data or function that returns tooltip data
 * @returns Object with onMouseEnter and onMouseLeave handlers
 * 
 * @example
 * ```tsx
 * function MyButton() {
 *   const tooltipProps = useTooltipProps({ message: "Click me!" });
 *   
 *   return (
 *     <textbutton
 *       Text="Button"
 *       {...tooltipProps}
 *     />
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function ItemButton({ item }: { item: Item }) {
 *   const tooltipProps = useTooltipProps(() => ({ item }));
 *   
 *   return (
 *     <textbutton
 *       Text={item.name}
 *       {...tooltipProps}
 *     />
 *   );
 * }
 * ```
 */
export function useTooltipProps(data: TooltipData | (() => TooltipData)) {
    const { showTooltip, hideTooltip } = useTooltip();

    const handleMouseEnter = useCallback(() => {
        const tooltipData = typeIs(data, "function") ? data() : data;
        showTooltip(tooltipData);
    }, [data, showTooltip]);

    const handleMouseLeave = useCallback(() => {
        hideTooltip();
    }, [hideTooltip]);

    return {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
    };
}

/**
 * Convenience hook for item tooltips
 */
export function useItemTooltip(item: Item, uuid?: string) {
    return useTooltipProps({ item, uuid });
}

/**
 * Convenience hook for message tooltips
 */
export function useMessageTooltip(message: string) {
    return useTooltipProps({ message });
}
