//!native

/**
 * @fileoverview Script for rendering item viewports in UI slots.
 *
 * Handles:
 * - Loading and displaying 3D item models in ViewportFrames for inventory/shop UI.
 * - Dynamic camera positioning and zoom effects on hover.
 * - Coloring item descriptions based on currency.
 * - Efficiently manages per-item viewport state and animation.
 *
 * @since 1.0.0
 */

import { RefObject, useEffect } from "@rbxts/react";
import { RunService } from "@rbxts/services";
import { IS_EDIT, IS_SERVER } from "shared/Context";
import eat from "shared/hamster/eat";
import { ITEM_MODELS } from "shared/item/ItemModels";

/**
 * Represents a running viewport instance for an item slot.
 */
type RunningViewport = {
    viewportFrame: ViewportFrame;
    delta: number;
    isTweening: boolean;
    zoom: number;
    /**
     * Rotates the camera around the item model.
     * @param dt Delta time since last frame.
     * @param care Whether to update regardless of hover/tween state.
     * @param offset Optional CFrame offset.
     */
    rotateCamera(dt: number, care: boolean, offset?: CFrame): void;
};

const KEY = "ItemViewport";
const VIEWPORT_WORLD_POSITION = new CFrame(0, -500, 0);

namespace ItemViewport {
    let enabled = true;
    export const runningViewports = new Array<RunningViewport>();
    export const relsPerItem = new Map<string, [Vector3, number]>();

    export function disable() {
        enabled = false;
    }

    // Precompute model bounding info for each item
    for (const [id, model] of ITEM_MODELS) {
        let cframe: CFrame;
        let size: Vector3;
        const hitbox = model.PrimaryPart;
        if (hitbox !== undefined && hitbox.HasTag("Bounding")) {
            cframe = hitbox.CFrame;
            size = hitbox.Size;
        } else {
            [cframe, size] = model.GetBoundingBox();
        }
        relsPerItem.set(id, [
            cframe.Position.sub(model.GetPivot().Position),
            math.max(size.X, size.Y, size.Z) * 0.8 + 1,
        ]);
    }

    // Animate all running item slot viewports each frame
    if (!IS_SERVER || IS_EDIT) {
        const cleanup = () => {
            RunService.UnbindFromRenderStep(KEY);
            for (const rv of runningViewports) {
                rv.viewportFrame.ClearAllChildren();
            }
            runningViewports.clear();
        };
        cleanup();

        RunService.BindToRenderStep(KEY, 0, (dt) => {
            let i = 0;
            for (const rv of runningViewports) {
                const isHovering = rv.delta > 0;
                if (isHovering && rv.zoom < 1) {
                    rv.zoom += dt * ((1 - rv.zoom) * 7 + 1);
                    rv.isTweening = true;
                } else if (!isHovering && rv.zoom > 0) {
                    rv.zoom -= dt * (rv.zoom * 7 + 1);
                    rv.isTweening = true;
                } else {
                    rv.zoom = isHovering ? 1 : 0;
                    rv.isTweening = false;
                }
                rv.rotateCamera(dt, true);
                ++i;
            }
        });

        eat(cleanup);
    }

    /**
     * Handles loading and displaying an item model in a ViewportFrame.
     * Sets up camera, model, and hover/tween logic.
     * @param viewportFrame The ViewportFrame to load the item into.
     * @param itemId The ID of the item to display.
     */
    export function loadItemIntoViewport(viewportFrame: ViewportFrame, itemId: string) {
        if (!enabled) return;

        viewportFrame.ClearAllChildren();

        const camera = new Instance("Camera");
        camera.CameraType = Enum.CameraType.Scriptable;
        viewportFrame.CurrentCamera = camera;

        const m = ITEM_MODELS.get(itemId);
        if (m === undefined) return;
        const model = m.Clone();
        let cframe = VIEWPORT_WORLD_POSITION;
        model.TranslateBy(cframe.Position.sub(model.GetPivot().Position));
        const [adjust, rel] = relsPerItem.get(itemId)!;
        let currentAngle = 220;
        const runningViewport: RunningViewport = {
            viewportFrame: viewportFrame,
            isTweening: false,
            delta: 0,
            zoom: 0,
            rotateCamera(dt: number, care: boolean) {
                if (
                    care === true &&
                    this.isTweening === false &&
                    (this.delta === 0 ||
                        viewportFrame.Visible === false ||
                        (viewportFrame.Parent as GuiObject).Visible === false)
                ) {
                    return;
                }
                const pos = cframe.add(adjust);
                camera.Focus = pos;
                const newCFrame = CFrame.lookAt(
                    pos.mul(CFrame.Angles(0, math.rad(currentAngle), 0).mul(new CFrame(0, 3, rel - this.zoom)))
                        .Position,
                    pos.Position,
                );
                if (camera.CFrame !== newCFrame) {
                    camera.CFrame = newCFrame;
                    currentAngle = currentAngle + this.delta * 60 * dt;
                }
            },
        };
        runningViewports.push(runningViewport);
        viewportFrame.MouseEnter.Connect(() => (runningViewport.delta = 0.5));
        viewportFrame.MouseLeave.Connect(() => (runningViewport.delta = 0));
        viewportFrame.Destroying.Connect(() => {
            runningViewports.remove(runningViewports.indexOf(runningViewport));
        });
        runningViewport.rotateCamera(0, false);
        camera.Parent = viewportFrame;
        model.Parent = viewportFrame;
    }
}

export default ItemViewport;

/**
 * Hook to load an item into a viewport frame.
 * @param viewportRef The reference to the viewport frame.
 * @param itemId The ID of the item to load.
 */
export function useItemViewport(viewportRef: RefObject<ViewportFrame>, itemId: string) {
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        ItemViewport.loadItemIntoViewport(viewport, itemId);
    }, [itemId]);
}
