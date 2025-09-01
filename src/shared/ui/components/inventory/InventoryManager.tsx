/**
 * @fileoverview Inventory system manager component
 * 
 * High-level manager that bridges inventory controller logic with the new React UI.
 * Manages state synchronization and provides callbacks for inventory operations.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "@rbxts/react";
import type InventoryController from "client/controllers/interface/InventoryController";
import type BuildController from "client/controllers/gameplay/BuildController";
import type AdaptiveTabController from "client/controllers/core/AdaptiveTabController";
import type Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import { playSound } from "shared/asset/GameAssets";
import InventoryWindow, { 
    InventoryWindowState, 
    InventoryWindowCallbacks, 
    InventoryItemData, 
    TraitFilterOption 
} from "shared/ui/components/inventory/InventoryWindow";
import useProperty from "shared/ui/hooks/useProperty";

interface InventoryManagerProps {
    /** Inventory controller instance */
    inventoryController?: InventoryController;
    /** Build controller instance */
    buildController?: BuildController;
    /** Adaptive tab controller instance */
    adaptiveTabController?: AdaptiveTabController;
    /** Whether the inventory window is visible */
    visible: boolean;
    /** Callback when window should be closed */
    onClose: () => void;
}

/**
 * High-level inventory manager component that handles UI state and coordinates with inventory logic.
 * This component should be integrated into your main UI controller.
 */
export default function InventoryManager({
    inventoryController,
    buildController,
    adaptiveTabController,
    visible,
    onClose
}: InventoryManagerProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [traitFilters, setTraitFilters] = useState<Record<string, boolean>>({});
    const [cellSize, setCellSize] = useState(new UDim2(0, 65, 0, 65));
    
    // Observe inventory data from packets
    const inventory = useProperty(Packets.inventory);
    const uniqueInstances = useProperty(Packets.uniqueInstances);
    
    // Refs for tooltip integration
    const itemTooltipRefs = useRef(new Map<string, React.Ref<TextButton>>());

    // Calculate inventory state
    const inventoryState = useMemo((): InventoryWindowState => {
        if (!inventoryController) {
            return {
                visible,
                isEmpty: true,
                searchQuery,
                traitOptions: [],
                items: [],
                cellSize
            };
        }

        // Get items from controller
        const items = inventoryController.items;
        const isEmpty = items.size() === 0;

        // Build item data array
        const itemData: InventoryItemData[] = [];
        for (const item of items) {
            const itemSlot = inventoryController.itemSlotsPerItem.get(item);
            if (!itemSlot) continue;

            const itemId = item.id;
            let amount = inventory?.get(itemId) ?? 0;
            
            // Add unique instances count
            if (uniqueInstances) {
                let uniqueCount = 0;
                for (const [_, uniqueInstance] of uniqueInstances) {
                    if (uniqueInstance.baseItemId === itemId && !uniqueInstance.placed) {
                        uniqueCount++;
                    }
                }
                amount += uniqueCount;
            }

            const hasItem = amount > 0;
            // In React mode, use our own visibility logic
            let visible: boolean;
            if (inventoryController.isReactMode()) {
                // In React mode, check if the slot has our custom visibility property
                const extendedSlot = itemSlot as ItemSlot & { ReactVisible?: boolean };
                visible = extendedSlot.ReactVisible ?? hasItem;
            } else {
                visible = itemSlot.Visible;
            }

            itemData.push({
                item,
                amount,
                hasItem,
                visible
            });
        }

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

        return {
            visible,
            isEmpty,
            searchQuery,
            traitOptions,
            items: itemData,
            cellSize
        };
    }, [inventoryController, visible, inventory, uniqueInstances, searchQuery, traitFilters, cellSize]);

    // Sync with inventory controller when search or filters change
    useEffect(() => {
        if (inventoryController) {
            // Apply filtering through a custom React-compatible filter function
            const visibleItems = new Set<Item>();
            
            // Filter by search query
            let filteredItems = inventoryController.items;
            if (searchQuery !== "" && searchQuery !== undefined) {
                const lowerQuery = string.lower(searchQuery);
                filteredItems = filteredItems.filter(item => {
                    const nameMatch = string.find(string.lower(item.name), lowerQuery, 1, true);
                    const idMatch = string.find(string.lower(item.id), lowerQuery, 1, true);
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
                filteredItems = filteredItems.filter(item => {
                    return activeTraits.some(trait => item.isA(trait as keyof ItemTraits));
                });
            }
            
            // Update visibility of items
            for (const item of filteredItems) {
                visibleItems.add(item);
            }
            
            // Update the itemSlots visibility for compatibility
            for (const [item, itemSlot] of inventoryController.itemSlotsPerItem) {
                if (!inventoryController.isReactMode()) continue;
                
                const shouldBeVisible = visibleItems.has(item);
                const extendedSlot = itemSlot as ItemSlot & { ReactVisible?: boolean };
                extendedSlot.ReactVisible = shouldBeVisible;
            }
        }
    }, [inventoryController, searchQuery, traitFilters]);

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
        if (!inventoryController || !buildController || !adaptiveTabController) return;

        // Delegate to controller's existing item activation logic
        // This mimics the logic from InventoryController.loadItemSlots()
        const isPlaceable = item.placeableAreas.size() > 0 || item.bounds !== undefined;
        const level = Packets.level.get() ?? 0;
        
        if (buildController.getRestricted() === true || 
            isPlaceable === false || 
            (item.levelReq !== undefined && item.levelReq > level)) {
            playSound("Error.mp3");
            return;
        }
        
        // Close the inventory window (hide adaptive tab)
        adaptiveTabController.hideAdaptiveTab();
        playSound("MenuClick.mp3");
        
        let bestUuid: string | undefined;
        if (Items.uniqueItems.has(item)) {
            bestUuid = inventoryController.getBest(item.id);
        }
        
        // Add placing model and select it
        buildController.mainSelect(
            buildController.addPlacingModel(item, bestUuid)
        );
    }, [inventoryController, buildController, adaptiveTabController]);

    // Get tooltip ref for an item
    const getItemTooltipRef = useCallback((item: Item): React.Ref<TextButton> => {
        const itemId = item.id;
        if (!itemTooltipRefs.current.has(itemId)) {
            itemTooltipRefs.current.set(itemId, React.createRef<TextButton>());
        }
        return itemTooltipRefs.current.get(itemId)!;
    }, []);

    // Callback handlers for inventory window
    const callbacks: InventoryWindowCallbacks = {
        onClose,
        onSearchChange: handleSearchChange,
        onTraitToggle: handleTraitToggle,
        onFilterClear: handleFilterClear,
        onItemActivated: handleItemActivated,
        getItemTooltipRef
    };

    return (
        <InventoryWindow
            state={inventoryState}
            callbacks={callbacks}
        />
    );
}