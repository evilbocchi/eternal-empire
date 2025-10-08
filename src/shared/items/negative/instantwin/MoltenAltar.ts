import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import { Server } from "shared/api/APIExpose";
import Furnace from "shared/item/traits/Furnace";
import FormulaBundled from "shared/item/traits/FormulaBundled";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Molten Altar")
    .setDescription("Burn the sacrifice. Boost increases with Power, maxing out at %cap%.")
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new CurrencyBundle().set("Funds", 21.3e21).set("Power", 14.2e12), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .setFormula(new Formula().add(1).log(4).mul(2).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 100e15))

    .trait(FormulaBundled)
    .setRatio("Power", 1)
    .setRatio("Funds", 400)
    .setX(() => Server.Currency.get("Power"))
    .apply(Furnace)

    .exit();
