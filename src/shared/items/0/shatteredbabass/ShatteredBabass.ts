import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const mul = new Price().setCost("Funds", 0);

export = new Upgrader(script.Name)
    .setName(Difficulty.ShatteredBabass.name!)
    .setDescription("Shattered Babass is here to charge up your setup. Boosts Funds with Power. Maxes out at %cap%.")
    .setDifficulty(Difficulty.ShatteredBabass)
    .setPrice(new Price().setCost("Funds", 200e36).setCost("Power", 10e21).setCost("Skill", 200000), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().div(1e21).add(1).log(10).pow(1.5).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 1e303))
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v)), () => GameUtils.currencyService.getCost("Power"));