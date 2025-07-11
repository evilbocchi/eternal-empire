import Difficulty from "shared/Difficulty";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { OnoeNum } from "@antivivi/serikanum";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";
import EnergisedRefiner from "../friendliness/EnergisedRefiner";

const limit = OnoeNum.fromSerika(4, 12);
const mul = new Price().setCost("Funds", 0);

export = new Upgrader("ShockingRefiner")
.setName("Shocking Refiner")
.setDescription("Gives droplets a bigger shock than an Energised Refiner. Funds boost increases with Power, maxing out at 4T W. Uses 2K W/s.")
.setDifficulty(Difficulty.Exist)
.setPrice(new Price().setCost("Funds", 16.25e15).setCost("Power", 1760000), 1)
.setPrice(new Price().setCost("Funds", 24.6e15).setCost("Power", 3240000), 2)
.setRequiredItemAmount(EnergisedRefiner, 1)
.addPlaceableArea("BarrenIslands")

.setFormula(new Formula().mul(2).add(1).log(13).add(1))
.onInit((utils, item) => item.applyFormula((v) => item.setMul(mul.setCost("Funds", v)), () => {
    const cost = new OnoeNum(utils.getBalance().getCost("Power") ?? 0);
    if (limit.lessThan(cost)) {
        return limit;
    }
    return cost;
}))
.setDrain(new Price().setCost("Power", 2000))
.onLoad((model) => {
    for (const part of model.GetChildren()) {
        if (part.Name === "Color" && part.IsA("BasePart"))
            rainbowEffect(part, 3)
    }
});