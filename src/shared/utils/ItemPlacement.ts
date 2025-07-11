import { Workspace } from "@rbxts/services";
import Area from "shared/Area";

class ItemPlacement {
    static isTouchingPlacedItem(itemModel: Model) {
        const hitbox = itemModel.FindFirstChild("Hitbox") as BasePart;
        if (hitbox === undefined)
            return true;
        for (const part of Workspace.GetPartBoundsInBox(hitbox.CFrame, hitbox.Size.sub(new Vector3(0.2, 0.2, 0.2)))) {
            if (part.Name === "Hitbox" && part.Parent?.Name !== itemModel.Name) {
                return true;
            }
        }
        return false;
    }

    static getAreaOfPosition(position: Vector3, placeableAreas: Area[]) {
        for (const area of placeableAreas) {
            if (area.getBuildBounds().isInside(position))
                return area;
        }
        return undefined;
    }

    static getArea(itemModel: Model, placeableAreas: Area[]) {
        const hitbox = itemModel.FindFirstChild("Hitbox") as BasePart;
        if (hitbox !== undefined) {
            for (const area of placeableAreas) {
                if (area.getBuildBounds().isCompletelyInside(hitbox))
                    return area;
            }
        }
        return undefined;
    }

    static isItemModelAcceptable(itemModel: Model, placeableAreas: Area[]): [boolean, Area | undefined] {
        if (ItemPlacement.isTouchingPlacedItem(itemModel)) {
            return [false, undefined]
        }
        const area = ItemPlacement.getArea(itemModel, placeableAreas);
        return area !== undefined ? [true, area] : [false, undefined];
    }
}

export = ItemPlacement;