import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import { GameUtils } from "shared/item/ItemUtils";
import Furnace from "shared/item/traits/Furnace";
import FormulaBundled from "shared/item/traits/special/FormulaBundled";

const mul = new CurrencyBundle().set("Funds", 0).set("Power", 0);

export = new Item(script.Name)
    .setName("Molten Altar")
    .setDescription("Burn the sacrifice. Boost increases with Power, maxing out at %cap%.")
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new CurrencyBundle().set("Funds", 21.3e21).set("Power", 14.2e12), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(4).mul(2).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 100e15))

    .trait(FormulaBundled)
    .setRatio("Power", 1)
    .setRatio("Funds", 400)
    .setX(() => GameUtils.currencyService.get("Power"))
    .apply(Furnace)

    .exit();