import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/Furnace";
import { PowerHarvester } from "shared/item/Special";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

const mul = new Price().setCost("Funds", 0).setCost("Power", 0);

export = new Furnace(script.Name)
    .setName("Advanced Power Harvester")
    .setDescription("A relaxing harvester... Boost ratio is 1 W : $400, where Funds will be boosted x400 more. Maxes out at %cap%.")
    .setDifficulty(Difficulty.Relax)
    .setPrice(new Price().setCost("Power", 812e6).setCost("Purifier Clicks", 400), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(5).mul(0.9).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 50e12))
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v.mul(400)).setCost("Power", v)), () => GameUtils.currencyService.getCost("Power"))
    .onClientLoad((model) => PowerHarvester.spin(model));