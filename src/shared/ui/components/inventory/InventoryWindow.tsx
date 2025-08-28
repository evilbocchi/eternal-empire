/**
 * @fileoverview React component for the inventory window.
 * 
 * Replaces the traditional Flamework controller-based inventory UI with a modern
 * React component that integrates with the existing tooltip and state management systems.
 */

import React, { useCallback, useEffect, useMemo, useState } from "@rbxts/react";
import type BuildController from "client/controllers/gameplay/BuildController";
import type InventoryController from "client/controllers/interface/InventoryController";
import type Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import ItemSlot from "shared/ui/components/tooltip/ItemSlot";
import { useItemTooltip } from "shared/ui/components/tooltip/useTooltipProps";
import WindowTitle from "shared/ui/components/window/WindowTitle";

interface InventoryWindowProps {
    /** Whether the inventory window is visible */
    visible: boolean;
    /** Callback when inventory window visibility changes */
    onVisibilityChange?: (visible: boolean) => void;
    /** Build controller for item placement */
    buildController?: BuildController;
    /** Inventory controller for item handling */
    inventoryController?: InventoryController;
}

interface InventoryState {
    inventory: Map<string, number>;
    uniqueInstances: Map<string, UniqueItemInstance>;
}

const FILTERABLE_TRAITS = {
    Dropper: false,
    Furnace: false,
    Upgrader: false,
    Conveyor: false,
    Generator: false,
    Charger: false,
    Miscellaneous: false,
} as const;

type TraitFilterId = keyof typeof FILTERABLE_TRAITS;

