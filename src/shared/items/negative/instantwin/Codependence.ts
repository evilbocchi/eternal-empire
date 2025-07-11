import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import Price from "shared/Price";
import Charger from "shared/item/Charger";
import { PowerHarvester } from "shared/item/Special";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";
import BasicBlankEssence from "./BasicBlankEssence";

const div = OnoeNum.fromSerika(5, 12);
const mul = new Price().setCost("Funds", 0).setCost("Power", 0);

export = new Charger(script.Name)
    .setName("Codependence")
    .setDescription("The solest form, bewitchering and blood-sucking. A charger that boosts Funds and Power with Power in its entire area, maxing out at %cap%. Ignores charge limits.")
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new Price().setCost("Power", 1e12), 1)
    .setRequiredItemAmount(BasicBlankEssence, 1)
    .addPlaceableArea("BarrenIslands")

    .ignoresLimit(true)
    .setRadius(999)
    .setFormula(new Formula().div(div).add(1).log(12).pow(1.6).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new Price().setCost("Power", 1e33))
    .applyFormula((v, item) => item.setMul(mul.setCost("Funds", v).setCost("Power", v)), () => GameUtils.currencyService.getCost("Power"))
    .onClientLoad((model) => PowerHarvester.spin(model));