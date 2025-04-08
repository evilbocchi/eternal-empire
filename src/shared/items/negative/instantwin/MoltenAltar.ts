import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { GameUtils } from "shared/item/ItemUtils";

const mul = new CurrencyBundle().set("Funds", 0).set("Power", 0);

export = new Item(script.Name)
    .setName("Molten Altar")
    .setDescription("Burn the sacrifice. Funds gain is x400 that of Power, maxing out at %cap%.")
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new CurrencyBundle().set("Funds", 21.3e21).set("Power", 14.2e12), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(4).mul(2).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 100e15))

    .trait(Furnace)
    .applyFormula((v, item) => item.setMul(mul.set("Funds", v.mul(400)).set("Power", v)), () => GameUtils.currencyService.get("Power"))

    .exit();