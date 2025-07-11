import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/Furnace";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const mul = new Price().setCost("Funds", 0).setCost("Power", 0);

export = new Furnace(script.Name)
    .setName("Molten Altar")
    .setDescription("Burn the sacrifice. Funds gain is 400x that of Power, maxing out at %cap%.")
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new Price().setCost("Funds", 21.3e21).setCost("Power", 14.2e12), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(4).mul(2).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 100e15))
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v.mul(400)).setCost("Power", v)), () => GameUtils.currencyService.getCost("Power"));