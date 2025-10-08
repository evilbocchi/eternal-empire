import { getInstanceInfo } from "@antivivi/vrldk";
import { Workspace } from "@rbxts/services";
import { Server } from "shared/api/APIExpose";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import Item from "shared/item/Item";

const OVERLAP_PARAMS = new OverlapParams();
OVERLAP_PARAMS.CollisionGroup = "ItemHitbox";
OVERLAP_PARAMS.FilterType = Enum.RaycastFilterType.Include;
OVERLAP_PARAMS.FilterDescendantsInstances = [PLACED_ITEMS_FOLDER];

export default function getPlacedItemsInBounds(bounds: BasePart) {
    const array = Workspace.GetPartBoundsInBox(bounds.CFrame, bounds.Size, OVERLAP_PARAMS);
    const items = new Map<Model, Item>();
    const itemsPerId = Server.Items.itemsPerId;
    for (const touching of array) {
        const target = touching.Parent as Model;
        const itemId = getInstanceInfo(target, "ItemId");
        if (itemId === undefined) {
            continue;
        }
        const item = itemsPerId.get(itemId);
        if (item === undefined) {
            throw `Item with id ${itemId} not found in items map.`;
        }
        items.set(target, item);
    }
    return items;
}
