/**
 * @fileoverview React hook for integrating tooltips with components.
 * 
 * Provides a simple `useTooltipProps` hook that returns props to spread
 * onto components for automatic tooltip functionality.
 */

import { useCallback } from "@rbxts/react";
import Item from "shared/item/Item";
import { TooltipData, useTooltip } from "shared/ui/components/tooltip/TooltipProvider";
import useHover from "shared/ui/hooks/useHover";

interface UseTooltipProps {
    data: TooltipData | (() => TooltipData);
    onMoved?: () => void;
    onEnter?: () => void;
    onLeave?: () => void;
}

/**
 * Hook that provides tooltip event handlers for components
 * 
 * @param tooltipData Static tooltip data or function that returns tooltip data
 * @returns Hover data object
 */
export function useTooltipProps({ data, onMoved, onEnter, onLeave }: UseTooltipProps) {
    const { showTooltip, hideTooltip } = useTooltip();

    const handleMouseMoved = useCallback(() => {
        onMoved?.();
        const tooltipData = typeIs(data, "function") ? data() : data;
        showTooltip(tooltipData);
    }, [data, showTooltip, onMoved]);

    const handleMouseEnter = useCallback(() => {
        onEnter?.();
        const tooltipData = typeIs(data, "function") ? data() : data;
        showTooltip(tooltipData);
    }, [onEnter]);

    const handleMouseLeave = useCallback(() => {
        onLeave?.();
        hideTooltip();
    }, [hideTooltip, onLeave]);

    return useHover({ onMoved: handleMouseMoved, onEnter: handleMouseEnter, onLeave: handleMouseLeave });
}

/**
 * Convenience hook for item tooltips
 * 
 * @param item The item to display in the tooltip
 * @param uuid Unique item identifier
 * @returns Hover data object
 */
export function useItemTooltip(item: Item, uuid?: string) {
    return useTooltipProps({ data: { item, uuid } });
}

/**
 * Convenience hook for message tooltips
 * 
 * @param message The message to display in the tooltip
 * @returns Hover data object
 */
export function useMessageTooltip(message: string) {
    return useTooltipProps({ data: { message } });
}
