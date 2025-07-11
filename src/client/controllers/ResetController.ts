import { Controller, OnStart } from "@flamework/core";
import CameraShaker from "@rbxts/camera-shaker";
import { Debris, TweenService, Workspace } from "@rbxts/services";
import { TRACKED_QUEST_WINDOW } from "client/constants";
import { EffectController } from "client/controllers/EffectController";
import { UIController } from "client/controllers/UIController";
import { MusicController } from "client/controllers/interface/MusicController";
import Price from "shared/Price";
import { AREAS, UI_ASSETS } from "shared/constants";
import { Fletchette } from "shared/utils/fletchette";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

const SettingsCanister = Fletchette.getCanister("SettingsCanister");
const ResetCanister = Fletchette.getCanister("ResetCanister");

@Controller()
export class ResetController implements OnStart {

    constructor(private uiController: UIController, private effectController: EffectController, private musicController: MusicController) {
        
    }

    moveCamera(instance: Instance) {
        const currentCamera = Workspace.CurrentCamera;
        if (currentCamera === undefined) {
            return;
        }
        if (currentCamera.CameraType !== Enum.CameraType.Scriptable) {
            if (this.musicController.playing !== undefined) {
                this.musicController.fadeOut(this.musicController.playing);
                task.delay(1.35, () => {
                    if (this.musicController.playing !== undefined)
                        this.musicController.fadeIn(this.musicController.playing);
                });
            }
            currentCamera.CameraType = Enum.CameraType.Scriptable;
            const toCframe = (instance as BasePart).CFrame;
            TweenService.Create(currentCamera, new TweenInfo(1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { CFrame: toCframe }).Play();
            task.delay(1, () => {
                this.uiController.playSound("Thunder");
                const lightning = UI_ASSETS.Resets.WaitForChild("SkillificationLightning").Clone() as BasePart;
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
        ResetCanister.skillificating.connect((amount, currency) => {
            if (SettingsCanister.settings.get().ResetAnimation === false)
                return;
            TRACKED_QUEST_WINDOW.Reset.AmountLabel.Text = Price.getFormatted(currency, new InfiniteMath(amount)).upper();
            this.moveCamera(AREAS.BarrenIslands.areaFolder.WaitForChild("ResetCamera"))
            this.uiController.playSound("MagicWoosh");
        });
    }
}