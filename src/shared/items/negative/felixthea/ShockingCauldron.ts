import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";

const limit = new InfiniteMath([500, 6]);

export = new Furnace("ShockingCauldron")
.setName("Shocking Cauldron")
.setDescription("The step up. Maxes out at 500M W, but uses 45 W/s. <750K * log5(power + 1) + 600K>")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", new InfiniteMath([30.8, 12])), 1)
.addPlaceableArea(AREAS.BarrenIslands)
.acceptsUpgrades(false)

.setMaintenance(new Price().setCost("Power", 45))
.onInit((utils, item) => item.applyFormula((v) => item.setFormula((val) => val.mul(v)), () => {
    const cost = new InfiniteMath(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lt(cost)) {
        return limit;
    }
    return cost;
}, 
    (x) => (new Price().setCost("Funds", InfiniteMath.log(x.add(1), 5).mul(750000).add(600000)))));