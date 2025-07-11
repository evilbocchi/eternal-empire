class ItemCounter {
    static getTotalAmount(inventory: Inventory, placed: PlacedItem[], itemId: string) {
        let amount = inventory.get(itemId) ?? 0;
        for (const placedItem of placed) {
            if (placedItem.item === itemId)
                amount += 1;
        }
        return amount;
    }
}

export = ItemCounter;