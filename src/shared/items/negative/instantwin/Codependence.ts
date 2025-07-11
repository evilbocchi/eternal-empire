import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import Charger from "shared/item/Charger";
import { PowerHarvester } from "shared/item/Special";
import Formula from "shared/utils/Formula";
import { OnoeNum } from "@antivivi/serikanum";
import BasicBlankEssence from "./BasicBlankEssence";

const div = OnoeNum.fromSerika(5, 12);
const limit = OnoeNum.fromSerika(1, 33);
const mul = new Price().setCost("Funds", 0).setCost("Power", 0);

export = new Charger("Codependence")
.setName("Codependence")
.setDescription("The solest form, bewitchering and blood-sucking. A charger that boosts Funds and Power with Power in its entire area, maxing out at 1De W. Ignores charge limits.")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Power", 1e12), 1)
.setRequiredItemAmount(BasicBlankEssence, 1)
.addPlaceableArea("BarrenIslands")

.ignoresLimit(true)
.setRadius(999)
.setFormula(new Formula().div(div).add(1).log(25).add(1))
.onInit((utils, item) => item.applyFormula((v) => item.setMul(mul.setCost("Funds", v).setCost("Power", v)), () => {
    const cost = new OnoeNum(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lessThan(cost)) {
        return limit;
    }
    return cost;
}))
.onLoad((model) => {
    PowerHarvester.spin(model);
});