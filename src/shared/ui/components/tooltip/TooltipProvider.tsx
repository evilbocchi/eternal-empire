/**
 * @fileoverview React tooltip provider and context for managing tooltips across the application.
 * 
 * Provides a centralized tooltip system using React Context and hooks, replacing the
 * Flamework controller pattern with modern React patterns. Supports both item tooltips
 * and simple message tooltips with smooth animations and positioning.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "@rbxts/react";
import { RunService, UserInputService, Workspace } from "@rbxts/services";
import Item from "shared/item/Item";
import ItemMetadata from "shared/item/ItemMetadata";
import Items from "shared/items/Items";
import TooltipWindow from "shared/ui/components/tooltip/TooltipWindow";

export interface TooltipData {
    /** Plain text message for simple tooltips */
    message?: string;
    /** Item to display for item tooltips */
    item?: Item;
    /** UUID for unique item instances */
    uuid?: string;
    /** Position where tooltip should appear */
    position?: Vector2;
}

interface TooltipContextValue {
    /** Show a tooltip with the given data */
    showTooltip: (data: TooltipData) => void;
    /** Hide the currently shown tooltip */
    hideTooltip: () => void;
    /** Check if a tooltip is currently visible */
    isVisible: boolean;
}

const TooltipContext = createContext<TooltipContextValue | undefined>(undefined);

// Precompute item metadata for efficient tooltip rendering
const METADATA_PER_ITEM = new Map<Item, ItemMetadata>();
for (const item of Items.sortedItems) {
    METADATA_PER_ITEM.set(item, new ItemMetadata(item, 16, "Bold"));
}

interface TooltipProviderProps {
    children: React.ReactNode;
}

/**
 * Tooltip provider component that manages tooltip state and positioning
 */
export function TooltipProvider({ children }: TooltipProviderProps) {
    const [tooltipData, setTooltipData] = useState<TooltipData | undefined>(undefined);
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState(new Vector2(0, 0));
    const hideTimeoutRef = useRef<RBXScriptConnection | undefined>(undefined);

    const showTooltip = useCallback((data: TooltipData) => {
        // Clear any pending hide timeout
        if (hideTimeoutRef.current) {
            hideTimeoutRef.current.Disconnect();
            hideTimeoutRef.current = undefined;
        }

        setTooltipData(data);
        setIsVisible(true);
    }, []);

    const hideTooltip = useCallback(() => {
        // Add small delay to prevent flicker when moving between elements quickly
        task.spawn(() => {
            task.wait(0.1);
            setIsVisible(false);
            setTooltipData(undefined);
        });
    }, []);

    // Update tooltip position based on mouse position
    useEffect(() => {
        if (!isVisible) return;

        const connection = RunService.Heartbeat.Connect(() => {
            const canvasSize = Workspace.CurrentCamera?.ViewportSize;
            const mouse = UserInputService.GetMouseLocation();

            if (canvasSize !== undefined) {
                const mouseX = mouse.X;
                const mouseY = mouse.Y;

                // Smart positioning to avoid going off-screen
                const x = canvasSize.X - mouseX < 200 ? mouseX - 5 : mouseX + 5;
                const y = canvasSize.Y - mouseY < 200 ? mouseY - 10 : mouseY + 36;

                setPosition(new Vector2(x, y));
            }
        });

        return () => connection.Disconnect();
    }, [isVisible]);    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                hideTimeoutRef.current.Disconnect();
            }
        };
    }, []);

    const contextValue: TooltipContextValue = {
        showTooltip,
        hideTooltip,
        isVisible,
    };

    return (
        <TooltipContext.Provider value={contextValue}>
            {children}
            <TooltipWindow
                data={tooltipData}
                visible={isVisible}
                position={position}
                metadata={METADATA_PER_ITEM}
            />
        </TooltipContext.Provider>
    );
}

/**
 * Hook to access tooltip functionality
 */
export function useTooltip() {
    const context = useContext(TooltipContext);
    if (context === undefined) {
        error("useTooltip must be used within a TooltipProvider");
    }
    return context;
}

/**
 * Hook for easily adding tooltip functionality to components
 */
export function useTooltipHandlers(data: TooltipData | (() => TooltipData)) {
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
