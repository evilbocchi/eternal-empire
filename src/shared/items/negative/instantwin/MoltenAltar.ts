import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { OnoeNum } from "@antivivi/serikanum";

const limit = OnoeNum.fromSerika(100, 15);
const mul = new Price().setCost("Funds", 0).setCost("Power", 0);

export = new Furnace("MoltenAltar")
.setName("Molten Altar")
.setDescription("Burn the sacrifice. Funds gain is 400x that of Power, maxing out at 100Qd W.")
.setDifficulty(Difficulty.InstantWin)
.setPrice(new Price().setCost("Funds", 21.3e21).setCost("Power", 14.2e12), 1)
.addPlaceableArea("BarrenIslands")

.setFormula(new Formula().add(1).log(19).mul(2).add(1))
.onInit((utils, item) => item.applyFormula((v) => item.setMul(mul.setCost("Funds", v.mul(400)).setCost("Power", v)), () => {
    const cost = new OnoeNum(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lessThan(cost)) {
        return limit;
    }
    return cost;
}));