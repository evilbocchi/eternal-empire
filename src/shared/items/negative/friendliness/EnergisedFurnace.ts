import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulty from "shared/Difficulty";
import Furnace from "shared/item/Furnace";
import { OnoeNum } from "@antivivi/serikanum";
import Formula from "shared/utils/Formula";

const limit = new OnoeNum(25000);
const mul = new Price().setCost("Funds", 0);

export = new Furnace("EnergisedFurnace")
.setName("Energised Furnace")
.setDescription("Same thing as Energised Refiner, with Funds boost increasing with Power at a slightly weaker scale, maxing out at 25K W. Uses 0.5 W/s.")
.setDifficulty(Difficulty.Friendliness)
.setPrice(new Price().setCost("Power", 75), 1)
.addPlaceableArea("BarrenIslands")

.setFormula(new Formula().add(1).log(15).mul(100).add(250))
.onInit((utils, item) => item.applyFormula((v) => item.setMul(mul.setCost("Funds", v)), () => {
    const cost = new OnoeNum(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lessThan(cost)) {
        return limit;
    }
    return cost;
}))
.setDrain(new Price().setCost("Power", 0.5));