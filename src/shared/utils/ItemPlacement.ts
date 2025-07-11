import { Workspace } from "@rbxts/services";
import Area from "shared/Area";

namespace ItemPlacement {
    export function isTouchingPlacedItem(itemModel: Model) {
        const children = itemModel.GetChildren();
        for (const hitbox of children) {
            if (hitbox.Name !== "Hitbox" || !hitbox.IsA("BasePart")) {
                continue;
            }
            for (const part of Workspace.GetPartBoundsInBox(hitbox.CFrame, hitbox.Size.sub(new Vector3(0.2, 0.2, 0.2)))) {
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

    export function isItemModelAcceptable(itemModel: Model, placeableAreas: Area[]): [boolean, Area | undefined] {
        if (ItemPlacement.isTouchingPlacedItem(itemModel)) {
            return [false, undefined];
        }
        const area = ItemPlacement.getArea(itemModel, placeableAreas);
        return area !== undefined ? [true, area] : [false, undefined];
    }
}

export = ItemPlacement;