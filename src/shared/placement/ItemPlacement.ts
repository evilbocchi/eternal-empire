import { Workspace } from "@rbxts/services";
import Area from "shared/Area";
import Item from "shared/item/Item";

const overlapParams = new OverlapParams();
overlapParams.CollisionGroup = "ItemHitbox";

namespace ItemPlacement {
    export function isTouchingPlacedItem(itemModel: Model) {
        const children = itemModel.GetChildren();
        for (const hitbox of children) {
            if (hitbox.Name !== "Hitbox" || !hitbox.IsA("BasePart")) {
                continue;
            }

            let indicator = hitbox.FindFirstChild("Indicator") as BasePart | undefined; // preferrably use hitbox indicator
            if (indicator === undefined)
                indicator = hitbox;

            const parts = Workspace.GetPartBoundsInBox(indicator.CFrame, indicator.Size.sub(new Vector3(0.01, 0, 0.01)), overlapParams);
            for (const part of parts) {
                if (part.Name === "Hitbox" && part.Parent?.Name !== itemModel.Name) {
                    return true;
                }
            }
        }
        return false;
    }

    export function getAreaOfPosition(position: Vector3, placeableAreas: Area[]) {
        for (const area of placeableAreas) {
            if (area.buildBounds?.isInside(position))
                return area;
        }
        return undefined;
    }

    export function getArea(itemModel: Model, placeableAreas: Area[]) {
        const hitbox = itemModel.PrimaryPart;
        if (hitbox !== undefined) {
            for (const area of placeableAreas) {
                if (area.buildBounds?.isCompletelyInside(hitbox))
                    return area;
            }
        }
        return undefined;
    }

    export function isInPlaceableArea(itemModel: Model, item: Item) {
        if (item.bounds === undefined) {
            return ItemPlacement.getArea(itemModel, item.placeableAreas) !== undefined;
        }
        else {
            const primaryPart = itemModel.PrimaryPart!;
            for (const touching of Workspace.GetPartBoundsInBox(primaryPart.CFrame, primaryPart.Size.add(new Vector3(1, 10, 1)))) {
                if (touching.Name === item.bounds) {
                    return true;
                }
            }
        }
        return false;
    }
}

export = ItemPlacement;