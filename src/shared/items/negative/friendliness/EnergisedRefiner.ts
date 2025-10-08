import Difficulty from "@rbxts/ejt";
import { Server } from "shared/api/APIExpose";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

const mul = new CurrencyBundle().set("Funds", 0);

export = new Item(script.Name)
    .setName("Energised Refiner")
    .setDescription(
        "Power your items up. This upgrader has a Funds boost that increases with the amount of Power you own, maxing out when you reach %cap%. Uses %drain%.",
    )
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Power", 20), 1)
    .setPrice(new CurrencyBundle().set("Power", 120), 2)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .setFormula(new Formula().add(1).log(3).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 5000))

    .setDrain(new CurrencyBundle().set("Power", 0.4))

    .trait(Upgrader)
    .applyFormula(
        (v, item) => item.setMul(mul.set("Funds", v)),
        () => Server.Currency.get("Power"),
    )
    .exit();
