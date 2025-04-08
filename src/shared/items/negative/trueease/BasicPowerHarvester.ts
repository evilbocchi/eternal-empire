import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { GameUtils } from "shared/item/ItemUtils";

const mul = new CurrencyBundle().set("Funds", 0).set("Power", 0);

export = new Item(script.Name)
    .setName("Basic Power Harvester")
    .setDescription("Utilises the power of True Ease to somehow collect more Power from droplets. Power boost is the result of the formula while Funds boost is x400 of that (Boost Ratio: 1 W : $400). Maxes out at %cap%.")
    .setDifficulty(Difficulty.TrueEase)
    .setPrice(new CurrencyBundle().set("Funds", 1.56e12).set("Power", 18000), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(3).mul(0.5).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 15000000))

    .trait(Furnace)
    .applyFormula((v, furnace) => furnace.setMul(mul.set("Funds", v.mul(400)).set("Power", v)), () => GameUtils.currencyService.get("Power"))

    .exit();