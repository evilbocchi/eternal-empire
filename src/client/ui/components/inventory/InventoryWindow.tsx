/**
 * @fileoverview Main inventory window React component
 *
 * Modern React implementation of the inventory window using BasicWindow.
 * Follows the same pattern as QuestWindow for consistency.
 */

import { FuzzySearch } from "@rbxts/fuzzy-search";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import type InventoryController from "client/controllers/interface/InventoryController";
import { getAsset } from "shared/asset/AssetMap";
import type Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import InventoryEmptyState from "client/ui/components/inventory/InventoryEmptyState";
import InventoryFilter, { isWhitelisted, traitOptions } from "client/ui/components/inventory/InventoryFilter";
import InventoryItemSlot from "client/ui/components/inventory/InventoryItemSlot";
import BasicWindow from "client/ui/components/window/BasicWindow";
import { RobotoMono } from "client/ui/GameFonts";
import useProperty from "client/ui/hooks/useProperty";

declare global {
    interface TraitFilterOption {
        id: TraitFilterId;
        image: string;
        color: Color3;
        selected?: boolean;
    }
}

interface InventoryItemData {
    item: Item;
    uuid?: string;
    amount: number;
    layoutOrder: number;
    visible: boolean;
}

interface InventoryWindowProps {
    /** Whether the inventory window is visible */
    visible: boolean;
    /** Called when window is closed */
    onClose: () => void;
    /** Inventory controller for business logic */
    inventoryController?: InventoryController;
}

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

const SEARCHABLE_ITEMS = Items.sortedItems.filter((item) => !item.isA("HarvestingTool"));

/**
 * Main inventory window component following the QuestWindow pattern
 */
export default function InventoryWindow({ visible, onClose, inventoryController }: InventoryWindowProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [queryTime, setQueryTime] = useState(0);
    const [traitFilters, setTraitFilters] = useState<Set<TraitFilterId>>(new Set());
    const [cellSize, setCellSize] = useState(new UDim2(0, 65, 0, 65));

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

    // Apply filtering TODO
    const inventoryItemDatas = useMemo(() => {
        const startTime = tick();
        const processedItems = new Set<string>();
        const inventoryItemDatas = new Array<InventoryItemData>();

        if (searchQuery !== "") {
            const terms = new Array<string>();
            for (const item of SEARCHABLE_ITEMS) {
                if (!isWhitelisted(item, traitFilters)) continue;
                terms.push(item.name);
            }
            const sorted = FuzzySearch.Sorting.FuzzyScore(terms, searchQuery);
            for (const [index, name] of sorted) {
                const item = Items.itemsPerName.get(name)!;
                if (processedItems.has(item.id)) continue; // Skip duplicates
                processedItems.add(item.id);
                inventoryItemDatas.push({
                    item,
                    amount: 0,
                    layoutOrder: index,
                    visible: index >= 0,
                });
            }
        } else {
            for (const item of SEARCHABLE_ITEMS) {
                if (!isWhitelisted(item, traitFilters)) continue;
                inventoryItemDatas.push({
                    item,
                    amount: 0,
                    layoutOrder: item.layoutOrder,
                    visible: true,
                });
            }
        }

        const amountsPerItem = new Map<string, number>();
        for (const [itemId, amount] of inventory) {
            amountsPerItem.set(itemId, amount);
        }
        for (const [, uniqueInstance] of uniqueInstances) {
            const itemId = uniqueInstance.baseItemId;
            amountsPerItem.set(itemId, (amountsPerItem.get(itemId) ?? 0) + 1);
        }
        const bestInstancePerItem = getBestUniqueInstances(uniqueInstances);
        for (const data of inventoryItemDatas) {
            const amount = amountsPerItem.get(data.item.id) ?? 0;
            data.amount = amount;
            if (amount <= 0) {
                data.visible = false;
            }

            const bestInstance = bestInstancePerItem.get(data.item.id);
            if (bestInstance !== undefined) {
                data.uuid = bestInstance;
            }
        }

        setQueryTime(tick() - startTime);
        return inventoryItemDatas;
    }, [inventory, uniqueInstances, searchQuery, traitFilters]);

    // Check if user has any items at all (for empty state)
    let hasAnyItems = false;
    for (const [, amount] of inventory) {
        if (amount > 0) {
            hasAnyItems = true;
            break;
        }
    }
    const isEmpty = !hasAnyItems; // Only show empty state if user has no items at all

    // Handle search change
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    // Handle trait filter toggle
    const handleTraitToggle = useCallback((traitId: TraitFilterId) => {
        setTraitFilters((prev) => {
            const newFilters = table.clone(prev);
            if (newFilters.has(traitId)) {
                newFilters.delete(traitId);
            } else {
                newFilters.add(traitId);
            }
            return newFilters;
        });
    }, []);

    // Handle filter clear
    const handleFilterClear = useCallback(() => {
        setTraitFilters(new Set());
    }, []);

    // Handle item activation
    const handleItemActivated = useCallback(
        (item: Item) => {
            if (!inventoryController) return;

            // Use the controller's activation logic
            const success = inventoryController.activateItem(item);

            // Close the inventory window if activation was successful
            if (success) {
                onClose();
            }
        },
        [inventoryController, onClose],
    );

    for (const traitOption of traitOptions) {
        traitOption.selected = traitFilters.has(traitOption.id);
    }

    return (
        <BasicWindow
            visible={visible}
            icon={getAsset("assets/Inventory.png")}
            title="Inventory"
            colorSequence={
                new ColorSequence([
                    new ColorSequenceKeypoint(0, Color3.fromRGB(255, 186, 125)),
                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 123, 123)),
                ])
            }
            onClose={onClose}
            windowId="inventory"
            priority={1}
        >
            {/* Empty state */}
            <InventoryEmptyState visible={isEmpty} />

            {/* Main inventory content */}
            <frame BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} Visible={hasAnyItems}>
                {/* Filter options */}
                <InventoryFilter
                    traitOptions={traitOptions}
                    onSearchChange={handleSearchChange}
                    onTraitToggle={handleTraitToggle}
                    onClear={handleFilterClear}
                />

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
                    Visible={inventoryItemDatas.size() > 0}
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

                    {/* Render inventory items */}
                    {inventoryItemDatas.map((itemData) => (
                        <InventoryItemSlot
                            key={itemData.item.id}
                            item={itemData.item}
                            amount={itemData.amount}
                            layoutOrder={-itemData.layoutOrder}
                            visible={itemData.visible}
                            onActivated={() => handleItemActivated(itemData.item)}
                        />
                    ))}
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
