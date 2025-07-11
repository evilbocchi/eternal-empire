import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import Upgrader from "shared/item/Upgrader";
import EnergisedRefiner from "shared/items/negative/friendliness/EnergisedRefiner";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

const limit = OnoeNum.fromSerika(4, 12);
const mul = new Price().setCost("Funds", 0);

export = new Upgrader(script.Name)
    .setName("Shocking Refiner")
    .setDescription("Gives droplets a bigger shock than an Energised Refiner. Funds boost increases with Power, maxing out at %cap%. Uses %drain%.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new Price().setCost("Funds", 16.25e15).setCost("Power", 1760000), 1)
    .setPrice(new Price().setCost("Funds", 24.6e15).setCost("Power", 3240000), 2)
    .setRequiredItemAmount(EnergisedRefiner, 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().mul(2).add(1).log(3).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 4e12))
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v)), () => GameUtils.currencyService.getCost("Power"))
    .setDrain(new Price().setCost("Power", 2000))
    .onLoad((model) => {
        for (const part of model.GetChildren()) {
            if (part.Name === "Color" && part.IsA("BasePart"))
                rainbowEffect(part, 3);
        }
    });