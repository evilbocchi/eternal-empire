import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { OnoeNum } from "@antivivi/serikanum";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

const limit = OnoeNum.fromSerika(10, 12);
const mul = new Price().setCost("Funds", 0).setCost("Power", 0);

export = new Upgrader("EffervescentDropletSpray")
.setName("Effervescent Droplet Spray")
.setDescription("Rinses droplets to make them sparkling clean! Funds boost is 2/3 that of Power. Maxes out at 10T W.")
.setDifficulty(Difficulty.Exist)
.setPrice(new Price().setCost("Funds", 504e12), 1)
.addPlaceableArea("BarrenIslands")

.onLoad((model) => rainbowEffect(model.WaitForChild("Conveyor") as BasePart, 3))
.setFormula(new Formula().div(20).add(1).log(20).mul(0.3).add(1))
.onInit((utils, item) => item.applyFormula((v) => item.setMul(mul.setCost("Funds", v.mul(0.666)).setCost("Power", v)), () => {
    const cost = new OnoeNum(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lessThan(cost)) {
        return limit;
    }
    return cost;
}));