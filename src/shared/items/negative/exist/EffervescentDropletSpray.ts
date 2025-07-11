import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

const mul = new Price().setCost("Funds", 0).setCost("Power", 0);

export = new Upgrader(script.Name)
    .setName("Effervescent Droplet Spray")
    .setDescription("Rinses droplets to make them sparkling clean! Boost ratio is 3 W : $2, meaning that Funds boost is 2/3 that of Power. Maxes out at %cap%.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new Price().setCost("Funds", 504e12), 1)
    .addPlaceableArea("BarrenIslands")

    .onLoad((model) => rainbowEffect(model.WaitForChild("Conveyor") as BasePart, 3))
    .setFormula(new Formula().div(20).add(1).log(4).mul(0.3).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 10e12))
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v.mul(0.666)).setCost("Power", v)), () => GameUtils.currencyService.getCost("Power"));