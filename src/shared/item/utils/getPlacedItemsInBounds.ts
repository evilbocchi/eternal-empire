import { Workspace } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import Item from "shared/item/Item";

const placedItemOverlapParams = new OverlapParams();
placedItemOverlapParams.FilterType = Enum.RaycastFilterType.Include;
placedItemOverlapParams.CollisionGroup = "ItemHitbox";
export default function getPlacedItemsInBounds(bounds: BasePart, Items = Server.Items) {
    const array = Workspace.GetPartBoundsInBox(bounds.CFrame, bounds.Size, placedItemOverlapParams);
    const items = new Map<Model, Item>();
    for (const touching of array) {
        const target = touching.Parent as Model;
        const itemId = target.GetAttribute("ItemId") as string;
        if (itemId === undefined) {
            continue;
        }
        const item = Items.getItem(itemId);
        if (item === undefined) {
            throw `Item with id ${itemId} not found in items map.`;
        }
        items.set(target, item);
    }
    return items;
}
