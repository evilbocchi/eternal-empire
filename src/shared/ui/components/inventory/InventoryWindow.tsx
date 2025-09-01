/**
 * @fileoverview Main inventory window React component
 * 
 * Modern React implementation of the inventory window using BasicWindow.
 * Follows the same pattern as QuestWindow for consistency.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import { getAsset } from "shared/asset/AssetMap";
import type Item from "shared/item/Item";
import type InventoryController from "client/controllers/interface/InventoryController";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import BasicWindow from "shared/ui/components/window/BasicWindow";
import InventoryEmptyState from "shared/ui/components/inventory/InventoryEmptyState";
import InventoryFilter from "shared/ui/components/inventory/InventoryFilter";
import InventoryItemSlot from "shared/ui/components/inventory/InventoryItemSlot";
import useProperty from "shared/ui/hooks/useProperty";

interface TraitFilterOption {
    id: string;
    image: string;
    color: Color3;
    selected: boolean;
}

interface InventoryItemData {
    item: Item;
    amount: number;
    hasItem: boolean;
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

/**
 * Main inventory window component following the QuestWindow pattern
 */
export default function InventoryWindow({ visible, onClose, inventoryController }: InventoryWindowProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [traitFilters, setTraitFilters] = useState<Record<string, boolean>>({});
    const [cellSize, setCellSize] = useState(new UDim2(0, 65, 0, 65));
    
    // Observe inventory data from packets
    const inventory = useProperty(Packets.inventory);
    const uniqueInstances = useProperty(Packets.uniqueInstances);
    const level = useProperty(Packets.level) ?? 0;
    
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

    // Calculate inventory items
    const inventoryItems = useMemo((): InventoryItemData[] => {
        const items: InventoryItemData[] = [];
        const amounts = new Map<string, number>();
        
        // Count unique instances
        if (uniqueInstances) {
            for (const [_, uniqueInstance] of uniqueInstances) {
                const itemId = uniqueInstance.baseItemId;
                if (itemId && !uniqueInstance.placed) {
                    const amount = amounts.get(itemId) ?? 0;
                    amounts.set(itemId, amount + 1);
                }
            }
        }
        
        // Build item data
        for (const [_id, item] of Items.itemsPerId) {
            if (item.isA("HarvestingTool")) continue;
            
            const itemId = item.id;
            let amount = inventory?.get(itemId) ?? 0;
            const uniques = amounts.get(itemId);
            if (uniques) {
                amount += uniques;
            }
            
            const hasItem = amount > 0;
            
            items.push({
                item,
                amount,
                hasItem,
                visible: hasItem // Initial visibility based on having the item
            });
        }
        
        return items;
    }, [inventory, uniqueInstances]);

    // Apply filtering
    const filteredItems = useMemo(() => {
        let filtered = inventoryItems.filter(itemData => itemData.hasItem);
        
        // Filter by search query
        if (searchQuery && searchQuery !== "") {
            const lowerQuery = string.lower(searchQuery);
            filtered = filtered.filter(itemData => {
                const nameMatch = string.find(string.lower(itemData.item.name), lowerQuery, 1, true);
                const idMatch = string.find(string.lower(itemData.item.id), lowerQuery, 1, true);
                return nameMatch !== undefined || idMatch !== undefined;
            });
        }
        
        // Filter by traits
        const activeTraits: string[] = [];
        for (const [trait, enabled] of pairs(traitFilters)) {
            if (enabled) {
                activeTraits.push(trait);
            }
        }
        
        if (activeTraits.size() > 0) {
            filtered = filtered.filter(itemData => {
                return activeTraits.some(trait => itemData.item.isA(trait as keyof ItemTraits));
            });
        }
        
        return filtered.map(itemData => ({
            ...itemData,
            visible: true
        }));
    }, [inventoryItems, searchQuery, traitFilters]);

    const isEmpty = filteredItems.size() === 0;

    // Build trait filter options
    const traitOptions: TraitFilterOption[] = [
        { id: "Dropper", image: "rbxassetid://83949759663146", color: Color3.fromRGB(255, 92, 92), selected: traitFilters.Dropper ?? false },
        { id: "Furnace", image: "rbxassetid://71820860315442", color: Color3.fromRGB(255, 155, 74), selected: traitFilters.Furnace ?? false },
        { id: "Upgrader", image: "rbxassetid://139557708725255", color: Color3.fromRGB(245, 255, 58), selected: traitFilters.Upgrader ?? false },
        { id: "Conveyor", image: "rbxassetid://125924824081942", color: Color3.fromRGB(131, 255, 78), selected: traitFilters.Conveyor ?? false },
        { id: "Generator", image: "rbxassetid://120594818359262", color: Color3.fromRGB(60, 171, 255), selected: traitFilters.Generator ?? false },
        { id: "Charger", image: "rbxassetid://78469928600985", color: Color3.fromRGB(255, 170, 255), selected: traitFilters.Charger ?? false },
        { id: "Miscellaneous", image: "rbxassetid://83704048628923", color: Color3.fromRGB(170, 85, 255), selected: traitFilters.Miscellaneous ?? false }
    ];

    // Handle search change
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    // Handle trait filter toggle
    const handleTraitToggle = useCallback((traitId: string) => {
        setTraitFilters(prev => ({
            ...prev,
            [traitId]: !prev[traitId]
        }));
    }, []);

    // Handle filter clear
    const handleFilterClear = useCallback(() => {
        setSearchQuery("");
        setTraitFilters({});
    }, []);

    // Handle item activation
    const handleItemActivated = useCallback((item: Item) => {
        if (!inventoryController) return;
        
        // Use the controller's activation logic
        const success = inventoryController.activateItem(item);
        
        // Close the inventory window if activation was successful
        if (success) {
            onClose();
        }
    }, [inventoryController, onClose]);

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
                    {filteredItems.map((itemData) => (
                        <InventoryItemSlot
                            key={itemData.item.id}
                            item={itemData.item}
                            amount={itemData.amount}
                            hasItem={itemData.hasItem}
                            layoutOrder={-itemData.item.layoutOrder}
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
        </BasicWindow>
    );
}