import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const mul = new Price().setCost("Bitcoin", 0);

export = new Upgrader(script.Name)
    .setName("Coin Refiner")
    .setDescription("Boosts Bitcoin gain, with that multiplier increasing by Bitcoin.")
    .setDifficulty(Difficulty.DoNothing)
    .setPrice(new Price().setCost("Funds", 70e24).setCost("Bitcoin", 360), 1)
    .setPrice(new Price().setCost("Funds", 620e24).setCost("Bitcoin", 1200), 2)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("CoPKaDT")
    .persists("Skillification")

    .setFormula(new Formula().add(1).pow(0.1).add(1))
    .setFormulaX("bitcoin")
    .applyFormula((v, item) => item.setMul(mul.setCost("Bitcoin", v)), () => GameUtils.currencyService.getCost("Bitcoin"));