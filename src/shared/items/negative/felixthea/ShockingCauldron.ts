import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { OnoeNum } from "@antivivi/serikanum";

const limit = OnoeNum.fromSerika(500, 6);
const mul = new Price().setCost("Funds", 0);

export = new Furnace("ShockingCauldron")
.setName("Shocking Cauldron")
.setDescription("A cauldron that scales with Power. Maxes out at 500M W, but uses 45 W/s.")
.setDifficulty(Difficulty.FelixTheA)
.setPrice(new Price().setCost("Funds", 30.8e12), 1)
.addPlaceableArea("BarrenIslands")
.acceptsUpgrades(false)

.setDrain(new Price().setCost("Power", 45))
.setFormula(new Formula().add(1).log(5).mul(750000).add(600000))
.onInit((utils, item) => item.applyFormula((v) => item.setMul(mul.setCost("Funds", v)), () => {
    const cost = new OnoeNum(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lessThan(cost)) {
        return limit;
    }
    return cost;
}));