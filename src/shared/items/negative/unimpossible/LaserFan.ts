import { TweenService } from "@rbxts/services";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";
import { weldModel } from "shared/utils/vrldk/BasePartUtils";

export = new Upgrader("LaserFan")
.setName("Laser Fan")
.setDescription("Increases droplet value by %mul%x compounding per blade.")
.setDifficulty(Difficulty.Unimpossible)
.setPrice(new Price().setCost("Funds", 150000), 1)
.setPrice(new Price().setCost("Funds", 350000), 2)
.addPlaceableArea("BarrenIslands")

.setMul(new Price().setCost("Funds", 1.3))
.onLoad((model, utils, item) => {
    const motor = model.WaitForChild("Motor") as Model;
    const bp = weldModel(motor);
    const o = bp.CFrame;
    let v = 0;
    let d = utils.getPlacedItem(model.Name)?.direction === true;
    const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Linear);
    item.repeat(model, () => {
        v += d ? 3 : -3;
        TweenService.Create(bp, tweenInfo, {CFrame: o.mul(CFrame.Angles(math.rad(v), 0, 0))}).Play();
    }, 0.1);
    (bp.WaitForChild("ProximityPrompt") as ProximityPrompt).Triggered.Connect(() => {
        d = !d;
        const pi = utils.getPlacedItem(model.Name);
        if (pi === undefined) {
            return;
        }
        pi.direction = d;
    });
});