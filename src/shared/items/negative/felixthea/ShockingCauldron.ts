import Difficulty from "@rbxts/ejt";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import Furnace from "shared/item/traits/Furnace";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

const mul = new CurrencyBundle().set("Funds", 0);

export = new Item(script.Name)
    .setName("Shocking Cauldron")
    .setDescription("A cauldron that scales with Power. Maxes out at %cap%, but uses %drain%.")
    .setDifficulty(Difficulty.FelixTheDA)
    .setPrice(new CurrencyBundle().set("Funds", 30.8e12), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .setDrain(new CurrencyBundle().set("Power", 45))
    .setFormula(new Formula().add(1).log(10).mul(1420000).add(2000000))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 500e6))

    .trait(Furnace)
    .setIsCauldron(true)
    .applyFormula(
        (v, item) => item.setMul(mul.set("Funds", v)),
        () => Server.Currency.get("Power"),
    )

    .exit();
