/**
 * @fileoverview Main inventory window React component
 *
 * Modern React implementation of the inventory window using BasicWindow.
 * Follows the same pattern as QuestWindow for consistency.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import BuildManager from "client/components/build/BuildManager";
import InventoryEmptyState from "client/components/item/inventory/InventoryEmptyState";
import InventoryFilter, {
    filterItems,
    ItemFilterData,
    TRAIT_OPTIONS,
    useBasicInventoryFilter,
} from "client/components/item/inventory/InventoryFilter";
import {
    createInventorySlot,
    updateInventorySlot,
    type InventorySlotHandle,
} from "client/components/item/inventory/InventorySlot";
import useSingleDocument from "client/components/sidebar/useSingleDocumentWindow";
import { showErrorToast } from "client/components/toast/ToastService";
import BasicWindow from "client/components/window/BasicWindow";
import useProperty from "client/hooks/useProperty";
import { getAsset } from "shared/asset/AssetMap";
import { playSound } from "shared/asset/GameAssets";
import simpleProfile from "shared/hamster/simpleProfile";
import type Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

/**
 * Calculate optimal cell count for the inventory grid.
 */
function calculateOptimalCellCount(containerX: number): number {
    return math.max(math.round((containerX - 50) / 65), 3);
}

type InventorySlotData = ItemFilterData & {
    amount?: number;
    uuid?: string;
};

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
 * Handle item activation for placement in the game world.
 * This method encapsulates the business logic for item placement.
 *
 * @param item The item to activate/place
 * @returns True if the item was successfully activated, false otherwise
 */
export function activateItem(item: Item): boolean {
    const isPlaceable = item.placeableAreas.size() > 0 || item.bounds !== undefined;
    const level = Packets.level.get() ?? 0;

    // Check restrictions
    if (BuildManager.getRestricted() === true || BuildManager.hasSelection() === true || isPlaceable === false) {
        playSound("Error.mp3");
        showErrorToast("Can't place that item right now.");
        return false;
    }

    if (item.levelReq !== undefined && item.levelReq > level) {
        playSound("Error.mp3");
        showErrorToast(`You need to be Lv. ${item.levelReq} to place that item.`);
        return false;
    }

    playSound("MenuClick.mp3");

    // Find best unique instance if applicable
    let bestUuid: string | undefined;
    if (Items.uniqueItems.has(item)) {
        bestUuid = getBestUniqueInstances(Packets.uniqueInstances.get() ?? new Map()).get(item.id);
    }

    // Add placing model and select it
    BuildManager.mainSelect(
        BuildManager.addPlacingModel({
            item: item.id,
            uniqueItemId: bestUuid,
            posX: 0,
            posY: 0,
            posZ: 0,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
        }),
    );

    return true;
}

const NON_GEAR_ITEMS = Items.sortedItems.filter((item) => !item.findTrait("Gear"));
const NON_GEAR_ITEMS_SET = new Set(NON_GEAR_ITEMS);

/**
 * Main inventory window component following the QuestWindow pattern
 */
