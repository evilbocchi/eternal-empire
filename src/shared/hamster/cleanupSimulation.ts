import Items from "shared/items/Items";

export default function cleanupSimulation() {
    for (const item of Items.sortedItems) {
        table.clear(item);
    }
    table.clear(Items);
}
