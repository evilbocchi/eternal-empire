//!native
//!optimize 2

/**
 * @fileoverview Client controller for managing world effects, item visuals, and area lighting.
 *
 * Handles:
 * - Loading and applying item and droplet effects
 * - Animating quest messages and UI feedback
 * - Managing tag-based effects (rainbow, spinner, rotation)
 * - Integrating with area lighting and droplet events
 *
 * The controller manages visual effects for items, droplets, and world elements, providing feedback and polish for gameplay actions.
 *
 * @since 1.0.0
 */

import { observeTagAdded, rainbowEffect } from "@antivivi/vrldk";
import { Controller, OnStart } from "@flamework/core";
import { TweenService } from "@rbxts/services";

/**
 * Controller responsible for managing world effects, item visuals, and area lighting.
 *
 * Handles tag-based effects, droplet/item visuals, quest message animation, and area lighting changes.
 */
@Controller()
export default class EffectController implements OnStart {
    /**
     * Loads tag-based effects for items and droplets.
     */
    loadTags() {
        observeTagAdded("Rainbow", (instance) => rainbowEffect(instance as BasePart, 2), true);
        observeTagAdded(
            "Spinner",
            (instance) => {
                if (!instance.IsA("BasePart")) return;

                const createRandomTween = () => {
                    if (instance === undefined || instance.Parent === undefined) return;

                    const tween = TweenService.Create(instance, new TweenInfo(2, Enum.EasingStyle.Linear), {
                        Orientation: new Vector3(math.random(0, 360), math.random(0, 360), math.random(0, 360)),
                    });
                    tween.Completed.Once(createRandomTween);
                    tween.Play();
                };
                createRandomTween();
            },
            true,
        );

        const tweenInfo = new TweenInfo(2, Enum.EasingStyle.Linear);
        function rotationLoop(instance: BasePart, delta: number) {
            const tween = TweenService.Create(instance, tweenInfo, {
                CFrame: instance.CFrame.mul(CFrame.Angles(0, delta, 0)),
            });
            tween.Completed.Once(() => rotationLoop(instance, delta));
            tween.Play();
            return tween;
        }
        observeTagAdded(
            "Clockwise",
            (instance) => {
                if (!instance.IsA("BasePart")) return;

                const tween = rotationLoop(instance, math.pi);
                return () => tween.Destroy();
            },
            true,
        );
        observeTagAdded(
            "Anticlockwise",
            (instance) => {
                if (!instance.IsA("BasePart")) return;

                const tween = rotationLoop(instance, -math.pi);
                return () => tween.Destroy();
            },
            true,
        );
    }

    /**
     * Initializes the EffectController, sets up effect listeners and area lighting changes.
     */
    onStart() {
        this.loadTags();
    }
}
