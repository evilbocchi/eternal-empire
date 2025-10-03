import { getInstanceInfo } from "@antivivi/vrldk";
import { useEffect } from "@rbxts/react";
import { Debris, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { getAsset } from "shared/asset/AssetMap";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { IS_EDIT } from "shared/Context";
import eat from "shared/hamster/eat";
import Item from "shared/item/Item";
import Items from "shared/items/Items";
import Packets from "shared/Packets";
import WorldNode from "shared/world/nodes/WorldNode";

namespace ClientItemReplication {
    export const modelPerPlacementId = new Map<string, Model>();
    const callbacks = new Set<(model: Model) => (() => void) | void>();

    /**
     * Loads item effects for a given model instance.
     * @param model The item model instance.
     * @param placementId The unique placement ID of the item.
     * @param showEffects Whether to show placement effects (like sparkles). Defaults to true.
     */
    export function load(model: Instance, placementId?: string, showEffects = true) {
        if (!model.IsA("Model") || model.GetAttribute("Selected") === true) return;
        if (placementId !== undefined && modelPerPlacementId.has(placementId)) return;

        const itemId = getInstanceInfo(model, "ItemId");
        if (itemId === undefined) return;
        const item = Items.getItem(itemId);
        if (item === undefined) return;

        if (placementId !== undefined) {
            modelPerPlacementId.set(placementId, model);
        }
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
            if (placementId !== undefined) {
                modelPerPlacementId.delete(placementId);
            }
        });

        if (showEffects) {
            placeEffect(model, item);
        }
    }

    function placeEffect(model: Model, item: Item) {
        const primaryPart = model.PrimaryPart;
        if (primaryPart === undefined) return;

        const size = primaryPart.Size;

        // Create sparkles
        const sparkles = new Instance("ParticleEmitter");
        sparkles.Acceleration = new Vector3(0, 2, 0);
        sparkles.Color = new ColorSequence(item.difficulty.color ?? Color3.fromRGB(255, 255, 255));
        sparkles.Drag = 6;
        sparkles.Enabled = false;
        sparkles.EmissionDirection = Enum.NormalId.Front;
        sparkles.Lifetime = new NumberRange(4, 6);
        sparkles.LightEmission = 1;
        sparkles.LockedToPart = true;
        sparkles.Rate = 5000;
        sparkles.Rotation = new NumberRange(-360, 360);
        sparkles.RotSpeed = new NumberRange(-90, 90);
        sparkles.Shape = Enum.ParticleEmitterShape.Disc;
        sparkles.ShapeInOut = Enum.ParticleEmitterShapeInOut.Outward;
        sparkles.Size = new NumberSequence([
            new NumberSequenceKeypoint(0, 0.4, 0.2),
            new NumberSequenceKeypoint(0.5, 0.4, 0.2),
            new NumberSequenceKeypoint(0.51, 0.2, 0.1),
            new NumberSequenceKeypoint(1, 0.2, 0.1),
        ]);
        sparkles.Speed = new NumberRange(18, 20);
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
        container.Size = new Vector3(size.X, 0.05, size.Z);
        container.Position = primaryPart.Position.sub(new Vector3(0, size.Y / 2, 0));
        container.Parent = Workspace;
        sparkles.Parent = container;

        eat(container, "Destroy");
        Debris.AddItem(container, 5);

        sparkles.Emit(10);

        // Create pulse
        const highlight = new Instance("Highlight");
        highlight.Adornee = model;
        highlight.FillColor = Color3.fromRGB(255, 255, 255);
        highlight.FillTransparency = 0.8;
        highlight.OutlineTransparency = 1;
        highlight.Parent = Workspace;

        TweenService.Create(highlight, new TweenInfo(1), {
            FillTransparency: 1,
        }).Play();
        eat(highlight, "Destroy");
        Debris.AddItem(highlight, 1);

        // Tween model size like 0.85 -> 1.05 -> 1.0 would also be nice, but performance issues need addressing.
    }

    /**
     * A hook that ensures item models are replicated to the client when placed.
     * It listens for updates to the placed items and manages the creation and removal of item models in the game world.
     */
    export function useManualItemReplication() {
        useEffect(() => {
            let i = 0;
            const mapItemWorldNode = new WorldNode("MapItem", (waypoint) => {
                if (!waypoint.IsA("BasePart")) return;
                const item = Items.getItem(waypoint.Name);
                if (item === undefined) throw `Item ${waypoint.Name} not found`;
                const model = item.createModel({
                    item: item.id,
                    posX: waypoint.Position.X,
                    posY: waypoint.Position.Y,
                    posZ: waypoint.Position.Z,
                    rotX: waypoint.Rotation.X,
                    rotY: waypoint.Rotation.Y,
                    rotZ: waypoint.Rotation.Z,
                });
                if (model !== undefined) {
                    model.Parent = Workspace;
                    load(model, undefined, false);
                } else warn(`Model for ${item.id} not found`);
                i++;
            });

            if (IS_EDIT) {
                // Client and server are on the same boundary; just load item effects.
                const connection = Packets.placedItems.observe((placedItems) => {
                    const loaded = new Map<string, Model>();
                    let size = 0;
                    for (const [placementId] of placedItems) {
                        const model = PLACED_ITEMS_FOLDER.FindFirstChild(placementId);
                        if (model === undefined || !model.IsA("Model") || modelPerPlacementId.has(placementId))
                            continue;
                        loaded.set(placementId, model);
                        size += 1;
                    }
                    for (const [placementId, model] of loaded) {
                        load(model, placementId, size < 10);
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

                const loaded = new Map<string, Model>();
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
                    loaded.set(placementId, itemModel);
                    size += 1;
                }

                for (const [placementId, model] of loaded) {
                    load(model, placementId, size < 10);
                }
            });
            return () => {
                if (!IS_EDIT) {
                    modelPerPlacementId.forEach((model) => model.Destroy());
                }
                modelPerPlacementId.clear();
                settingsConnection.Disconnect();
                connection.Disconnect();
                mapItemWorldNode.cleanup();
            };
        }, []);
    }
}

export default ClientItemReplication;
