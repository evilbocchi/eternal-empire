import Price from "shared/Price";
import { AREAS } from "shared/constants";
import Difficulties from "shared/difficulty/Difficulties";
import Upgrader from "shared/item/Upgrader";
import InfiniteMath from "shared/utils/infinitemath/InfiniteMath";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";
import EnergisedRefiner from "../friendliness/EnergisedRefiner";

export = new Upgrader("ShockingRefiner")
.setName("Shocking Refiner")
.setDescription("Gives droplets a bigger shock than an Energised Refiner. Funds boost increases with Power, maxing out at 4B W. Uses 2K W/s. <log13((2 * power) + 1) + 1>")
.setDifficulty(Difficulties.Exist)
.setPrice(new Price().setCost("Funds", new InfiniteMath([16.25, 15])).setCost("Power", 1760000), 1)
.setPrice(new Price().setCost("Funds", new InfiniteMath([30.6, 15])).setCost("Power", 3240000), 2)
.setRequiredItemAmount(EnergisedRefiner, 1)
.addPlaceableArea(AREAS.BarrenIslands)

.onInit((utils, item) => utils.applyFormula((v) => item.setMul(v), () => {
    const cost = new InfiniteMath(utils.getBalance().getCost("Power") ?? 0);
    const limit = new InfiniteMath([4, 9]);
    if (limit.lt(cost)) {
        return limit;
    }
    return cost;
}, 
    (x) => (new Price().setCost("Funds", InfiniteMath.log(x.mul(2).add(1), 13).add(1)))))
.setMaintenance(new Price().setCost("Power", 2000))
.onLoad((model) => {
    for (const part of model.GetChildren()) {
        if (part.Name === "Color" && part.IsA("BasePart"))
            rainbowEffect(part, 3)
    }
});