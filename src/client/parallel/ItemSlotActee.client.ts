//!native
//!optimize 2

/**
 * @fileoverview ItemSlotActee - Client-side script for rendering item viewports in UI slots.
 * 
 * Handles:
 * - Loading and displaying 3D item models in ViewportFrames for inventory/shop UI.
 * - Dynamic camera positioning and zoom effects on hover.
 * - Coloring item descriptions based on currency.
 * - Efficiently manages per-item viewport state and animation.
 * 
 * @since 1.0.0
 */

import { RunService } from "@rbxts/services";
import { CURRENCY_DETAILS } from "shared/currency/CurrencyDetails";
import Items from "shared/items/Items";

/**
 * Represents a running viewport instance for an item slot.
 */
type RunningViewport = {
    viewportFrame: ViewportFrame,
    delta: number,
    isTweening: boolean,
    zoom: number,
    /**
     * Rotates the camera around the item model.
     * @param dt Delta time since last frame.
     * @param care Whether to update regardless of hover/tween state.
     * @param offset Optional CFrame offset.
     */
    rotateCamera(dt: number, care: boolean, offset?: CFrame): void,
};

const runningViewports = new Array<RunningViewport>();
const relsPerItem = new Map<string, [Vector3, number]>();

// Precompute description coloring and model bounding info for each item
for (const [id, item] of Items.itemsPerId) {
    let description = item.description;
    if (description !== undefined) {
        for (const [currency, details] of pairs(CURRENCY_DETAILS)) {
            [description] = description!.gsub(currency, `<font color="#${details.color.ToHex()}">${currency}</font>`);
        }
        item.description = description;
    }

    const model = item.MODEL;
    if (model === undefined)
        continue;
    model.PivotTo(new CFrame(0, -500, 0));
    let cframe: CFrame;
    let size: Vector3;
    const hitbox = model.PrimaryPart;
    if (hitbox !== undefined && hitbox.HasTag("Bounding")) {
        cframe = hitbox.CFrame;
        size = hitbox.Size;
    }
    else {
        [cframe, size] = model.GetBoundingBox();
    }
    relsPerItem.set(id, [cframe.Position.sub(model.GetPivot().Position), (math.max(size.X, size.Y, size.Z) * 0.8) + 1]);
}

// Animate all running item slot viewports each frame
RunService.BindToRenderStep("ItemSlot Creation", 0, (dt) => {
    let i = 0;
    for (const rv of runningViewports) {
        const isHovering = rv.delta > 0;
        if (isHovering && rv.zoom < 1) {
            rv.zoom += dt * ((1 - rv.zoom) * 7 + 1);
            rv.isTweening = true;
        }
        else if (!isHovering && rv.zoom > 0) {
            rv.zoom -= dt * (rv.zoom * 7 + 1);
            rv.isTweening = true;
        }
        else {
            rv.zoom = isHovering ? 1 : 0;
            rv.isTweening = false;
        }
        rv.rotateCamera(dt, true);
        ++i;
    }
});

/**
 * Handles loading and displaying an item model in a ViewportFrame.
 * Sets up camera, model, and hover/tween logic.
 */
script.GetActor()!.BindToMessage("LoadViewportFrame", (viewportFrame: ViewportFrame, itemId: string) => {
    const camera = new Instance("Camera");
    camera.CameraType = Enum.CameraType.Scriptable;
    viewportFrame.CurrentCamera = camera;
    const m = Items.getItem(itemId)?.MODEL;
    if (m === undefined)
        return;
    const model = m.Clone();
    const [adjust, rel] = relsPerItem.get(itemId)!;
    let currentAngle = 220;
    const runningViewport: RunningViewport = {
        viewportFrame: viewportFrame,
        isTweening: false,
        delta: 0,
        zoom: 0,
        rotateCamera(dt: number, care: boolean) {
            if (care === true && this.isTweening === false && (this.delta === 0 || viewportFrame.Visible === false || ((viewportFrame.Parent as GuiObject).Visible === false))) {
                return;
            }
            const pos = model.GetPivot().add(adjust);
            camera.Focus = pos;
            const newCframe = CFrame.lookAt(pos.mul(CFrame.Angles(0, math.rad(currentAngle), 0).mul(new CFrame(0, 3, rel - this.zoom))).Position, pos.Position);
            if (camera.CFrame !== newCframe) {
                camera.CFrame = newCframe;
                currentAngle = currentAngle + (this.delta * 60 * dt);
            }
        }
    };
    runningViewports.push(runningViewport);
    viewportFrame.MouseEnter.Connect(() => runningViewport.delta = 0.5);
    viewportFrame.MouseLeave.Connect(() => runningViewport.delta = 0);
    viewportFrame.Destroying.Connect(() => {
        runningViewports.remove(runningViewports.indexOf(runningViewport));
    });
    runningViewport.rotateCamera(0, false);
    camera.Parent = viewportFrame;
    model.Parent = viewportFrame;
});