import { RunService, TweenService } from "@rbxts/services";
import { weldModel } from "@antivivi/vrldk";

export namespace HandCrank {
    export function load(model: Model, callback: (timeSinceCrank: number) => void) {
        let t = 0;
        const crank = model.WaitForChild("Crank") as Model;
        const v = new Instance("IntValue");
        const bp = weldModel(crank);
        const o = bp.CFrame;
        v.Value = 0;
        v.Parent = crank;
        const c1 = RunService.Heartbeat.Connect(() => {
            bp.CFrame = o.mul(CFrame.Angles(0, 0, math.rad(v.Value)));
            callback(tick() - t);
        });
        const sound = crank.FindFirstChildOfClass("Sound");
        const pp = bp.FindFirstChildOfClass("ProximityPrompt");
        if (pp === undefined || sound === undefined) return;
        let tween: Tween | undefined = undefined;
        pp.Triggered.Connect(() => {
            if (tick() - t > 1) {
                t = tick();
                sound.Play();
                if (tween === undefined || tween.PlaybackState === Enum.PlaybackState.Completed) {
                    v.Value = 0;
                    tween = TweenService.Create(v, new TweenInfo(1), { Value: 360 });
                    tween.Play();
                }
            }
        });
        model.Destroying.Once(() => c1.Disconnect());
    }
}