export default function InventoryWindow({ 
    visible, 
    onVisibilityChange,
    buildController,
    inventoryController
}: InventoryWindowProps): React.Element | undefined {
    const [inventoryState, setInventoryState] = useState<InventoryState>({
        inventory: Packets.inventory.get() ?? new Map(),
        uniqueInstances: Packets.uniqueInstances.get() ?? new Map(),
    });
    
    const [searchQuery, setSearchQuery] = useState("");
    const [whitelistedTraits, setWhitelistedTraits] = useState<{ [K in TraitFilterId]: boolean }>({ ...FILTERABLE_TRAITS });

    // Observe inventory state changes
    useEffect(() => {
        const inventoryConnection = Packets.inventory.observe((inventory) => {
            setInventoryState(prev => ({ ...prev, inventory: inventory ?? new Map() }));
        });

        const uniqueInstancesConnection = Packets.uniqueInstances.observe((uniqueInstances) => {
            setInventoryState(prev => ({ ...prev, uniqueInstances: uniqueInstances ?? new Map() }));
        });

        return () => {
            inventoryConnection.Disconnect();
            uniqueInstancesConnection.Disconnect();
        };
    }, []);

    // Calculate item amounts including unique instances
    const itemAmounts = useMemo(() => {
        const amounts = new Map<string, number>();
        const { inventory, uniqueInstances } = inventoryState;

        // Add regular inventory amounts
        for (const [itemId, amount] of inventory) {
            amounts.set(itemId, amount);
        }

        // Add unique instance amounts
        for (const [_, uniqueInstance] of uniqueInstances) {
            const itemId = uniqueInstance.baseItemId;
            if (itemId !== undefined && !uniqueInstance.placed) {
                const currentAmount = amounts.get(itemId) ?? 0;
                amounts.set(itemId, currentAmount + 1);
            }
        }

        return amounts;
    }, [inventoryState]);

    // Filter and sort items
    const filteredItems = useMemo(() => {
        // Get items with positive amounts
        const itemsWithAmounts = new Array<{ item: Item; amount: number }>();
        
        for (const [_, item] of Items.itemsPerId) {
            if (item.isA("HarvestingTool")) continue;
            
            const amount = itemAmounts.get(item.id) ?? 0;
            if (amount > 0) {
                itemsWithAmounts.push({ item, amount });
            }
        }

        // Apply trait filtering
        let filtered = itemsWithAmounts;
        const traitValues = [];
        for (const [_, enabled] of pairs(whitelistedTraits)) {
            traitValues.push(enabled);
        }
        const hasActiveTraitFilter = traitValues.some(enabled => enabled);
        
        if (hasActiveTraitFilter) {
            filtered = filtered.filter(({ item }) => {
                // Check if item has any of the whitelisted traits
                for (const [trait, enabled] of pairs(whitelistedTraits)) {
                    if (enabled) {
                        // Check if item has this trait - need to check item properties
                        // This is simplified - you may need to adjust based on actual trait system
                        if (trait === "Miscellaneous") {
                            return true; // For now, include miscellaneous items
                        }
                        // Add proper trait checking logic here based on your item system
                    }
                }
                return whitelistedTraits.Miscellaneous;
            });
        }

        // Apply search filtering
        if (searchQuery !== "" && searchQuery.size() > 0) {
            const query = string.lower(searchQuery);
            filtered = filtered.filter(({ item }) => 
                string.find(string.lower(item.name), query) !== undefined
            );
        }

        // Sort by layout order
        table.sort(filtered, (a, b) => (a.item.layoutOrder ?? 0) < (b.item.layoutOrder ?? 0));

        return filtered;
    }, [itemAmounts, whitelistedTraits, searchQuery]);

    const handleTraitToggle = useCallback((trait: TraitFilterId) => {
        setWhitelistedTraits(prev => ({
            ...prev,
            [trait]: !prev[trait]
        }));
    }, []);

    const isEmpty = filteredItems.size() === 0;

    if (!visible) {
        return undefined;
    }

    return (
        <frame
            key="InventoryWindow"
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundColor3={Color3.fromRGB(50, 50, 50)}
            BorderSizePixel={0}
            Position={new UDim2(0.5, 0, 0.5, 0)}
            Size={new UDim2(0, 800, 0, 600)}
        >
            {/* Window Title */}
            <WindowTitle 
                icon="rbxassetid://4576475446" 
                title="Inventory" 
            />

            {/* Close Button */}
            <textbutton
                key="CloseButton"
                AnchorPoint={new Vector2(1, 0)}
                BackgroundColor3={Color3.fromRGB(200, 50, 50)}
                Position={new UDim2(1, -10, 0, 10)}
                Size={new UDim2(0, 30, 0, 30)}
                Text="X"
                TextColor3={Color3.fromRGB(255, 255, 255)}
                TextScaled={true}
                Event={{
                    Activated: () => onVisibilityChange?.(false)
                }}
            />

            {/* Main Content */}
            <frame
                key="MainContent"
                BackgroundTransparency={1}
                Position={new UDim2(0, 10, 0, 50)}
                Size={new UDim2(1, -20, 1, -60)}
            >
                {/* Filter Options */}
                <frame
                    key="FilterOptions"
                    BackgroundTransparency={1}
                    Size={new UDim2(1, 0, 0, 50)}
                >
                    {/* Search Box */}
                    <textbox
                        key="SearchBox"
                        BackgroundColor3={Color3.fromRGB(70, 70, 70)}
                        BorderSizePixel={1}
                        BorderColor3={Color3.fromRGB(100, 100, 100)}
                        Position={new UDim2(0, 0, 0, 0)}
                        Size={new UDim2(0.3, 0, 1, 0)}
                        PlaceholderText="Search items..."
                        Text={searchQuery}
                        TextColor3={Color3.fromRGB(255, 255, 255)}
                        TextScaled={true}
                        Event={{
                            FocusLost: (rbx: TextBox) => {
                                if (rbx.Text !== searchQuery) {
                                    setSearchQuery(rbx.Text);
                                }
                            }
                        }}
                    />

                    {/* Trait Filter Buttons */}
                    <frame
                        key="TraitButtons"
                        BackgroundTransparency={1}
                        Position={new UDim2(0.35, 0, 0, 0)}
                        Size={new UDim2(0.65, 0, 1, 0)}
                    >
                        <uilistlayout
                            FillDirection={Enum.FillDirection.Horizontal}
                            Padding={new UDim(0, 5)}
                            SortOrder={Enum.SortOrder.LayoutOrder}
                        />
                        {(function() {
                            const traitKeys: TraitFilterId[] = [];
                            for (const [key, _] of pairs(FILTERABLE_TRAITS)) {
                                traitKeys.push(key);
                            }
                            return traitKeys;
                        })().map((trait, index) => (
                            <textbutton
                                key={trait}
                                BackgroundColor3={whitelistedTraits[trait] ? 
                                    Color3.fromRGB(100, 150, 100) : 
                                    Color3.fromRGB(70, 70, 70)
                                }
                                BorderSizePixel={1}
                                BorderColor3={Color3.fromRGB(100, 100, 100)}
                                LayoutOrder={index}
                                Size={new UDim2(0, 80, 1, 0)}
                                Text={trait}
                                TextColor3={Color3.fromRGB(255, 255, 255)}
                                TextScaled={true}
                                Event={{
                                    Activated: () => handleTraitToggle(trait)
                                }}
                            />
                        ))}
                    </frame>
                </frame>

                {/* Item Grid */}
                <scrollingframe
                    key="ItemList"
                    BackgroundColor3={Color3.fromRGB(40, 40, 40)}
                    BorderSizePixel={1}
                    BorderColor3={Color3.fromRGB(100, 100, 100)}
                    Position={new UDim2(0, 0, 0, 60)}
                    Size={new UDim2(1, 0, 1, -60)}
                    ScrollBarThickness={10}
                    ScrollBarImageColor3={Color3.fromRGB(100, 100, 100)}
                    CanvasSize={new UDim2(0, 0, 0, math.ceil(filteredItems.size() / 8) * 110)}
                >
                    <uigridlayout
                        CellSize={new UDim2(0, 100, 0, 100)}
                        CellPadding={new UDim2(0, 10, 0, 10)}
                        FillDirection={Enum.FillDirection.Horizontal}
                        HorizontalAlignment={Enum.HorizontalAlignment.Left}
                        SortOrder={Enum.SortOrder.LayoutOrder}
                    />
                    <uipadding
                        PaddingTop={new UDim(0, 10)}
                        PaddingBottom={new UDim(0, 10)}
                        PaddingLeft={new UDim(0, 10)}
                        PaddingRight={new UDim(0, 10)}
                    />

                    {/* Item Slots */}
                    {(() => {
                        const slots = [];
                        for (let i = 0; i < filteredItems.size(); i++) {
                            const itemData = filteredItems[i];
                            if (itemData) {
                                slots.push(
                                    <InventoryItemSlot
                                        key={`${itemData.item.id}-${i}`}
                                        item={itemData.item}
                                        amount={itemData.amount}
                                        layoutOrder={i}
                                        buildController={buildController}
                                        inventoryController={inventoryController}
                                        inventoryState={inventoryState}
                                    />
                                );
                            }
                        }
                        return slots;
                    })()}
                </scrollingframe>

                {/* Empty State */}
                {isEmpty && (
                    <frame
                        key="EmptyState"
                        BackgroundTransparency={1}
                        Position={new UDim2(0, 0, 0.5, 0)}
                        Size={new UDim2(1, 0, 0, 100)}
                        AnchorPoint={new Vector2(0, 0.5)}
                    >
                        <textlabel
                            BackgroundTransparency={1}
                            Size={new UDim2(1, 0, 1, 0)}
                            Text="No items found"
                            TextColor3={Color3.fromRGB(150, 150, 150)}
                            TextScaled={true}
                            Font={Enum.Font.SourceSans}
                        />
                    </frame>
                )}
            </frame>
        </frame>
    );
}

