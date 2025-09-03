import Difficulty from "@antivivi/jjt-difficulties";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { Server } from "shared/item/ItemUtils";

const mul = new CurrencyBundle().set("Funds", 0);

export = new Item(script.Name)
    .setName("Shocking Cauldron")
    .setDescription("A cauldron that scales with Power. Maxes out at %cap%, but uses %drain%.")
    .setDifficulty(Difficulty.FelixTheA)
    .setPrice(new CurrencyBundle().set("Funds", 30.8e12), 1)
    .addPlaceableArea("BarrenIslands")

    .setDrain(new CurrencyBundle().set("Power", 45))
    .setFormula(new Formula().add(1).log(10).mul(1420000).add(2000000))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 500e6))

    .trait(Furnace)
    .acceptsUpgrades(false)
    .applyFormula(
        (v, item) => item.setMul(mul.set("Funds", v)),
        () => Server.Currency.get("Power"),
    )

    .exit();
