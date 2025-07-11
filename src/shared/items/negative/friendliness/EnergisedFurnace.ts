import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Furnace from "shared/item/Furnace";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const mul = new Price().setCost("Funds", 0);

export = new Furnace(script.Name)
    .setName("Energised Furnace")
    .setDescription("Same thing as Energised Refiner, with Funds boost increasing with Power at a slightly weaker scale, maxing out at %cap%. Uses %drain%.")
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new Price().setCost("Power", 75), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(4).mul(100).add(250))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 25000))
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v)), () => GameUtils.currencyService.getCost("Power"))
    .setDrain(new Price().setCost("Power", 0.5));