import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import { OnoeNum } from "@antivivi/serikanum";
import Formula from "shared/utils/Formula";

const limit = new OnoeNum(5000);
const mul = new Price().setCost("Funds", 0);

export = new Upgrader("EnergisedRefiner")
.setName("Energised Refiner")
.setDescription("Funds boost increases with Power, maxing out at 5K W. Uses 0.4 W/s.")
.setDifficulty(Difficulty.Friendliness)
.setPrice(new Price().setCost("Power", 20), 1)
.setPrice(new Price().setCost("Power", 120), 2)
.addPlaceableArea("BarrenIslands")

.setFormula(new Formula().add(1).log(13).add(1))
.onInit((utils, item) => item.applyFormula((v) => item.setMul(mul.setCost("Funds", v)), () => {
    const cost = new OnoeNum(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lessThan(cost)) {
        return limit;
    }
    return cost;
}))
.setDrain(new Price().setCost("Power", 0.4));