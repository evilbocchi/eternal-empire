import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const mul = new Price().setCost("Funds", 0);

export = new Upgrader(script.Name)
    .setName("Energised Refiner")
    .setDescription("Power your items up. This upgrader has a Funds boost that increases with the amount of Power you own, maxing out when you reach %cap%. Uses %drain%.")
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new Price().setCost("Power", 20), 1)
    .setPrice(new Price().setCost("Power", 120), 2)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(3).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 5000))
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v)), () => GameUtils.currencyService.getCost("Power"))
    .setDrain(new Price().setCost("Power", 0.4));