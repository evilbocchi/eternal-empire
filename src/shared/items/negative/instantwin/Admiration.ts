import Difficulty from "@antivivi/jjt-difficulties";
import { OnoeNum } from "@antivivi/serikanum";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import Formula from "shared/currency/Formula";
import { GameUtils } from "shared/item/ItemUtils";
import BasicBlankEssence from "./BasicBlankEssence";

const div = OnoeNum.fromSerika(5, 12);
const mul = new CurrencyBundle().set("Funds", 0).set("Power", 0);

export = new Item(script.Name)
    .setName("Admiration")
    .setDescription("A gentle stream enchanting the air, taking the stage with a serene retreat... An upgrader boosting Funds and Power with Power, maxing out at %cap%.")
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new CurrencyBundle().set("Funds", 1e21), 1)
    .setRequiredItemAmount(BasicBlankEssence, 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().div(div).add(1).log(12).pow(1.6).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 1e33))

    .trait(Upgrader)
    .applyFormula((v, item) => item.setMul(mul.set("Funds", v).set("Power", v)), () => GameUtils.currencyService.get("Power"))

    .exit();