import { Workspace } from "@rbxts/services";
import { IS_EDIT } from "shared/Context";
import Item from "shared/item/Item";
import Area from "shared/world/Area";

const overlapParams = new OverlapParams();
overlapParams.CollisionGroup = "ItemHitbox";

/**
 * Namespace for item placement utility functions, including collision checks and area validation.
 */
namespace ItemPlacement {
    /**
     * Checks if the given item model is touching any other placed item's hitbox.
     * @param itemModel The model of the item to check.
     * @returns True if touching another placed item, false otherwise.
     */
    export function isTouchingPlacedItem(itemModel: Model) {
        const children = itemModel.GetChildren();
        for (const hitbox of children) {
            if (hitbox.Name !== "Hitbox" || !hitbox.IsA("BasePart")) {
                continue;
            }

            let indicator = hitbox.FindFirstChild("Indicator") as BasePart | undefined; // preferrably use hitbox indicator
            if (indicator === undefined) indicator = hitbox;

            const parts = Workspace.GetPartBoundsInBox(
                indicator.CFrame,
                indicator.Size.sub(new Vector3(0.01, 0, 0.01)),
                overlapParams,
            );
            for (const part of parts) {
                if (part.Name !== "Hitbox") continue;
                const comparingModel = part.Parent;
                if (comparingModel?.Name !== itemModel.Name) {
                    if (IS_EDIT && comparingModel?.HasTag("Placing")) {
                        // Server can see item previews, ignore them
                        continue;
                    }

                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Gets the Area that contains the given position, if any.
     * @param position The position to check.
     * @param placeableAreas The list of placeable areas.
     * @returns The Area containing the position, or undefined.
     */
    export function getAreaOfPosition(position: Vector3, placeableAreas: Area[]) {
        for (const area of placeableAreas) {
            if (area.buildBounds?.isInside(position)) return area;
        }
        return undefined;
    }

    /**
     * Gets the Area that completely contains the item's primary part, if any.
     * @param itemModel The item model.
     * @param placeableAreas The list of placeable areas.
     * @returns The Area containing the item, or undefined.
     */
    export function getArea(itemModel: Model, placeableAreas: Area[]) {
        const hitbox = itemModel.PrimaryPart;
        if (hitbox !== undefined) {
            for (const area of placeableAreas) {
                if (area.buildBounds?.isCompletelyInside(hitbox)) return area;
            }
        }
        return undefined;
    }

    /**
     * Determines if the item model is in a valid placeable area for the given item.
     * @param itemModel The item model.
     * @param item The item definition.
     * @returns True if the item is in a placeable area, false otherwise.
     */
    export function isInPlaceableArea(itemModel: Model, item: Item) {
        if (item.bounds === undefined) {
            return ItemPlacement.getArea(itemModel, item.placeableAreas) !== undefined;
        } else {
            const primaryPart = itemModel.PrimaryPart!;
            for (const touching of Workspace.GetPartBoundsInBox(
                primaryPart.CFrame,
                primaryPart.Size.add(new Vector3(1, 10, 1)),
            )) {
                if (touching.Name === item.bounds) {
                    return true;
                }
            }
        }
        return false;
    }
}

export = ItemPlacement;
