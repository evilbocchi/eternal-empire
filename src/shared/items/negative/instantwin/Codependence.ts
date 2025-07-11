import Difficulty from "shared/Difficulty";
import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Charger from "shared/item/Charger";
import { PowerHarvester } from "shared/item/Special";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import BasicBlankEssence from "./BasicBlankEssence";

const div = new InfiniteMath([5, 12]);
const limit = new InfiniteMath([1, 33]);

export = new Charger("Codependence")
.setName("Codependence")
.setDescription("The solest form, bewitchering and blood-sucking. A charger that boosts Funds and Power with Power in its entire area, maxing out at 1De W. <log25(power / 5T + 1) + 1>")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Power", new InfiniteMath([1, 12])), 1)
.setRequiredItemAmount(BasicBlankEssence, 1)
.addPlaceableArea(AREAS.BarrenIslands)

.setRadius(999)
.onInit((utils, item) => item.applyFormula((v) => item.setMul(v), () => {
    const cost = new InfiniteMath(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lt(cost)) {
        return limit;
    }
    return cost;
}, 
(x) => {
    const y = InfiniteMath.log(x.div(div).add(1), 25).add(1);
    return new Price().setCost("Funds", y).setCost("Power", y);
}))
.onLoad((model) => {
    PowerHarvester.spin(model);
});