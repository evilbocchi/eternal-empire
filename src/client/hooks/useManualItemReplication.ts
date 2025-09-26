import { useEffect } from "@rbxts/react";
import { LOCAL_PLAYER } from "client/constants";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { IS_EDIT } from "shared/Context";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

/**
 * Loads item effects for a given model instance.
 * @param model The item model instance.
 */
function load(model: Instance) {
    if (!model.IsA("Model") || model.GetAttribute("Selected") === true || model.GetAttribute("applied") === true) {
        return;
    }
    const itemId = model.GetAttribute("ItemId") as string | undefined;
    if (itemId === undefined) {
        return;
    }
    const item = Items.getItem(itemId);
    if (item === undefined) {
        return;
    }
    model.SetAttribute("applied", true);
    task.spawn(() => item.CLIENT_LOADS.forEach((callback) => callback(model, item, LOCAL_PLAYER)));
}

/**
 * A hook that ensures item models are replicated to the client when placed.
 * It listens for updates to the placed items and manages the creation and removal of item models in the game world.
 */
export default function useManualItemReplication() {
    useEffect(() => {
        if (IS_EDIT) {
            // Client and server are on the same boundary; just load item effects.
            const loadedModels = new Set<Model>();
            const connection = Packets.placedItems.observe((placedItems) => {
                for (const [placementId] of placedItems) {
                    const model = PLACED_ITEMS_FOLDER.FindFirstChild(placementId);
                    if (model && model.IsA("Model") && !loadedModels.has(model)) {
                        loadedModels.add(model);
                        load(model);
                    }
                }
            });
            return () => connection.Disconnect();
        }

        const modelPerPlacementId = new Map<string, Model>();

        const connection = Packets.placedItems.observe((placedItems) => {
            for (const [placementId, itemModel] of modelPerPlacementId) {
                if (!placedItems.has(placementId) && !itemModel.HasTag("Placing")) {
                    itemModel.Destroy();
                    modelPerPlacementId.delete(placementId);
                }
            }

            for (const [placementId, placedItem] of placedItems) {
                const itemModel = modelPerPlacementId.get(placementId);
                if (!itemModel) {
                    const item = Items.getItem(placedItem.item);
                    if (item === undefined) {
                        continue;
                    }
                    const itemModel = item.createModel(placedItem);
                    if (!itemModel) {
                        continue;
                    }
                    itemModel.Name = placementId;
                    itemModel.Parent = PLACED_ITEMS_FOLDER;
                    modelPerPlacementId.set(placementId, itemModel);
                    load(itemModel);
                }
            }
        });
        return () => {
            modelPerPlacementId.forEach((model) => model.Destroy());
            modelPerPlacementId.clear();
            connection.Disconnect();
        };
    }, []);
}
