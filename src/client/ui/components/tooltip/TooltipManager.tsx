/**
 * @fileoverview React tooltip provider and context for managing tooltips across the application.
 *
 * Provides a centralized tooltip system using React Context and hooks, replacing the
 * Flamework controller pattern with modern React patterns. Supports both item tooltips
 * and simple message tooltips with smooth animations and positioning.
 */

import React, { useCallback, useState } from "@rbxts/react";
import Item from "shared/item/Item";
import ItemMetadata from "shared/item/ItemMetadata";
import Items from "shared/items/Items";
import TooltipWindow from "client/ui/components/tooltip/TooltipWindow";
import useHover from "client/ui/hooks/useHover";

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
        /** UUID for unique item instances */
        uuid?: string;
        /** Position where tooltip should appear */
        position?: Vector2;
    }
}

// Precompute item metadata for efficient tooltip rendering
const METADATA_PER_ITEM = new Map<Item, ItemMetadata>();
for (const item of Items.sortedItems) {
    METADATA_PER_ITEM.set(item, new ItemMetadata(item, 16, "Bold"));
}

/**
 * Global tooltip manager with static methods for showing/hiding tooltips
 */
export default class TooltipManager {
    static showTooltip: (data: TooltipData) => void = () => {};
    static hideTooltip: () => void = () => {};
    static isVisible: boolean = false;
}

// NOTE: Don't use providers, we want this to work across multiple React roots

/**
 * Tooltip provider component that manages tooltip state and positioning
 */
export function TooltipDisplay() {
    const [tooltipData, setTooltipData] = useState<TooltipData | undefined>(undefined);
    const [isVisible, setIsVisible] = useState(false);

    TooltipManager.showTooltip = useCallback((data: TooltipData) => {
        setTooltipData(data);
        setIsVisible(true);
    }, []);

    TooltipManager.hideTooltip = useCallback(() => {
        setIsVisible(false);
    }, []);
    TooltipManager.isVisible = isVisible;

    return <TooltipWindow data={tooltipData} visible={isVisible} metadata={METADATA_PER_ITEM} />;
} /**
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
} /**
 * Convenience hook for item tooltips
 *
 * @param item The item to display in the tooltip
 * @param uuid Unique item identifier
 * @returns Hover data object
 */

export function useItemTooltip(item: Item, uuid?: string): UseHoverReturn {
    return useTooltipProps({ data: { item, uuid } });
} /**
 * Convenience hook for message tooltips
 *
 * @param message The message to display in the tooltip
 * @returns Hover data object
 */

export function useMessageTooltip(message: string): UseHoverReturn {
    return useTooltipProps({ data: { message } });
}
