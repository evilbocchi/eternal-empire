import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import { PowerHarvester } from "shared/item/Special";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { OnoeNum } from "@antivivi/serikanum";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

const limit = new OnoeNum(15000000);
const mul = new Price().setCost("Funds", 0).setCost("Power", 0);

export = new Furnace("BasicPowerHarvester")
.setName("Basic Power Harvester")
.setDescription("Utilises the power of True Ease to somehow collect more Power from droplets. Funds boost is 400x that of Power, maxing out at 15M W.")
.setDifficulty(Difficulty.TrueEase)
.setPrice(new Price().setCost("Funds", 1.56e12).setCost("Power", 18000), 1)
.addPlaceableArea("BarrenIslands")

.setFormula(new Formula().add(1).log(20).mul(0.5).add(1))
.onInit((utils, item) => item.applyFormula((v) => item.setMul(mul.setCost("Funds", v.mul(400)).setCost("Power", v)), () => {
    const cost = new OnoeNum(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lessThan(cost)) {
        return limit;
    }
    return cost;
}))
.onLoad((model) => {
    const cube = PowerHarvester.spin(model);
    rainbowEffect(cube, 2);

});