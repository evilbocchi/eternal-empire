/**
 * @fileoverview React tooltip provider and context for managing tooltips across the application.
 *
 * Provides a centralized tooltip system using React Context and hooks, replacing the
 * Flamework controller pattern with modern React patterns. Supports both item tooltips
 * and simple message tooltips with smooth animations and positioning.
 */

import { useCallback } from "@rbxts/react";
import { TooltipManager } from "client/components/tooltip/TooltipWindow";
import useHover from "client/hooks/useHover";
import Item from "shared/item/Item";

declare global {
    interface UseTooltipProps {
        data: TooltipData | (() => TooltipData);
        onMoved?: () => void;
        onEnter?: () => void;
        onLeave?: () => void;
    }

    interface TooltipData {
        /** Plain text message for simple tooltips */
        message?: string;
        /** Item to display for item tooltips */
        item?: Item;
        /** Unique item instance */
        uniqueInstance?: UniqueItemInstance;
        /** Position where tooltip should appear */
        position?: Vector2;
    }
}

/**
 * Hook that provides tooltip event handlers for components
 *
 * @param tooltipData Static tooltip data or function that returns tooltip data
 * @returns Hover data object
 */
export function useTooltipProps({ data, onEnter, onLeave }: UseTooltipProps): UseHoverReturn {
    const handleMouseEnter = useCallback(() => {
        onEnter?.();
        const tooltipData = typeIs(data, "function") ? data() : data;
        TooltipManager.showTooltip(tooltipData);
    }, [onEnter]);

    const handleMouseLeave = useCallback(() => {
        onLeave?.();
        TooltipManager.hideTooltip();
    }, [onLeave]);

    return useHover({ onEnter: handleMouseEnter, onLeave: handleMouseLeave });
}

/**
 * Convenience hook for item tooltips
 *
 * @param item The item to display in the tooltip
 * @param uniqueInstance Unique item identifier
 * @returns Hover data object
 */

export function useItemTooltip(item: Item, uniqueInstance?: UniqueItemInstance): UseHoverReturn {
    return useTooltipProps({ data: { item, uniqueInstance } });
} /**
 * Convenience hook for message tooltips
 *
 * @param message The message to display in the tooltip
 * @returns Hover data object
 */

export function useMessageTooltip(message: string): UseHoverReturn {
    return useTooltipProps({ data: { message } });
}
