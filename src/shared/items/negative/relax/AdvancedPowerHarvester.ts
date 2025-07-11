import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import { PowerHarvester } from "shared/item/Special";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { OnoeNum } from "@antivivi/serikanum";

const limit = OnoeNum.fromSerika(50, 12);
const mul = new Price().setCost("Funds", 0).setCost("Power", 0);

export = new Furnace("AdvancedPowerHarvester")
.setName("Advanced Power Harvester")
.setDescription("A relaxing harvester... Funds boost is 400x that of Power, maxing out at 50T W.")
.setDifficulty(Difficulty.Relax)
.setPrice(new Price().setCost("Power", 812e6).setCost("Purifier Clicks", 400), 1)
.addPlaceableArea("BarrenIslands")

.setFormula(new Formula().add(1).log(21).mul(0.8).add(1))
.onInit((utils, item) => item.applyFormula((v) => item.setMul(mul.setCost("Funds", v.mul(400)).setCost("Power", v)), () => {
    const cost = new OnoeNum(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lessThan(cost)) {
        return limit;
    }
    return cost;
}))
.onLoad((model) => PowerHarvester.spin(model));