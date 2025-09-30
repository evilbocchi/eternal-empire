/**
 * Counts how many of a specific item are in the inventory and how many are placed in the world.
 * @param inventory The inventory to check.
 * @param placed The placed items to check.
 * @param itemId The ID of the item to count.
 * @returns A tuple containing the count in inventory and the count placed in the world.
 */
export default function countItemEverywhere(
    inventory: Map<string, number>,
    placed: Map<string, PlacedItem>,
    itemId: string,
) {
    const invCount = inventory.get(itemId) ?? 0;
    let placedCount = 0;
    for (const [_, placedItem] of placed) {
        if (placedItem.item === itemId) ++placedCount;
    }
    return $tuple(invCount, placedCount);
}
