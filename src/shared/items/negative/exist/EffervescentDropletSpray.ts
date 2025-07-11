import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

export = new Upgrader("EffervescentDropletSpray")
.setName("Effervescent Droplet Spray")
.setDescription("Rinses droplets to make them sparkling clean! Funds boost is 2/3 that of Power. Maxes out at 1B W. <0.3 * log20(power / 20 + 1) + 1>")
.setDifficulty(Difficulties.Exist)
.setPrice(new Price().setCost("Funds", new InfiniteMath([504, 12])), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.onLoad((model) => rainbowEffect(model.WaitForChild("Conveyor") as BasePart, 3))
.onInit((utils, item) => utils.applyFormula((v) => item.setMul(v), () => {
    const cost = new InfiniteMath(utils.getBalance().getCost("Power") ?? 0);
    const limit = new InfiniteMath([1, 9]);
    if (limit.lt(cost)) {
        return limit;
    }
    return cost;
}, 
(x) => {
    const y = InfiniteMath.log(x.div(20).add(1), 20).mul(0.3).add(1);
    return new Price().setCost("Funds", y.mul(2/3)).setCost("Power", y);
}));