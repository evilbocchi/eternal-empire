/**
 * @fileoverview React hook for integrating tooltips with components.
 * 
 * Provides a simple `useTooltipProps` hook that returns props to spread
 * onto components for automatic tooltip functionality.
 */

import { useCallback } from "@rbxts/react";
import Item from "shared/item/Item";
import { TooltipData, useTooltip } from "shared/ui/components/tooltip/TooltipProvider";
import { useHover } from "shared/ui/hooks/useHover";

/**
 * Hook that provides tooltip event handlers for components
 * 
 * @param tooltipData Static tooltip data or function that returns tooltip data
 * @returns Hover data object
 */
export function useTooltipProps(data: TooltipData | (() => TooltipData), onEnter?: (() => void), onLeave?: (() => void)) {
    const { showTooltip, hideTooltip } = useTooltip();

    const handleMouseEnter = useCallback(() => {
        onEnter?.();
        const tooltipData = typeIs(data, "function") ? data() : data;
        showTooltip(tooltipData);
    }, [data, showTooltip, onEnter]);

    const handleMouseLeave = useCallback(() => {
        onLeave?.();
        hideTooltip();
    }, [hideTooltip, onLeave]);

    return useHover(handleMouseEnter, handleMouseLeave);
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
