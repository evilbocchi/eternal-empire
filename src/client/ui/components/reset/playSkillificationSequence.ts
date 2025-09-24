import { BaseOnoeNum } from "@antivivi/serikanum";
import { Debris, TweenService, Workspace } from "@rbxts/services";
import Shaker from "client/ui/components/effect/Shaker";
import SoundManager from "client/ui/SoundManager";
import { ASSETS, playSound } from "shared/asset/GameAssets";
import { AREAS } from "shared/world/Area";

declare global {
    interface Assets {
        Resets: Folder;
    }
}

export default function playSkillificationSequence(amount: BaseOnoeNum) {
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
        const instance = AREAS.BarrenIslands.worldNode.waitForInstance().WaitForChild("ResetCamera");
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
                Shaker.shake();
            });
            Debris.AddItem(lightning, 2);
        });
    }
}
