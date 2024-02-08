import { ItemsData } from "shared/constants";

class ItemCounter {
    static getTotalAmount(items: ItemsData, itemId: string) {
        let amount = items.inventory.get(itemId) ?? 0;
        for (const placedItem of items.placed) {
            if (placedItem.item === itemId)
                amount += 1;
        }
        return amount;
    }
}

export = ItemCounter;