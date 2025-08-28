/**
 * @fileoverview React hook for managing inventory state.
 * 
 * Provides a centralized way to access inventory and unique item data
 * with automatic updates when the underlying state changes.
 */

import { useEffect, useState } from "@rbxts/react";
import Packets from "shared/Packets";

export interface InventoryState {
    inventory: Map<string, number>;
    uniqueInstances: Map<string, UniqueItemInstance>;
}

/**
 * Hook for accessing inventory state with automatic updates
 */
export function useInventoryState(): InventoryState {
    const [inventoryState, setInventoryState] = useState<InventoryState>({
        inventory: Packets.inventory.get() ?? new Map(),
        uniqueInstances: Packets.uniqueInstances.get() ?? new Map(),
    });

    useEffect(() => {
        const inventoryConnection = Packets.inventory.observe((inventory) => {
            setInventoryState(prev => ({ 
                ...prev, 
                inventory: inventory ?? new Map() 
            }));
        });

        const uniqueInstancesConnection = Packets.uniqueInstances.observe((uniqueInstances) => {
            setInventoryState(prev => ({ 
                ...prev, 
                uniqueInstances: uniqueInstances ?? new Map() 
            }));
        });

        return () => {
            inventoryConnection.Disconnect();
            uniqueInstancesConnection.Disconnect();
        };
    }, []);

    return inventoryState;
}

/**
 * Hook for calculating item amounts including unique instances
 */
export function useItemAmounts(inventoryState: InventoryState): Map<string, number> {
    const [itemAmounts, setItemAmounts] = useState<Map<string, number>>(new Map());

    useEffect(() => {
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

        setItemAmounts(amounts);
    }, [inventoryState]);

    return itemAmounts;
}