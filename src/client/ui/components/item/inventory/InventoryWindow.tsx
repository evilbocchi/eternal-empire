/**
 * @fileoverview Main inventory window React component
 *
 * Modern React implementation of the inventory window using BasicWindow.
 * Follows the same pattern as QuestWindow for consistency.
 */

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import type InventoryController from "client/controllers/interface/InventoryController";
import InventoryEmptyState from "client/ui/components/item/inventory/InventoryEmptyState";
import InventoryFilter, {
    filterItems,
    ItemFilterData,
    SEARCHABLE_ITEMS,
    useBasicInventoryFilter,
} from "client/ui/components/item/inventory/InventoryFilter";
import InventoryItemSlot from "client/ui/components/item/inventory/InventoryItemSlot";
import useCIViewportManagement from "client/ui/components/item/useCIViewportManagement";
import useSingleDocument from "client/ui/components/sidebar/useSingleDocumentWindow";
import BasicWindow from "client/ui/components/window/BasicWindow";
import { RobotoMono } from "client/ui/GameFonts";
import useProperty from "client/ui/hooks/useProperty";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import type Item from "shared/item/Item";
import Packets from "shared/Packets";

const MemoizedInventoryItemSlot = memo(InventoryItemSlot);

/**
 * Calculate optimal cell count for the inventory grid.
 */
function calculateOptimalCellCount(containerX: number): number {
    return math.max(math.round((containerX - 50) / 65), 3);
}

export function getBestUniqueInstances(uniqueInstances: Map<string, UniqueItemInstance>) {
    // Find the best unique item instance for the given base item ID
    const bestUuidPerItem = new Map<string, string>();
    const bestInstancePerItem = new Map<string, UniqueItemInstance>();
    const lastBestPotsPerItem = new Map<string, number>();
    for (const [uuid, instance] of uniqueInstances) {
        if (instance.placed) continue; // Skip placed instances
        let thisPots = 0;
        for (const [_, potValue] of instance.pots) {
            thisPots += potValue;
        }

        const lastBestPots = lastBestPotsPerItem.get(instance.baseItemId);
        if (lastBestPots === undefined || thisPots > lastBestPots) {
            lastBestPotsPerItem.set(instance.baseItemId, thisPots);
            bestUuidPerItem.set(instance.baseItemId, uuid);
            bestInstancePerItem.set(instance.baseItemId, instance);
        }
    }
    return bestUuidPerItem;
}

/**
 * Main inventory window component following the QuestWindow pattern
 */