interface InventoryItemSlotProps {
    item: Item;
    amount: number;
    layoutOrder: number;
    buildController?: BuildController;
    inventoryController?: InventoryController;
    inventoryState: InventoryState;
}

function InventoryItemSlot({ 
    item, 
    amount, 
    layoutOrder, 
    buildController, 
    inventoryController,
    inventoryState 
}: InventoryItemSlotProps) {
    const getBestUniqueInstance = useCallback((baseItemId: string): string | undefined => {
        // Use inventory controller's method if available
        if (inventoryController) {
            return inventoryController.getBest(baseItemId);
        }
        
        // Fallback to inline implementation
        const { uniqueInstances } = inventoryState;
        let bestUuid: string | undefined;
        let bestInstance: UniqueItemInstance | undefined;
        
        for (const [uuid, instance] of uniqueInstances) {
            if (instance.placed || instance.baseItemId !== baseItemId) continue;
            
            let thisPots = 0;
            for (const [_, potValue] of instance.pots) {
                thisPots += potValue;
            }

            let otherPots = 0;
            if (bestInstance) {
                for (const [_, potValue] of bestInstance.pots) {
                    otherPots += potValue;
                }
            }

            if (thisPots > otherPots) {
                bestInstance = instance;
                bestUuid = uuid;
            }
        }
        
        return bestUuid;
    }, [inventoryState, inventoryController]);

    const bestUuid = useMemo(() => {
        return Items.uniqueItems.has(item) ? getBestUniqueInstance(item.id) : undefined;
    }, [item, getBestUniqueInstance]);

    const tooltipProps = useItemTooltip(item, bestUuid);

    const handleClick = useCallback(() => {
        // Use inventory controller if available, otherwise fallback to direct build controller
        if (inventoryController) {
            inventoryController.handleItemClick(item);
        } else if (buildController) {
            const isPlaceable = item.placeableAreas.size() > 0 || item.bounds !== undefined;
            const level = Packets.level.get() ?? 0;
            
            if (buildController.getRestricted() === true || 
                !isPlaceable || 
                (item.levelReq !== undefined && item.levelReq > level)) {
                // Could play error sound here
                return;
            }

            // Could hide adaptive tab here
            const placingModel = buildController.addPlacingModel(item, bestUuid);
            buildController.mainSelect(placingModel);
        }
    }, [item, buildController, inventoryController, bestUuid]);

    return (
        <ItemSlot
            item={item}
            amount={amount}
            onClick={handleClick}
            layoutOrder={layoutOrder}
            size={new UDim2(0, 100, 0, 100)}
            {...tooltipProps}
        />
    );
}