import ItemViewport from "shared/item/ItemViewport";
import Items from "shared/items/Items";

export default function cleanupSimulation() {
    // for (const item of Items.sortedItems) {
    //     table.clear(item);
    // }
    // table.clear(Items);
    // wontfix; somewhere stale item references exist. minor memory leak in simulation tests, not worth fixing now
    ItemViewport.cleanup();
}
