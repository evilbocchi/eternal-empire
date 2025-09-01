/**
 * @fileoverview Main inventory window React component
 * 
 * Displays the inventory with item grid, filtering, and empty state.
 * Uses BasicWindow for consistent styling with other windows.
 */

import React from "@rbxts/react";
import type Item from "shared/item/Item";
import { getAsset } from "shared/asset/AssetMap";
import BasicWindow from "shared/ui/components/window/BasicWindow";
import InventoryEmptyState from "shared/ui/components/inventory/InventoryEmptyState";
import InventoryFilter from "shared/ui/components/inventory/InventoryFilter";
import InventoryItemSlot from "shared/ui/components/inventory/InventoryItemSlot";

export interface InventoryItemData {
    item: Item;
    amount: number;
    hasItem: boolean;
    visible: boolean;
}

export interface TraitFilterOption {
    id: string;
    image: string;
    color: Color3;
    selected: boolean;
}

export interface InventoryWindowState {
    /** Whether the inventory window is visible */
    visible: boolean;
    /** Whether the inventory is empty */
    isEmpty: boolean;
    /** Current search query */
    searchQuery: string;
    /** Available trait filter options */
    traitOptions: TraitFilterOption[];
    /** Items to display in the inventory */
    items: InventoryItemData[];
    /** Grid cell size for layout */
    cellSize: UDim2;
}

export interface InventoryWindowCallbacks {
    /** Called when window is closed */
    onClose: () => void;
    /** Called when search query changes */
    onSearchChange: (query: string) => void;
    /** Called when trait filter is toggled */
    onTraitToggle: (traitId: string) => void;
    /** Called when filter clear button is pressed */
    onFilterClear: () => void;
    /** Called when an item is activated */
    onItemActivated: (item: Item) => void;
    /** Called to get tooltip ref for an item */
    getItemTooltipRef: (item: Item) => React.Ref<TextButton>;
}

interface InventoryWindowProps {
    /** Current inventory state */
    state: InventoryWindowState;
    /** Event callbacks */
    callbacks: InventoryWindowCallbacks;
}

/**
 * Main inventory window component
 */
export default function InventoryWindow({ state, callbacks }: InventoryWindowProps) {
    const { 
        visible, 
        isEmpty, 
        searchQuery, 
        traitOptions, 
        items, 
        cellSize 
    } = state;
    
    const { 
        onClose, 
        onSearchChange, 
        onTraitToggle, 
        onFilterClear, 
        onItemActivated,
        getItemTooltipRef
    } = callbacks;

    // Color sequence for inventory window border
    const colorSequence = new ColorSequence([
        new ColorSequenceKeypoint(0, Color3.fromRGB(255, 186, 125)),
        new ColorSequenceKeypoint(1, Color3.fromRGB(255, 123, 123))
    ]);

    return (
        <BasicWindow
            visible={visible}
            icon={getAsset("assets/Inventory.png")}
            title="Inventory"
            colorSequence={colorSequence}
            onClose={onClose}
        >
            {/* Empty state */}
            <InventoryEmptyState visible={isEmpty} />

            {/* Main inventory content */}
            <frame 
                BackgroundTransparency={1} 
                Size={new UDim2(1, 0, 1, 0)}
                Visible={!isEmpty}
            >
                {/* Filter options */}
                <InventoryFilter
                    searchQuery={searchQuery}
                    traitOptions={traitOptions}
                    onSearchChange={onSearchChange}
                    onTraitToggle={onTraitToggle}
                    onClear={onFilterClear}
                />

                {/* Item list container */}
                <scrollingframe
                    AnchorPoint={new Vector2(0.5, 0)}
                    AutomaticCanvasSize={Enum.AutomaticSize.Y}
                    BackgroundTransparency={1}
                    CanvasSize={new UDim2(0, 0, 0, 0)}
                    LayoutOrder={1}
                    Position={new UDim2(0.5, 0, 0, 0)}
                    ScrollBarThickness={6}
                    Selectable={false}
                    Size={new UDim2(1, 0, 0.975, -20)}
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
                    {items.map((itemData) => (
                        <InventoryItemSlot
                            key={itemData.item.id}
                            item={itemData.item}
                            amount={itemData.amount}
                            hasItem={itemData.hasItem}
                            layoutOrder={-itemData.item.layoutOrder}
                            visible={itemData.visible}
                            onActivated={() => onItemActivated(itemData.item)}
                            ref={getItemTooltipRef(itemData.item)}
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
        </BasicWindow>
    );
}