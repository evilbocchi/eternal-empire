import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import countItemEverywhere from "shared/item/utils/countItemEverywhere";
import Items from "shared/items/Items";

const maxItemAmounts = new Map<string, number>();

/**
 * Fix duped items and bad bought amounts.
 * @param items Data to fix.
 * @returns Fixed data.
 */
export default function fixDuplicatedItemsData(items: ItemsData) {
    Items.itemsPerId.forEach((item: Item) => {
        if (item.defaultPrice !== undefined)
            // buy limit is uncapped, dont check
            return;

        const itemId = item.id;
        const [invCount, placedCount] = countItemEverywhere(items.inventory, items.worldPlaced, itemId);
        const totalCount = invCount + placedCount;

        let max = maxItemAmounts.get(itemId);
        if (max === undefined) {
            max = -1;
            for (const [amount, _] of item.pricePerIteration) if (amount > max) max = amount;

            maxItemAmounts.set(itemId, max);
        }

        if (max === -1 || totalCount <= max) return;

        // this is the point where there are clearly more items than allowed. remove the excess
        const diff = totalCount - max;
        const fromInvCount = math.min(diff, invCount);
        warn("Removing", fromInvCount, itemId);
        items.inventory.set(itemId, invCount - fromInvCount);

        const remaining = diff - fromInvCount;
        if (remaining > 0) {
            // if there isnt enough in inventory to remove, remove from placed items
            print("Removing", remaining, itemId, "from placed items");
            let removed = 0;
            for (const [placementId, placedItem] of items.worldPlaced) {
                if (placedItem.item === itemId) {
                    items.worldPlaced.delete(placementId);
                    if (++removed >= remaining) {
                        return;
                    }
                }
            }
        }
    });

    // fix bad bought
    const addAmount = (list: Map<string, number>, itemId: string, amount: number) => {
        list.set(itemId, (list.get(itemId) ?? 0) + amount);
    };

    const baseAmounts = new Map<string, number>();
    for (const [_, placedItem] of items.worldPlaced) addAmount(baseAmounts, placedItem.item, 1);
    for (const [itemId, amount] of items.inventory) addAmount(baseAmounts, itemId, amount);

    const nestCheck = (base: Map<string, number>, item: Item, amount?: number) => {
        if (amount === undefined) return;
        for (const [subItemId, requiredAmount] of item.requiredItems) {
            const totalAmount = requiredAmount * amount;
            addAmount(base, subItemId, totalAmount);
            const subItem = Items.getItem(subItemId);
            if (subItem !== undefined) {
                nestCheck(base, subItem, totalAmount);
            }
        }
    };
    const addedAmounts = new Map<string, number>();
    for (const [itemId, item] of Items.itemsPerId) {
        nestCheck(addedAmounts, item, baseAmounts.get(itemId));
    }
    for (const [itemId, item] of Items.itemsPerId) {
        if (
            item.isA("Gear") ||
            item.pricePerIteration.size() === 0 ||
            item.difficulty === Difficulty.Excavation ||
            item.isA("Unique")
        )
            continue;

        const amount = (addedAmounts.get(itemId) ?? 0) + (baseAmounts.get(itemId) ?? 0);
        if (amount < 0) continue;

        const cached = items.bought.get(itemId) ?? 0;
        if (cached !== amount) {
            warn(itemId, "has", cached, "bought, found", amount);
            items.bought.set(itemId, amount);
        }
    }
}
