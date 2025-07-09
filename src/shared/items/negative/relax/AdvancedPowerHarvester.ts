import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import { Server } from "shared/item/ItemUtils";
import Furnace from "shared/item/traits/Furnace";
import FormulaBundled from "shared/item/traits/FormulaBundled";

const mul = new CurrencyBundle().set("Funds", 0).set("Power", 0);

export = new Item(script.Name)
    .setName("Advanced Power Harvester")
    .setDescription("A relaxing harvester... Boost increases with Power, maxing out at %cap%.")
    .setDifficulty(Difficulty.Relax)
    .setPrice(new CurrencyBundle().set("Power", 812e6).set("Purifier Clicks", 400), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(5).mul(0.9).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 50e12))

    .trait(FormulaBundled)
    .setRatio("Power", 1)
    .setRatio("Funds", 400)
    .setX(() => Server.Currency.get("Power"))
    .apply(Furnace)

    .exit();