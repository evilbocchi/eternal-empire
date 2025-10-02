import Difficulty from "@antivivi/jjt-difficulties";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import FormulaBundled from "shared/item/traits/FormulaBundled";
import Damager from "shared/item/traits/upgrader/Damager";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Get-This-Latergrader")
    .setDescription("Welcome to Skip! Now skip this item. You're not getting this yet.")
    .setDifficulty(Difficulty.Skip)
    .setPrice(new CurrencyBundle().set("Funds", 1e45), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().ln().ln().ln())
    .setFormulaX("funds")
    .setFormulaXCap(new CurrencyBundle().set("Funds", 1e50))

    .trait(Damager)
    .setDamage(400)

    .trait(FormulaBundled)
    .setX(() => Server.Currency.get("Funds"))
    .setRatio("Power", 10)
    .setRatio("Funds", 1.01)
    .apply(Upgrader)

    .trait(Conveyor)
    .setSpeed(2)

    .exit();
