import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/Furnace";
import { PowerHarvester } from "shared/item/Special";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";
import { rainbowEffect } from "shared/utils/vrldk/BasePartUtils";

const mul = new Price().setCost("Funds", 0).setCost("Power", 0);

export = new Furnace(script.Name)
    .setName("Basic Power Harvester")
    .setDescription("Utilises the power of True Ease to somehow collect more Power from droplets. Power boost is the result of the formula while Funds boost is x400 of that (Boost Ratio: 1 W : $400). Maxes out at %cap%.")
    .setDifficulty(Difficulty.TrueEase)
    .setPrice(new Price().setCost("Funds", 1.56e12).setCost("Power", 18000), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(3).mul(0.5).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 15000000))
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v.mul(400)).setCost("Power", v)), () => GameUtils.currencyService.getCost("Power"))
    .onClientLoad((model) => {
        const cube = PowerHarvester.spin(model);
        rainbowEffect(cube, 2);
    });