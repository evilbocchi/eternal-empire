import Difficulty from "@rbxts/ejt";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import FormulaBundled from "shared/item/traits/FormulaBundled";
import Furnace from "shared/item/traits/Furnace";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Basic Power Harvester")
    .setDescription(
        "Utilises the power of True Ease to somehow collect more Power from droplets. The boost increases when you have more Power, and maxes out at %cap%.",
    )
    .setDifficulty(Difficulty.TrueEase)
    .setPrice(new CurrencyBundle().set("Funds", 1.56e12).set("Power", 18000), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .setFormula(new Formula().add(1).log(3).mul(0.5).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 15000000))

    .trait(FormulaBundled)
    .setRatio("Power", 1)
    .setRatio("Funds", 400)
    .setX(() => Server.Currency.get("Power"))
    .apply(Furnace)

    .exit();
