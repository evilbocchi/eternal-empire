import { TweenService } from "@rbxts/services";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Upgrader from "shared/item/Upgrader";
import { weldModel } from "shared/utils/vrldk/BasePartUtils";

export = new Upgrader("LaserFan")
.setName("Laser Fan")
.setDescription("If you've played tower defense games, you know exactly how to utilise this. Increases droplet value by $1.3x compounding per blade.")
.setDifficulty(Difficulties.Unimpossible)
.setPrice(new Price().setCost("Funds", 150000), 1)
.setPrice(new Price().setCost("Funds", 350000), 2)
.addPlaceableArea(AREAS.BarrenIslands)

.setMul(new Price().setCost("Funds", 1.3))
.onLoad((model, _utils, item) => {
    const motor = model.WaitForChild("Motor") as Model;
    const bp = weldModel(motor);
    const o = bp.CFrame;
    let v = 0;
    let d = 3;
    const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Linear);
    item.repeat(model, () => {
        v += d;
        TweenService.Create(bp, tweenInfo, {CFrame: o.mul(CFrame.Angles(math.rad(v), 0, 0))}).Play();
    }, 0.1);
    (bp.WaitForChild("ProximityPrompt") as ProximityPrompt).Triggered.Connect(() => d = -d);
});