import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/Furnace";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const mul = new Price().setCost("Funds", 0);

export = new Furnace(script.Name)
    .setName("Shocking Cauldron")
    .setDescription("A cauldron that scales with Power. Maxes out at %cap%, but uses %drain%.")
    .setDifficulty(Difficulty.FelixTheA)
    .setPrice(new Price().setCost("Funds", 30.8e12), 1)
    .addPlaceableArea("BarrenIslands")
    .acceptsUpgrades(false)

    .setDrain(new Price().setCost("Power", 45))
    .setFormula(new Formula().add(1).log(10).mul(1420000).add(2000000))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 500e6))
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v)), () => GameUtils.currencyService.getCost("Power"));