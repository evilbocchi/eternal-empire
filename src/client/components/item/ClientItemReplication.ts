import { getInstanceInfo } from "@antivivi/vrldk";
import { useEffect } from "@rbxts/react";
import { LOCAL_PLAYER } from "client/constants";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { IS_EDIT } from "shared/Context";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

namespace ClientItemReplication {
    export const modelPerPlacementId = new Map<string, Model>();
    const callbacks = new Set<(model: Model) => (() => void) | void>();

    /**
     * Loads item effects for a given model instance.
     * @param model The item model instance.
     */
    export function load(model: Instance, placementId: string) {
        if (!model.IsA("Model") || model.GetAttribute("Selected") === true || modelPerPlacementId.has(placementId)) {
            return;
        }
        const itemId = getInstanceInfo(model, "ItemId");
        if (itemId === undefined) {
            return;
        }
        const item = Items.getItem(itemId);
        if (item === undefined) {
            return;
        }
        modelPerPlacementId.set(placementId, model);
        task.spawn(() => item.CLIENT_LOADS.forEach((callback) => callback(model, item, LOCAL_PLAYER!)));
        const cleanups = new Set<() => void>();
        for (const callback of callbacks) {
            const cleanup = callback(model);
            if (cleanup) {
                cleanups.add(cleanup);
            }
        }
        model.Destroying.Once(() => {
            for (const cleanup of cleanups) {
                cleanup();
            }
            modelPerPlacementId.delete(placementId);
        });
    }

    /**
     * A hook that ensures item models are replicated to the client when placed.
     * It listens for updates to the placed items and manages the creation and removal of item models in the game world.
     */
    export function useManualItemReplication() {
        useEffect(() => {
            if (IS_EDIT) {
                // Client and server are on the same boundary; just load item effects.
                const connection = Packets.placedItems.observe((placedItems) => {
                    for (const [placementId] of placedItems) {
                        const model = PLACED_ITEMS_FOLDER.FindFirstChild(placementId);
                        if (model && model.IsA("Model")) {
                            load(model, placementId);
                        }
                    }
                });
                return () => connection.Disconnect();
            }

            let isParticlesEnabled = true;
            const settingsConnection = Packets.settings.observe((settings) => {
                isParticlesEnabled = settings.Particles;
            });
            const connection = Packets.placedItems.observe((placedItems) => {
                // Remove any models that are no longer placed
                for (const [placementId, itemModel] of modelPerPlacementId) {
                    if (!placedItems.has(placementId) && !itemModel.HasTag("Placing")) {
                        itemModel.Destroy();
                        modelPerPlacementId.delete(placementId);
                    }
                }

                for (const [placementId, placedItem] of placedItems) {
                    // Already have this model?
                    if (modelPerPlacementId.has(placementId)) {
                        continue;
                    }

                    // Create the model
                    const item = Items.getItem(placedItem.item);
                    if (item === undefined) {
                        continue;
                    }
                    const itemModel = item.createModel(placedItem);
                    if (!itemModel) {
                        continue;
                    }
                    if (!isParticlesEnabled) {
                        for (const descendant of itemModel.GetDescendants()) {
                            if (descendant.HasTag("Effect")) {
                                (descendant as ParticleEmitter).Enabled = false;
                            }
                        }
                    }

                    itemModel.Name = placementId;
                    itemModel.Parent = PLACED_ITEMS_FOLDER;
                    load(itemModel, placementId);
                }
            });
            return () => {
                if (!IS_EDIT) {
                    modelPerPlacementId.forEach((model) => model.Destroy());
                }
                modelPerPlacementId.clear();
                settingsConnection.Disconnect();
                connection.Disconnect();
            };
        }, []);
    }
}

export default ClientItemReplication;
