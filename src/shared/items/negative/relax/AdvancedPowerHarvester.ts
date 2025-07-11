import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import { PowerHarvester } from "shared/item/Special";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

const limit = new InfiniteMath([50, 12]);

export = new Furnace("AdvancedPowerHarvester")
.setName("Advanced Power Harvester")
.setDescription("A relaxing harvester... Funds boost is 400x that of Power, maxing out at 50T W. <0.8 * log21(power + 1) + 1>")
.setDifficulty(Difficulty.Relax)
.setPrice(new Price().setCost("Power", new InfiniteMath([812, 6])).setCost("Purifier Clicks", 400), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.onInit((utils, item) => item.applyFormula((v) => item.setFormula((val) => val.mul(v)), () => {
    const cost = new InfiniteMath(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lt(cost)) {
        return limit;
    }
    return cost;
}, 
(x) => {
    const y = InfiniteMath.log(x.add(1), 21).mul(0.8).add(1);
    return new Price().setCost("Funds", y.mul(400)).setCost("Power", y);
}))
.onLoad((model) => PowerHarvester.spin(model));