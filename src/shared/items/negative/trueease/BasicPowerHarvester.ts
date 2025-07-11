import { TweenService } from "@rbxts/services";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Furnace from "shared/item/Furnace";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Furnace("BasicPowerHarvester")
.setName("Basic Power Harvester")
.setDescription("Utilises the power of True Ease to somehow collect more Power from droplets. Funds boost is 400x that of Power, maxing out at 15M W. <0.5 * log20(power + 1) + 1>")
.setDifficulty(Difficulties.TrueEase)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1.56, 12])).setCost("Power", 18000), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.onInit((utils, item) => utils.applyFormula((v) => item.setFormula((val) => val.mul(v)), () => {
    const cost = new InfiniteMath(utils.getBalance().getCost("Power") ?? 0);
    const limit = new InfiniteMath(15000000);
    if (limit.lt(cost)) {
        return limit;
    }
    return cost;
}, 
(x) => {
    const y = InfiniteMath.log(x.add(1), 20).mul(0.5).add(1);
    return new Price().setCost("Funds", y.mul(400)).setCost("Power", y);
}))
.onLoad((model) => {
    const colorPart = model.WaitForChild("Color") as BasePart;
    rainbowEffect(colorPart, 2);
    let connection: RBXScriptConnection | undefined = undefined;
    const createRandoomTween = () => {
        const tween = TweenService.Create(colorPart, new TweenInfo(2, Enum.EasingStyle.Linear), { Orientation: new Vector3(math.random(0, 360), math.random(0, 360), math.random(0, 360)) });
        connection = tween.Completed.Once(() => createRandoomTween());
        tween.Play();
    };
    createRandoomTween();
    model.Destroying.Once(() => connection?.Disconnect());
});