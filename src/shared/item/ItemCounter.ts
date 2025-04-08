class ItemCounter {
    static getAmounts(inventory: Inventory, placed: Map<string, PlacedItem>, itemId: string) {
        const invCount = inventory.get(itemId) ?? 0;
        let placedCount = 0;
        for (const [_, placedItem] of placed) {
            if (placedItem.item === itemId)
                ++placedCount;
        }
        return $tuple(invCount, placedCount);
    }
}

export = ItemCounter;