import { Controller, OnStart } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import { Debris, TweenService, Workspace } from "@rbxts/services";
import { TRACKED_QUEST_WINDOW } from "client/constants";
import { EffectController } from "client/controllers/EffectController";
import { UIController } from "client/controllers/UIController";
import { SoundController } from "client/controllers/interface/SoundController";
import Price from "shared/Price";
import { AREAS, ASSETS, RESET_LAYERS } from "shared/constants";
import { Fletchette } from "@antivivi/fletchette";
import { OnoeNum } from "@antivivi/serikanum";

const SettingsCanister = Fletchette.getCanister("SettingsCanister");
const ResetCanister = Fletchette.getCanister("ResetCanister");

@Controller()
export class ResetController implements OnStart {

    constructor(private uiController: UIController, private effectController: EffectController, private SoundController: SoundController) {
        
    }

    moveCamera(instance: Instance) {
        const currentCamera = Workspace.CurrentCamera;
        if (currentCamera === undefined) {
            return;
        }
        if (currentCamera.CameraType !== Enum.CameraType.Scriptable) {
            if (this.SoundController.playing !== undefined) {
                this.SoundController.fadeOut(this.SoundController.playing);
                task.delay(1.35, () => {
                    if (this.SoundController.playing !== undefined)
                        this.SoundController.fadeIn(this.SoundController.playing);
                });
            }
            currentCamera.CameraType = Enum.CameraType.Scriptable;
            const toCframe = (instance as BasePart).CFrame;
            TweenService.Create(currentCamera, new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { CFrame: toCframe }).Play();
            task.delay(1, () => {
                this.uiController.playSound("Thunder");
                const lightning = ASSETS.Resets.WaitForChild("SkillificationLightning").Clone() as BasePart;
                lightning.Parent = Workspace;
                TweenService.Create(lightning, new TweenInfo(1), { Transparency: 1 }).Play();
                task.delay(0.35, () => {
                    const effects = lightning.GetChildren();
                    for (const effect of effects) {
                        if (effect.IsA("ParticleEmitter"))
                            effect.Enabled = false;
                    }
                    currentCamera.CameraType = Enum.CameraType.Custom;
                    this.effectController.camShake.Shake(CameraShaker.Presets.Bump);
                    this.effectController.showQuestMessage(TRACKED_QUEST_WINDOW.Reset);
                });
                Debris.AddItem(lightning, 2);
            });
        }
    }

    onStart() {
        ResetCanister.reset.connect((layer, amount) => {
            if (SettingsCanister.settings.get().ResetAnimation === false)
                return;
            const resetLayer = RESET_LAYERS[layer];
            TRACKED_QUEST_WINDOW.Reset.AmountLabel.Text = Price.getFormatted(resetLayer.gives, new OnoeNum(amount)).upper();
            this.moveCamera(resetLayer.area.areaFolder.WaitForChild("ResetCamera"))
            this.uiController.playSound("MagicWoosh");
        });
    }
}