import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

const limit = new InfiniteMath(25000);

export = new Furnace("EnergisedFurnace")
.setName("Energised Furnace")
.setDescription("Same thing as Energised Refiner, with Funds boost increasing with Power at a slightly weaker scale, maxing out at 25K W. Uses 0.5 W/s. <100 * log15(power + 1) + 250>")
.setDifficulty(Difficulty.Friendliness)
.setPrice(new Price().setCost("Power", 75), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.onInit((utils, item) => item.applyFormula((v) => item.setFormula((val) => val.mul(v)), () => {
    const cost = new InfiniteMath(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lt(cost)) {
        return limit;
    }
    return cost;
}, 
    (x) => (new Price().setCost("Funds", InfiniteMath.log(x.add(1), 15).mul(100).add(250)))))
.setMaintenance(new Price().setCost("Power", 0.5));