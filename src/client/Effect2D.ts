/**
 * @fileoverview Handles all complex 2D effects on the client.
 * 
 * @since 1.0.0
 */

import ParticleEmitter from "@rbxts/rparticle";
import { Debris, TweenService } from "@rbxts/services";
import { LOCAL_PLAYER, PLAYER_GUI } from "client/constants";

namespace Effect2D {

    /**
     * The masking GUI that will be used to mask elements.
     */
    export const MASKING_GUI = new Instance("ScreenGui");
    MASKING_GUI.Name = "MaskingGui";
    MASKING_GUI.ResetOnSpawn = false;
    MASKING_GUI.DisplayOrder = 10;
    MASKING_GUI.Parent = PLAYER_GUI;

    /**
     * Create a {@link Frame} that has the same size and position as the given element.
     * Is transparent, parented to the {@link MASKING_GUI}.
     * The mask will be destroyed after the given lifetime.
     * 
     * @param element The element to create a mask for.
     * @param lifetime The lifetime of the mask in seconds.
     * @returns The created mask.
     */
    export function createMask(element?: GuiObject, lifetime = 5) {
        const mask = new Instance("Frame");
        if (element !== undefined) {
            const absPosition = element.AbsolutePosition;
            const absSize = element.AbsoluteSize;
            mask.Position = UDim2.fromOffset(absPosition.X, absPosition.Y);
            mask.Size = UDim2.fromOffset(absSize.X, absSize.Y);
        }
        mask.BackgroundTransparency = 1;
        mask.Parent = MASKING_GUI;
        Debris.AddItem(mask, lifetime);
        return mask;
    }

    export function fadeOutParticles(particles: ParticleEmitter, after = 0) {
        function fadeOut() {
            particles.rate = 0;
            task.delay(10, () => particles.Destroy());
        }
        if (after === undefined)
            fadeOut();
        else
            task.delay(after, fadeOut);
    }

    /**
     * Creates a radial grow effect on a GuiButton.
     * 
     * @param element The GuiButton to apply the effect to.
     * @param useMousePosition Whether to use the mouse position as the center of the effect.
     * @returns The created circle.
     */
    export function radialGrow(element: GuiObject, useMousePosition = false) {
        const mask = createMask(element);
        mask.ClipsDescendants = true;

        const circle = new Instance("Frame");
        const uiCorner = new Instance("UICorner");
        uiCorner.CornerRadius = new UDim(1, 0);
        uiCorner.Parent = circle;

        circle.BackgroundColor3 = new Color3(1, 1, 1);
        circle.BackgroundTransparency = 0.7;
        circle.AnchorPoint = new Vector2(0.5, 0.5);
        if (useMousePosition === true) {
            const mouse = LOCAL_PLAYER.GetMouse();
            const x = mouse.X - mask.AbsolutePosition.X;
            const y = mouse.Y - mask.AbsolutePosition.Y;
            circle.Position = new UDim2(0, x, 0, y);
        }
        else {
            circle.Position = new UDim2(0.5, 0, 0.5, 0);
        }
        circle.Size = new UDim2(0, 0, 0, 0);
        circle.LayoutOrder = 5;

        const tweenInfo = new TweenInfo(0.2);

        TweenService.Create(circle, tweenInfo, {
            Size: new UDim2(0, 200, 0, 200),
            BackgroundTransparency: 1,
        }).Play();

        Debris.AddItem(circle);

        circle.Parent = mask;

        return circle;
    }
}

export = Effect2D;