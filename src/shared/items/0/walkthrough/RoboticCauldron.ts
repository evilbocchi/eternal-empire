import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import { Server } from "shared/item/ItemUtils";
import Furnace from "shared/item/traits/Furnace";
import FormulaBundled from "shared/item/traits/FormulaBundled";

export = new Item(script.Name)
    .setName("Robotic Cauldron")
    .setDescription(`When Move-Your-Droplets™ tried branching out from producing conveyors, they experimented with all sorts of different machinery.
Their final creation before going back to their ways was this abomination of a cauldron on legs.
Scales with Power, maxing out at %cap%. Also provides a flat %flat% boost.`
    )
    .setDifficulty(Difficulty.Walkthrough)
    .setPrice(new CurrencyBundle().set("Funds", 600e33).set("Power", 6e18), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().add(1).log(5).mul(840).add(500))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 10e24))

    .trait(FormulaBundled)
    .setRatio("Power", 1)
    .setRatio("Funds", 1200)
    .setFlat("Skill", 5)
    .setX(() => Server.Currency.get("Power"))
    .apply(Furnace)
    .acceptsUpgrades(false)

    .exit();