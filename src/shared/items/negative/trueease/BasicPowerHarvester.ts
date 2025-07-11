import { TweenService } from "@rbxts/services";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import { PowerHarvester } from "shared/item/Special";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

const limit = new InfiniteMath(15000000);

export = new Furnace("BasicPowerHarvester")
.setName("Basic Power Harvester")
.setDescription("Utilises the power of True Ease to somehow collect more Power from droplets. Funds boost is 400x that of Power, maxing out at 15M W. <0.5 * log20(power + 1) + 1>")
.setDifficulty(Difficulty.TrueEase)
.setPrice(new Price().setCost("Funds", new InfiniteMath([1.56, 12])).setCost("Power", 18000), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.onInit((utils, item) => item.applyFormula((v) => item.setFormula((val) => val.mul(v)), () => {
    const cost = new InfiniteMath(utils.getBalance().getCost("Power") ?? 0);
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
    const cube = PowerHarvester.spin(model);
    rainbowEffect(cube, 2);

});