import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

const limit = new InfiniteMath([100, 15]);

export = new Furnace("MoltenAltar")
.setName("Molten Altar")
.setDescription("Burn the sacrifice. Funds gain is 400x that of Power, maxing out at 100Qd W. <2 * log19(power + 1) + 1>")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Funds", new InfiniteMath([21.3, 21])).setCost("Power", new InfiniteMath([14.2, 12])), 1)
.addPlaceableArea(AREAS.BarrenIslands)

.onInit((utils, item) => item.applyFormula((v) => item.setFormula((val) => val.mul(v)), () => {
    const cost = new InfiniteMath(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lt(cost)) {
        return limit;
    }
    return cost;
}, 
    (x) => {
        const y = InfiniteMath.log(x.add(1), 19).mul(2).add(1);
        return new Price().setCost("Funds", y.mul(400)).setCost("Power", y);
    }));