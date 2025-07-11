import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/Furnace";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const mul = new Price().setCost("Funds", 0);

export = new Furnace(script.Name)
    .setName("Robotic Cauldron")
    .setDescription("When Move-Your-Droplets™ tried branching out from producing conveyors, they experimented with all sorts of different machinery. Their final creation before going back to their ways was this abomination of a cauldron on legs. Boost ratio is 1 W : $1200. Scales with Power, maxing out at %cap%.")
    .setDifficulty(Difficulty.Walkthrough)
    .setPrice(new Price().setCost("Funds", 600e33).setCost("Power", 6e18), 1)
    .addPlaceableArea("BarrenIslands")
    .acceptsUpgrades(false)

    .setFormula(new Formula().add(1).log(5).mul(840).add(500))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 10e24))
    .applyFormula((v, item) => item.setMul(mul.setCost("Power", v).setCost("Funds", v.mul(1200))), () => GameUtils.currencyService.getCost("Power"));