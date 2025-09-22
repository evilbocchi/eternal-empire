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
import { Controller, OnInit } from "@flamework/core";
import { CollectionService, Debris, TweenService } from "@rbxts/services";
import { PingManager } from "client/ui/components/stats/StatsWindow";
import UserGameSettings from "shared/api/UserGameSettings";
import { getSound, SOUND_EFFECTS_GROUP } from "shared/asset/GameAssets";
import Packets from "shared/Packets";

/**
 * Controller responsible for managing world effects, item visuals, and area lighting.
 *
 * Handles tag-based effects, droplet/item visuals, quest message animation, and area lighting changes.
 */
@Controller()
export default class EffectController implements OnInit {
    /** Map of droplet parts to their original size. */
    sizePerDrop = new Map<BasePart, Vector3>();
    /** Delay value for ping calculation. */
    delay = 0.2;

    /**
     * Animates and displays a quest message frame.
     * @param frame The quest message frame to show.
     */
    showQuestMessage(frame: Frame) {
        const imageLabel = frame.FindFirstChildOfClass("ImageLabel");
        if (imageLabel === undefined) return;
        imageLabel.ImageTransparency = 1;
        const textLabels = frame.GetChildren().filter((value) => value.IsA("TextLabel")) as TextLabel[];
        textLabels.forEach((label) => {
            label.TextTransparency = 0;
            const uiStroke = label.FindFirstChildOfClass("UIStroke")!;
            uiStroke.Transparency = 0;
            task.delay(4, () => {
                TweenService.Create(label, new TweenInfo(3), { TextTransparency: 1 }).Play();
                TweenService.Create(uiStroke, new TweenInfo(3), { Transparency: 1 }).Play();
            });
        });
        TweenService.Create(imageLabel, new TweenInfo(0.1), { ImageTransparency: 0 }).Play();
        task.delay(0.2, () => TweenService.Create(imageLabel, new TweenInfo(6), { ImageTransparency: 1 }).Play());
        task.delay(7, () => {
            frame.Visible = false;
        });
        frame.Visible = true;
    }

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
    onInit() {
        this.loadTags();

        Packets.dropletAdded.fromServer((drop?: BasePart) => {
            if (!drop) return;

            const originalSize = drop.GetAttribute("OriginalSize") as Vector3 | undefined;
            if (originalSize === undefined) return;

            if (UserGameSettings!.SavedQualityLevel.Value > 1) {
                drop.Size = originalSize.add(new Vector3(0.15, 0.825, 0.15));
                TweenService.Create(drop, new TweenInfo(0.3), { Size: originalSize }).Play();
            }
        });

        Packets.dropletBurnt.fromServer((dropletModelId) => {
            const droplet = CollectionService.GetTagged("Droplet").find(
                (droplet) => droplet.Name === dropletModelId, // TODO: optimize by using a map
            ) as BasePart | undefined;
            if (droplet === undefined)
                // streamed out
                return;

            const t = tick();
            let burnSound: Sound;
            const sizeMagnitude = droplet.Size.Magnitude / 2;
            const tweenInfo = new TweenInfo(sizeMagnitude / 2);

            const light = droplet.FindFirstChildOfClass("PointLight") as PointLight | undefined;
            if (light !== undefined) {
                TweenService.Create(light, tweenInfo, { Range: 0 }).Play();
                burnSound = getSound("LuckyDropletBurn.mp3");
            } else {
                burnSound = getSound("DropletBurn.mp3");
            }

            burnSound.PlaybackSpeed = (math.random() * 0.3 + 0.85) / sizeMagnitude;
            if (sizeMagnitude > 0.666) {
                const reverb = new Instance("ReverbSoundEffect");
                reverb.DecayTime = sizeMagnitude / 2;
                reverb.DryLevel = 0.5;
                reverb.WetLevel = 0.5;
                reverb.Parent = burnSound;
            }
            burnSound.SoundGroup = SOUND_EFFECTS_GROUP;
            burnSound.Parent = droplet;
            burnSound.Play();
            TweenService.Create(droplet, tweenInfo, { Color: new Color3(), Size: new Vector3() }).Play();

            Debris.AddItem(droplet, 6);
            droplet.Anchored = true;

            PingManager.logPing(tick() - t);
        });
        Packets.applyImpulse.fromServer((dropletModelId, impulse) => {
            const model = CollectionService.GetTagged("Droplet").find(
                (droplet) => droplet.Name === dropletModelId, // TODO: optimize by using a map
            ) as BasePart | undefined;
            if (model === undefined)
                // streamed out
                return;
            model.ApplyImpulse(impulse);
        });
    }
}
