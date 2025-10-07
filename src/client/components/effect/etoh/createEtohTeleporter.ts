import { Players, TweenService } from "@rbxts/services";
import { playSound } from "shared/asset/GameAssets";

/**
 * Upstream EToH teleporter script adapted for client-side use.
 * @param model The teleporter model
 * @returns A function to initialize the teleporter
 */
export default function createEtohTeleporter(model: Model) {
    const easingStyle = Enum.EasingStyle.Quad; // FEEL FREE TO CHANGE THIS
    const easingDirection = Enum.EasingDirection.Out; // FEEL FREE TO CHANGE THIS

    function tween(part: BasePart, twTime: number, inf: Partial<TweenInfo & { CFrame?: CFrame }>) {
        const tweenInfo = new TweenInfo(twTime, easingStyle, easingDirection, 0, false, 0);
        const tween = TweenService.Create(part, tweenInfo, inf);
        tween.Play();
        tween.Completed.Connect(() => {
            tween.Destroy();
        });
    }

    function teleport(part: BasePart, newCF: CFrame) {
        if (part.Anchored) return;

        const transitionTime = model.FindFirstChild("TransitionTime") as NumberValue | undefined;
        if (transitionTime && transitionTime.Value > 0) {
            part.Anchored = true;
            tween(part, transitionTime.Value, { CFrame: newCF });
            task.wait(transitionTime.Value);
            part.Anchored = false;
        } else {
            part.CFrame = newCF;
        }

        const keepVelocity = model.FindFirstChild("KeepVelocity") as BoolValue | undefined;
        if (keepVelocity && !keepVelocity.Value) {
            part.AssemblyLinearVelocity = Vector3.zero;
            part.AssemblyAngularVelocity = Vector3.zero;
        }
    }

    return () => {
        const destinations: Array<BasePart> = [];

        for (const tp of model.GetDescendants()) {
            if (tp.Name === "Destination" && tp.IsA("BasePart")) {
                destinations.push(tp);
            } else if (tp.Name === "Teleporter" && tp.IsA("BasePart")) {
                if (tp.FindFirstChild("ButtonActivated")) {
                    const a = new Instance("BoolValue");
                    a.Name = "Activated";
                    a.Parent = tp;
                    if (tp.FindFirstChild("Invert")) {
                        a.Value = true;
                    }
                }
                tp.LocalTransparencyModifier = 1;
                tp.Touched.Connect((t) => {
                    const activated = tp.FindFirstChild("Activated") as BoolValue | undefined;
                    if (activated && !activated.Value) return;

                    const dests = destinations.filter((d) => {
                        const act = d.FindFirstChild("Activated") as BoolValue | undefined;
                        return !(act && !act.Value);
                    });
                    if (dests.size() <= 0) return;
                    const d = dests[math.random(0, dests.size() - 1)];

                    const teleportPushboxes = (model.FindFirstChild("TeleportPushboxes") as BoolValue | undefined)
                        ?.Value;
                    if (teleportPushboxes && (t.Name === "Pushbox" || t.FindFirstChild("IsBox"))) {
                        playSound("Teleport.mp3");
                        teleport(t, d.GetPivot()!.add(new Vector3(0, 5, 0)));
                    }

                    const teleportPlayers = (model.FindFirstChild("TeleportPlayers") as BoolValue | undefined)?.Value;
                    const player = Players.GetPlayerFromCharacter(t.Parent);
                    if (teleportPlayers && player === Players.LocalPlayer) {
                        playSound("Teleport.mp3");
                        const primaryPart = (t.Parent as Model).PrimaryPart;
                        if (primaryPart) {
                            teleport(primaryPart, d.GetPivot()!.add(new Vector3(0, 5, 0)));
                        }
                    }
                });
            }
        }
    };
}
