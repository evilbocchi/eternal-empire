import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import { Server } from "shared/api/APIExpose";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import FormulaBundled from "shared/item/traits/FormulaBundled";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Effervescent Droplet Spray")
    .setDescription(
        `Rinses droplets to make them sparkling clean! Just put droplets above the mystical veil for an enchanting experience.

The more Power you have, the better the boost this spray applies to Funds and Power.`,
    )
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Funds", 504e12), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().div(20).add(1).log(4).mul(0.3).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 10e12))

    .trait(FormulaBundled)
    .setRatio("Power", 2)
    .setRatio("Funds", 1)
    .setX(() => Server.Currency.get("Power"))
    .apply(Upgrader)

    .trait(Conveyor)
    .setSpeed(1)

    .exit();
