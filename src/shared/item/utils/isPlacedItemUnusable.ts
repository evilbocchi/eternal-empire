import { Server } from "shared/api/APIExpose";
import Packets from "shared/Packets";

type ItemInstanceInfo = InstanceInfo & {
    PlacementId?: string;
};

export default function isPlacedItemUnusable(modelInfo: ItemInstanceInfo): boolean {
    if (modelInfo.broken === true || modelInfo.maintained === false) {
        return true;
    }

    let placementId = modelInfo.PlacementId;
    if (placementId === undefined) {
        const instance = (modelInfo as unknown as { Instance?: Instance }).Instance;
        const model = instance?.IsA("Model") ? instance : instance?.FindFirstAncestorWhichIsA("Model");
        placementId = model?.Name;
    }

    if (placementId === undefined) {
        return false;
    }

    if (Server.ready === true && Server.Item !== undefined) {
        return Server.Item.getBrokenPlacedItems().has(placementId);
    }

    const broken = Packets.brokenPlacedItems.get();
    return broken !== undefined && broken.has(placementId);
}
