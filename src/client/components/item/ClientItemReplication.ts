import { getInstanceInfo } from "@antivivi/vrldk";
import { useEffect } from "@rbxts/react";
import { Debris, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { getAsset } from "shared/asset/AssetMap";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { IS_EDIT } from "shared/Context";
import eat from "shared/hamster/eat";
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

    function placeEffect(model: Model) {
        const primaryPart = model.PrimaryPart;
        if (primaryPart === undefined) return;

        const size = primaryPart.Size;

        const sparkles = new Instance("ParticleEmitter");
        sparkles.Acceleration = new Vector3(0, 0.5, 0);
        sparkles.Drag = 3;
        sparkles.Enabled = false;
        sparkles.EmissionDirection = Enum.NormalId.Front;
        sparkles.Lifetime = new NumberRange(4, 6);
        sparkles.LightEmission = 1;
        sparkles.LockedToPart = true;
        sparkles.Rate = 500;
        sparkles.Rotation = new NumberRange(-360, 360);
        sparkles.Shape = Enum.ParticleEmitterShape.Disc;
        sparkles.ShapeInOut = Enum.ParticleEmitterShapeInOut.InAndOut;
        sparkles.Size = new NumberSequence([
            new NumberSequenceKeypoint(0, 0.4, 0.2),
            new NumberSequenceKeypoint(0.5, 0.4, 0.2),
            new NumberSequenceKeypoint(0.51, 0.2, 0.1),
            new NumberSequenceKeypoint(1, 0.2, 0.1),
        ]);
        sparkles.Speed = new NumberRange(6, 10);
        sparkles.SpreadAngle = new Vector2(0, 360);
        sparkles.Texture = getAsset("assets/vfx/Sparkle.png");
        sparkles.Transparency = new NumberSequence([
            new NumberSequenceKeypoint(0, 0, 0),
            new NumberSequenceKeypoint(0.228, 0, 0),
            new NumberSequenceKeypoint(0.23, 1, 0),
            new NumberSequenceKeypoint(0.523, 1, 0),
            new NumberSequenceKeypoint(1, 1, 0),
        ]);
        sparkles.ZOffset = 1;

        const container = new Instance("Part");
        container.Anchored = true;
        container.CanCollide = false;
        container.CanTouch = false;
        container.CastShadow = false;
        container.Transparency = 1;
        container.Size = new Vector3(size.X, 0.1, size.Z);
        container.Position = primaryPart.Position.sub(new Vector3(0, size.Y / 2, 0));
        container.Parent = Workspace;
        sparkles.Parent = container;

        eat(container, "Destroy");
        Debris.AddItem(container, 5);

        sparkles.Emit(10);
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
                    const loaded = new Set<Model>();
                    let size = 0;
                    for (const [placementId] of placedItems) {
                        const model = PLACED_ITEMS_FOLDER.FindFirstChild(placementId);
                        if (model === undefined || !model.IsA("Model") || modelPerPlacementId.has(placementId))
                            continue;
                        loaded.add(model);
                        size += 1;
                        load(model, placementId);
                    }
                    if (size < 10) {
                        for (const model of loaded) {
                            placeEffect(model);
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

                const loaded = new Set<Model>();
                let size = 0;
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
                    loaded.add(itemModel);
                    load(itemModel, placementId);
                    size += 1;
                }

                if (size < 10) {
                    for (const model of loaded) {
                        placeEffect(model);
                    }
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
