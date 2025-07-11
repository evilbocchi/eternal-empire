import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/Furnace";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const mul = new Price();

export = new Furnace(script.Name)
    .setName("Glistening Furnace")
    .setDescription("The far successor to the Energised Furnace. Was that nostalgic? Boost Skill with Power. Maxes out at %cap%.")
    .setDifficulty(Difficulty.AutomaticJoyful)
    .setPrice(new Price().setCost("Power", 4e21).setCost("Skill", 6000), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .persists("Skillification")

    .setFormula(new Formula().div(1e18).add(10).pow(0.12))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 1e27))
    .applyFormula((v, item) => item.setMul(mul.setCost("Skill", v)), () => GameUtils.currencyService.getCost("Power"));