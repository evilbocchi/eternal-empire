import Difficulty from "@antivivi/jjt-difficulties";
import Upgrader from "shared/item/Upgrader";
import Price from "shared/Price";
import Formula from "shared/utils/Formula";
import { GameUtils } from "shared/utils/ItemUtils";

export = new Upgrader(script.Name)
    .setName("Slamo Upgrader")
    .setDescription("This slamo wants to be a manumatic purifier, but unfortunately it couldn't. It settled to boost Funds and Bitcoin by... Purifier Clicks?")
    .setDifficulty(Difficulty.Happylike)
    .setPrice(new Price().setCost("Funds", 100e30), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("CoPKaDT")
    .persists("Skillification")

    .setSpeed(8)
    .setFormula(new Formula().div(1000000).add(10).log(7).pow(2).div(4).add(1))
    .setFormulaX("pclicks")
    .applyFormula((v, item) => item.setMul(new Price().setCost("Funds", v).setCost("Bitcoin", v)), () => GameUtils.currencyService.getCost("Purifier Clicks"));