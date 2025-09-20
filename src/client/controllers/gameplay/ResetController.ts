/**
 * @fileoverview Client controller for handling reset events, animations, and camera effects.
 *
 * Handles:
 * - Listening for reset events and updating UI
 * - Playing reset animations, sounds, and camera transitions
 * - Integrating with EffectController and SoundController for feedback
 * - Displaying quest messages and updating tracked quest window
 *
 * The controller coordinates reset-related effects, UI, and sound, ensuring a smooth player experience during resets.
 *
 * @since 1.0.0
 */
import { Controller, OnInit } from "@flamework/core";
import { Debris, TweenService, Workspace } from "@rbxts/services";
import ShakeController from "client/controllers/world/ShakeController";
import { SoundManager } from "client/ui/components/SoundWindow";
import { ASSETS, playSound } from "shared/asset/GameAssets";
import { RESET_LAYERS } from "shared/currency/mechanics/ResetLayer";
import Packets from "shared/Packets";

declare global {
    interface Assets {
        Resets: Folder;
    }
}

/**
 * Controller responsible for handling reset events, animations, and camera effects.
 */
@Controller()
export default class ResetController implements OnInit {
    constructor(private shakeController: ShakeController) {}

    /**
     * Moves the camera to a given instance and plays reset effects and sounds.
     * @param instance The instance to move the camera to.
     */
    moveCamera(instance: Instance) {
        const currentCamera = Workspace.CurrentCamera;
        if (currentCamera === undefined) {
            return;
        }
        if (currentCamera.CameraType !== Enum.CameraType.Scriptable) {
            if (SoundManager.playing !== undefined) {
                SoundManager.fadeOut(SoundManager.playing);
                task.delay(1.35, () => {
                    if (SoundManager.playing !== undefined) SoundManager.fadeIn(SoundManager.playing);
                });
            }
            currentCamera.CameraType = Enum.CameraType.Scriptable;
            const toCframe = (instance as BasePart).CFrame;
            TweenService.Create(currentCamera, new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
                CFrame: toCframe,
            }).Play();
            task.delay(1, () => {
                playSound("Thunder.mp3");
                const lightning = ASSETS.Resets.WaitForChild("SkillificationLightning").Clone() as BasePart;
                lightning.Parent = Workspace;
                TweenService.Create(lightning, new TweenInfo(1), { Transparency: 1 }).Play();
                task.delay(0.35, () => {
                    const effects = lightning.GetChildren();
                    for (const effect of effects) {
                        if (effect.IsA("ParticleEmitter")) effect.Enabled = false;
                    }
                    currentCamera.CameraType = Enum.CameraType.Custom;
                    this.shakeController.shake();
                    // this.effectController.showQuestMessage(TRACKED_QUEST_WINDOW.Reset); TODO: Port to React
                });
                Debris.AddItem(lightning, 2);
            });
        }
    }

    /**
     * Initializes the ResetController, sets up reset event listeners and UI updates.
     */
    onInit() {
        Packets.reset.fromServer((layer, amount) => {
            if (Packets.settings.get()?.ResetAnimation === false) return;
            const resetLayer = RESET_LAYERS[layer];
            // TRACKED_QUEST_WINDOW.Reset.AmountLabel.Text = CurrencyBundle.getFormatted(
            //     resetLayer.gives,
            //     new OnoeNum(amount),
            // ).upper(); TODO: Port to React
            // this.moveCamera(resetLayer.area.areaFolder.WaitForChild("ResetCamera"));
            playSound("MagicCast.mp3");
        });
    }
}