export default function InventoryWindow() {
    const { id, visible, closeDocument } = useSingleDocument({ id: "Inventory" });
    const { searchQuery, props: filterProps } = useBasicInventoryFilter();
    const [cellSize, setCellSize] = useState(new UDim2(0, 65, 0, 65));
    const cellSizeRef = useRef(cellSize);
    useEffect(() => {
        cellSizeRef.current = cellSize;
    }, [cellSize]);

    // Refs for filter animation
    const searchBoxRef = useRef<TextBox>();
    const filterFrameRef = useRef<Frame>();
    const filterButtonRefs = useRef(new Map<string, ImageButton>());
    const [previousVisible, setPreviousVisible] = useState(visible);

    // Observe inventory data from packets
    const inventory = useProperty(Packets.inventory) ?? new Map<string, number>();
    const uniqueInstances = useProperty(Packets.uniqueInstances) ?? new Map<string, UniqueItemInstance>();

    const scrollingFrameRef = useRef<ScrollingFrame>();
    const itemSlotsRef = useRef(new Map<string, InventorySlotHandle>());

    // Cascading animation for filter elements
    useEffect(() => {
        const action = visible && !previousVisible ? "open" : !visible && previousVisible ? "close" : undefined;
        if (action) {
            const searchBox = searchBoxRef.current;
            const filterButtons = filterButtonRefs.current;

            if (action === "open") {
                // Animate search box first
                if (searchBox) {
                    searchBox.Rotation = -3;
                    const searchTween = TweenService.Create(
                        searchBox,
                        new TweenInfo(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
                        { Rotation: 0 },
                    );
                    searchTween.Play();
                }

                // Animate each filter button individually with cascading delays
                task.spawn(() => {
                    for (let index = 0; index < TRAIT_OPTIONS.size(); index++) {
                        const trait = TRAIT_OPTIONS[index];
                        const button = filterButtons.get(trait.id);
                        if (button) {
                            button.Position = new UDim2(0.5, 0, 0.5, -8);
                            const buttonTween = TweenService.Create(
                                button,
                                new TweenInfo(0.35 + index * 0.04, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
                                { Position: new UDim2(0.5, 0, 0.5, 0) },
                            );
                            buttonTween.Play();
                        }
                    }
                });
            } else {
                // Reset rotation on close
                if (searchBox) {
                    const searchTween = TweenService.Create(searchBox, new TweenInfo(0.1, Enum.EasingStyle.Linear), {
                        Rotation: -3,
                    });
                    searchTween.Play();
                }
            }
        }
        setPreviousVisible(visible);
    }, [visible]);

    // Handle item activation
    const handleItemActivated = useCallback(
        (item: Item) => {
            const success = activateItem(item);
            if (success) {
                closeDocument();
            }
        },
        [closeDocument],
    );
    const handleItemActivatedRef = useRef(handleItemActivated);
    useEffect(() => {
        handleItemActivatedRef.current = handleItemActivated;
    }, [handleItemActivated]);

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
        const amountsPerItem = new Map<string, number>();
        for (const [itemId, amount] of inventory) {
            amountsPerItem.set(itemId, amount);
        }
        for (const [, uniqueInstance] of uniqueInstances) {
            const itemId = uniqueInstance.baseItemId;
            if (uniqueInstance.placed) continue; // Skip placed instances
            amountsPerItem.set(itemId, (amountsPerItem.get(itemId) ?? 0) + 1);
        }

        const dataPerItem: Map<string, InventorySlotData> = filterItems(
            NON_GEAR_ITEMS_SET,
            searchQuery,
            filterProps.traitFilters,
        );

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
        return dataPerItem;
    }, [inventory, uniqueInstances, searchQuery, filterProps.traitFilters]);

    useEffect(() => {
        const frame = scrollingFrameRef.current;
        if (!frame) return;

        const slots = itemSlotsRef.current;
        for (const item of NON_GEAR_ITEMS) {
            if (slots.has(item.id)) continue;

            const slot = createInventorySlot(item, {
                parent: frame,
                size: cellSizeRef.current,
                layoutOrder: item.layoutOrder,
                visible: false,
                onActivated: () => handleItemActivatedRef.current(item),
            });
            slots.set(item.id, slot);
        }

        return () => {
            const slots = itemSlotsRef.current;
            for (const [, slot] of slots) {
                slot.destroy();
            }
            slots.clear();
        };
    }, []);

    useEffect(() => {
        const slots = itemSlotsRef.current;
        for (const [, slot] of slots) {
            updateInventorySlot(slot, { size: cellSize });
        }
    }, [cellSize]);

    useEffect(() => {
        const slots = itemSlotsRef.current;

        for (const item of NON_GEAR_ITEMS) {
            const slot = slots.get(item.id);
            if (slot === undefined) continue;

            const slotData = dataPerItem.get(item.id);
            const layoutOrder = slotData === undefined ? item.layoutOrder : -slotData.layoutOrder;
            updateInventorySlot(slot, {
                layoutOrder,
                visible: slotData?.visible === true,
                amount: slotData?.amount ?? 0,
                uuid: slotData?.uuid,
            });
        }
    }, [dataPerItem]);

    // Check if user has any items at all (for empty state)
    let hasAnyItems = false;
    for (const [, { amount }] of dataPerItem) {
        if (amount !== undefined && amount > 0) {
            hasAnyItems = true;
            break;
        }
    }
    const isEmpty = !hasAnyItems; // Only show empty state if user has no items at all
    return (
        <BasicWindow
            icon={getAsset("assets/Inventory.png")}
            id={id}
            backgroundColor={
                new ColorSequence([
                    new ColorSequenceKeypoint(0, Color3.fromRGB(69, 51, 36)),
                    new ColorSequenceKeypoint(1, Color3.fromRGB(56, 28, 28)),
                ])
            }
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
                <InventoryFilter
                    {...filterProps}
                    searchBoxRef={searchBoxRef}
                    filterFrameRef={filterFrameRef}
                    filterButtonRefs={filterButtonRefs}
                />

                {/* Item list container */}
                <scrollingframe
                    ref={scrollingFrameRef}
                    AnchorPoint={new Vector2(0.5, 0)}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    BorderSizePixel={0}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    LayoutOrder={1}
                    Position={new UDim2(0.5, 0, 0, 0)}
                    ScrollBarThickness={12}
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
                    {/* Item slots are managed imperatively via createInventorySlot */}
                </scrollingframe>

                {/* Layout for filter and item list */}
                <uilistlayout
                    HorizontalAlignment={Enum.HorizontalAlignment.Center}
                    Padding={new UDim(0, 8)}
                    SortOrder={Enum.SortOrder.LayoutOrder}
                />
            </frame>
        </BasicWindow>
    );
}
