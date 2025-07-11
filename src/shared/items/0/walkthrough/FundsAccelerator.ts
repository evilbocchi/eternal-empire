import Difficulty from "@antivivi/jjt-difficulties";
import Price from "shared/Price";
import Upgrader from "shared/item/Upgrader";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const mul = new Price().setCost("Funds", 0);

export = new Upgrader(script.Name)
    .setName("Funds Accelerator")
    .setDescription("Progress is slow? No longer. Boosts Funds gain, with that multiplier increasing by Funds.")
    .setDifficulty(Difficulty.Walkthrough)
    .setPrice(new Price().setCost("Funds", 200e33).setCost("Skill", 1200), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .setSpeed(4)
    .setFormula(new Formula().div(1e30).add(1).pow(0.1))
    .setFormulaX("funds")
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v)), () => GameUtils.currencyService.getCost("Funds"));