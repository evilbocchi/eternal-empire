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
import CameraShaker from "@rbxts/camera-shaker";
import { Debris, Lighting, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { PingManager } from "client/ui/components/stats/StatsWindow";
import { AREAS } from "shared/Area";
import { getSound, SOUND_EFFECTS_GROUP } from "shared/asset/GameAssets";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { DROPLET_STORAGE } from "shared/item/Droplet";
import ItemUtils from "shared/item/ItemUtils";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

/**
 * Controller responsible for managing world effects, item visuals, and area lighting.
 *
 * Handles tag-based effects, droplet/item visuals, quest message animation, and area lighting changes.
 */
@Controller()
export default class EffectController implements OnInit {
    /** Camera shaker instance for world effects. */
    camShake = new CameraShaker(Enum.RenderPriority.Camera.Value, (shakeCFrame) => {
        const cam = Workspace.CurrentCamera;
        if (cam !== undefined) cam.CFrame = cam.CFrame.mul(shakeCFrame);
    });
    /** Map of droplet parts to their original size. */
    sizePerDrop = new Map<BasePart, Vector3>();
    /** Delay value for ping calculation. */
    delay = 0.2;

    /**
     * Loads item effects for a given model instance.
     * @param model The item model instance.
     */
    load(model: Instance) {
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

        Packets.dropletAdded.fromServer((drop?: BasePart) => {
            if (!drop) return;

            const originalSize = drop.GetAttribute("OriginalSize") as Vector3 | undefined;
            if (originalSize === undefined) return;

            if (ItemUtils.UserGameSettings!.SavedQualityLevel.Value > 1) {
                drop.Size = originalSize.add(new Vector3(0.15, 0.825, 0.15));
                TweenService.Create(drop, new TweenInfo(0.3), { Size: originalSize }).Play();
            }
        });
    }

    /**
     * Initializes the EffectController, sets up effect listeners and area lighting changes.
     */
    onInit() {
        task.spawn(() => {
            while (task.wait(2)) {
                for (const child of PLACED_ITEMS_FOLDER.GetChildren()) {
                    this.load(child);
                }
            }
        });
        this.loadTags();
        PLACED_ITEMS_FOLDER.ChildAdded.Connect((child) => this.load(child));

        for (const item of PLACED_ITEMS_FOLDER.GetChildren()) {
            this.load(item);
        }

        this.camShake.Start();
        Packets.camShake.fromServer(() => this.camShake.Shake(CameraShaker.Presets.Bump));
        Packets.savingEmpire.fromServer((status) => {
            if (status === 500) {
                warn("Empire saving failed.");
            }
        });

        Packets.dropletBurnt.fromServer((dropletModelId) => {
            const droplet = DROPLET_STORAGE.FindFirstChild(dropletModelId) as BasePart | undefined;
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
            const model = DROPLET_STORAGE.FindFirstChild(dropletModelId) as BasePart | undefined;
            if (model === undefined)
                // streamed out
                return;
            model.ApplyImpulse(impulse);
        });

        const defaultLighting = {
            Ambient: Lighting.Ambient,
            OutdoorAmbient: Lighting.OutdoorAmbient,
            EnvironmentDiffuseScale: Lighting.EnvironmentDiffuseScale,
            EnvironmentSpecularScale: Lighting.EnvironmentSpecularScale,
            FogEnd: Lighting.FogEnd,
            FogStart: Lighting.FogStart,
            FogColor: Lighting.FogColor,
            Brightness: Lighting.Brightness,
        };
        const onAreaChanged = () => {
            const lightingConfig = AREAS[LOCAL_PLAYER.GetAttribute("Area") as AreaId]?.lightingConfiguration;
            Lighting.Ambient = lightingConfig === undefined ? defaultLighting.Ambient : lightingConfig.Ambient;
            Lighting.OutdoorAmbient =
                lightingConfig === undefined ? defaultLighting.OutdoorAmbient : lightingConfig.OutdoorAmbient;
            Lighting.EnvironmentDiffuseScale =
                lightingConfig === undefined
                    ? defaultLighting.EnvironmentDiffuseScale
                    : lightingConfig.EnvironmentDiffuseScale;
            Lighting.EnvironmentSpecularScale =
                lightingConfig === undefined
                    ? defaultLighting.EnvironmentSpecularScale
                    : lightingConfig.EnvironmentSpecularScale;
            Lighting.FogEnd = lightingConfig === undefined ? defaultLighting.FogEnd : lightingConfig.FogEnd;
            Lighting.FogStart = lightingConfig === undefined ? defaultLighting.FogStart : lightingConfig.FogStart;
            Lighting.FogColor = lightingConfig === undefined ? defaultLighting.FogColor : lightingConfig.FogColor;
            Lighting.Brightness = lightingConfig === undefined ? defaultLighting.Brightness : lightingConfig.Brightness;
        };
        LOCAL_PLAYER.GetAttributeChangedSignal("Area").Connect(() => onAreaChanged());
        onAreaChanged();
    }
}
