import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import { GameAPI } from "shared/item/ItemUtils";
import Furnace from "shared/item/traits/Furnace";
import FormulaBundled from "shared/item/traits/special/FormulaBundled";

const mul = new CurrencyBundle().set("Funds", 0).set("Power", 0);

export = new Item(script.Name)
    .setName("Basic Power Harvester")
    .setDescription("Utilises the power of True Ease to somehow collect more Power from droplets. The boost increases when you have more Power, and maxes out at %cap%.")
    .setDifficulty(Difficulty.TrueEase)
    .setPrice(new CurrencyBundle().set("Funds", 1.56e12).set("Power", 18000), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(3).mul(0.5).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 15000000))

    .trait(FormulaBundled)
    .setRatio("Power", 1)
    .setRatio("Funds", 400)
    .setX(() => GameAPI.currencyService.get("Power"))
    .apply(Furnace)

    .exit();