import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

const limit = new InfiniteMath(5000);

export = new Upgrader("EnergisedRefiner")
.setName("Energised Refiner")
.setDescription("Funds boost increases with Power, maxing out at 5K W. Uses 0.4 W/s. <log13(power + 1) + 1>")
.setDifficulty(Difficulty.Friendliness)
.setPrice(new Price().setCost("Power", 20), 1)
.setPrice(new Price().setCost("Power", 120), 2)
.addPlaceableArea(AREAS.BarrenIslands)

.onInit((utils, item) => item.applyFormula((v) => item.setMul(v), () => {
    const cost = new InfiniteMath(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lt(cost)) {
        return limit;
    }
    return cost;
}, 
    (x) => (new Price().setCost("Funds", InfiniteMath.log(x.add(1), 13).add(1)))))
.setMaintenance(new Price().setCost("Power", 0.4));