export default function InventoryWindow({
    inventoryController,
    viewportsEnabled,
}: {
    inventoryController?: InventoryController;
    viewportsEnabled?: boolean;
}) {
    const { id, visible, closeDocument } = useSingleDocument({ id: "Inventory" });
    const { searchQuery, props: filterProps } = useBasicInventoryFilter();
    const [queryTime, setQueryTime] = useState(0);
    const [cellSize, setCellSize] = useState(new UDim2(0, 65, 0, 65));
    const viewportManagement = useCIViewportManagement({ enabled: viewportsEnabled });

    // Observe inventory data from packets
    const inventory = useProperty(Packets.inventory);
    const uniqueInstances = useProperty(Packets.uniqueInstances);

    const scrollingFrameRef = useRef<ScrollingFrame>();

    // Calculate cell size based on container width
    const updateCellSize = useCallback((width: number) => {
        const optimalCellCount = calculateOptimalCellCount(width);
        const newCellSize = new UDim2(1 / optimalCellCount, -12, 1, 0);
        setCellSize(newCellSize);
    }, []);

    // Monitor size changes
    useEffect(() => {
        const frame = scrollingFrameRef.current;
        if (frame) {
            const updateSize = () => {
                updateCellSize(frame.AbsoluteSize.X);
            };

            // Initial size update
            updateSize();

            // Listen for size changes
            const connection = frame.GetPropertyChangedSignal("AbsoluteSize").Connect(updateSize);
            return () => connection.Disconnect();
        }
    }, [updateCellSize]);

    const dataPerItem = useMemo(() => {
        const startTime = tick();
        const dataPerItem: Map<
            string,
            ItemFilterData & {
                amount?: number;
                uuid?: string;
            }
        > = filterItems(searchQuery, filterProps.traitFilters);

        const amountsPerItem = new Map<string, number>();
        for (const [itemId, amount] of inventory) {
            amountsPerItem.set(itemId, amount);
        }
        for (const [, uniqueInstance] of uniqueInstances) {
            const itemId = uniqueInstance.baseItemId;
            amountsPerItem.set(itemId, (amountsPerItem.get(itemId) ?? 0) + 1);
        }
        const bestInstancePerItem = getBestUniqueInstances(uniqueInstances);
        for (const [id, data] of dataPerItem) {
            const amount = amountsPerItem.get(id) ?? 0;
            data.amount = amount;
            if (amount <= 0) {
                data.visible = false;
            }

            const bestInstance = bestInstancePerItem.get(id);
            if (bestInstance !== undefined) {
                data.uuid = bestInstance;
            }
        }

        setQueryTime(tick() - startTime);
        return dataPerItem;
    }, [inventory, uniqueInstances, searchQuery, filterProps.traitFilters]);

    // Check if user has any items at all (for empty state)
    let hasAnyItems = false;
    for (const [, amount] of inventory) {
        if (amount > 0) {
            hasAnyItems = true;
            break;
        }
    }
    const isEmpty = !hasAnyItems; // Only show empty state if user has no items at all

    // Handle item activation
    const handleItemActivated = useCallback(
        (item: Item) => {
            if (!inventoryController) return;

            // Use the controller's activation logic
            const success = inventoryController.activateItem(item);

            // Close the inventory window if activation was successful
            if (success) {
                closeDocument();
            }
        },
        [inventoryController, closeDocument],
    );

    return (
        <BasicWindow
            icon={getAsset("assets/Inventory.png")}
            id={id}
            strokeColor={
                new ColorSequence([
                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 186, 125)),
                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 123, 123)),
                ])
            }
            visible={visible}
        >
            {/* Empty state */}
            <InventoryEmptyState visible={isEmpty} />

            {/* Main inventory content */}
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={hasAnyItems}>
                {/* Filter options */}
                <InventoryFilter {...filterProps} />

                {/* Item list container */}
                <scrollingframe
                    ref={scrollingFrameRef}
                    AnchorPoint={new Vector2(0.5, 0)}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    LayoutOrder={1}
                    Position={new UDim2(0.5, 0, 0, 0)}
                    ScrollBarThickness={6}
                    Selectable={false}
                    Size={new UDim2(1, 0, 0.975, -20)}
                    Visible={dataPerItem.size() > 0}
                >
                    <uipadding
                        PaddingBottom={new UDim(0, 5)}
                        PaddingLeft={new UDim(0, 10)}
                        PaddingRight={new UDim(0, 10)}
                        PaddingTop={new UDim(0, 5)}
                    />

                    <uigridlayout
                        CellPadding={new UDim2(0, 12, 0, 12)}
                        CellSize={cellSize}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                    >
                        <uiaspectratioconstraint />
                    </uigridlayout>

                    {/* Render inventory items TODO Decouple from React render loop for max performance */}
                    {SEARCHABLE_ITEMS.map((item) => {
                        const data = dataPerItem.get(item.id);

                        return (
                            <MemoizedInventoryItemSlot
                                key={item.id}
                                item={item}
                                amount={data?.amount}
                                layoutOrder={data === undefined ? item.layoutOrder : -data.layoutOrder}
                                visible={data?.visible === true}
                                onActivated={() => handleItemActivated(item)}
                                viewportManagement={viewportManagement}
                            />
                        );
                    })}
                </scrollingframe>

                {/* Layout for filter and item list */}
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 8)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
            </frame>

            <textlabel
                AnchorPoint={new Vector2(0.5, 0)}
                FontFace={RobotoMono}
                Text={`Query Time: ${string.format("%.3f", queryTime * 1000)}ms`}
                LayoutOrder={-2}
                Position={new UDim2(0.5, 0, 0, -15)}
            />
        </BasicWindow>
    );
}
