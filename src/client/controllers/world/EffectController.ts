//!native
//!optimize 2

import { observeTagAdded, playSoundAtPart, rainbowEffect } from "@antivivi/vrldk";
import { Controller, OnInit } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import { Debris, Lighting, TweenService, Workspace } from "@rbxts/services";
import { LOCAL_PLAYER } from "client/constants";
import { STATS_WINDOW } from "client/controllers/interface/StatsController";
import { AREAS } from "shared/Area";
import { PLACED_ITEMS_FOLDER } from "shared/constants";
import { getSound } from "shared/asset/GameAssets";
import { DROPLET_STORAGE } from "shared/item/Droplet";
import ItemUtils from "shared/item/ItemUtils";
import Items from "shared/items/Items";
import Packets from "shared/Packets";

@Controller()
export default class EffectController implements OnInit {

    camShake = new CameraShaker(
        Enum.RenderPriority.Camera.Value,
        shakeCFrame => {
            const cam = Workspace.CurrentCamera;
            if (cam !== undefined)
                cam.CFrame = cam.CFrame.mul(shakeCFrame);
        }
    );
    sizePerDrop = new Map<BasePart, Vector3>();
    delay = 0.2;

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

    showQuestMessage(frame: Frame) {
        const imageLabel = frame.FindFirstChildOfClass("ImageLabel");
        if (imageLabel === undefined)
            return;
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

    loadTags() {
        observeTagAdded("Rainbow", (instance) => rainbowEffect(instance as BasePart, 2), true);
        observeTagAdded("Spinner", (instance) => {
            if (!instance.IsA("BasePart"))
                return;

            const createRandomTween = () => {
                if (instance === undefined || instance.Parent === undefined)
                    return;

                const tween = TweenService.Create(instance, new TweenInfo(2, Enum.EasingStyle.Linear), { Orientation: new Vector3(math.random(0, 360), math.random(0, 360), math.random(0, 360)) });
                tween.Completed.Once(createRandomTween);
                tween.Play();
            };
            createRandomTween();
        }, true);

        const tweenInfo = new TweenInfo(2, Enum.EasingStyle.Linear);
        function rotationLoop(instance: BasePart, delta: number) {
            const tween = TweenService.Create(instance, tweenInfo, { CFrame: instance.CFrame.mul(CFrame.Angles(0, delta, 0)) });
            tween.Completed.Once(() => rotationLoop(instance, delta));
            tween.Play();
            return tween;
        }
        observeTagAdded("Clockwise", (instance) => {
            if (!instance.IsA("BasePart"))
                return;

            const tween = rotationLoop(instance, math.pi);
            return () => tween.Destroy();
        }, true);
        observeTagAdded("Anticlockwise", (instance) => {
            if (!instance.IsA("BasePart"))
                return;

            const tween = rotationLoop(instance, -math.pi);
            return () => tween.Destroy();
        }, true);


        Packets.dropletAdded.connect((drop: BasePart) => {
            const originalSize = drop.GetAttribute("OriginalSize") as Vector3 | undefined;
            if (originalSize === undefined)
                return;

            if (ItemUtils.UserGameSettings!.SavedQualityLevel.Value > 1) {
                drop.Size = originalSize.add(new Vector3(0.15, 0.825, 0.15));
                TweenService.Create(drop, new TweenInfo(0.3), { Size: originalSize }).Play();
            }
        });

    }

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
        Packets.camShake.connect(() => this.camShake.Shake(CameraShaker.Presets.Bump));
        Packets.savingEmpire.connect((status) => {
            if (status === 500) {
                warn("Empire saving failed.");
            }
        });

        const userId = LOCAL_PLAYER.UserId;
        Packets.dropletBurnt.connect((dropletModelId) => {
            const droplet = DROPLET_STORAGE.FindFirstChild(dropletModelId) as BasePart | undefined;
            if (droplet === undefined) // streamed out
                return;

            const t = tick();
            task.wait(droplet.GetAttribute("Owner") === userId ? 0.1 : 0.3);
            const burnSound = getSound("DropletBurn.mp3");
            burnSound.PlaybackSpeed = math.random() * 0.3 + 0.85;
            burnSound.Parent = droplet;
            burnSound.Play();
            const duration = droplet.Size.Magnitude / 2;
            TweenService.Create(droplet, new TweenInfo(duration), { Color: new Color3(), Size: new Vector3() }).Play();

            Debris.AddItem(droplet, 6);
            droplet.Anchored = true;

            this.delay = (((tick() - t) / 4) + this.delay) * 0.8;
            STATS_WINDOW.StatList.CurrentPing.AmountLabel.Text = math.floor(this.delay * 1000) + "ms";
        });
        Packets.applyImpulse.connect((dropletModelId, impulse) => {
            const model = DROPLET_STORAGE.FindFirstChild(dropletModelId) as BasePart | undefined;
            if (model === undefined) // streamed out
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
            Brightness: Lighting.Brightness
        };
        const onAreaChanged = () => {
            const lightingConfig = AREAS[LOCAL_PLAYER.GetAttribute("Area") as AreaId]?.lightingConfiguration;
            Lighting.Ambient = lightingConfig === undefined ? defaultLighting.Ambient : lightingConfig.Ambient;
            Lighting.OutdoorAmbient = lightingConfig === undefined ? defaultLighting.OutdoorAmbient : lightingConfig.OutdoorAmbient;
            Lighting.EnvironmentDiffuseScale = lightingConfig === undefined ? defaultLighting.EnvironmentDiffuseScale : lightingConfig.EnvironmentDiffuseScale;
            Lighting.EnvironmentSpecularScale = lightingConfig === undefined ? defaultLighting.EnvironmentSpecularScale : lightingConfig.EnvironmentSpecularScale;
            Lighting.FogEnd = lightingConfig === undefined ? defaultLighting.FogEnd : lightingConfig.FogEnd;
            Lighting.FogStart = lightingConfig === undefined ? defaultLighting.FogStart : lightingConfig.FogStart;
            Lighting.FogColor = lightingConfig === undefined ? defaultLighting.FogColor : lightingConfig.FogColor;
            Lighting.Brightness = lightingConfig === undefined ? defaultLighting.Brightness : lightingConfig.Brightness;
        };
        LOCAL_PLAYER.GetAttributeChangedSignal("Area").Connect(() => onAreaChanged());
        onAreaChanged();
    }
}