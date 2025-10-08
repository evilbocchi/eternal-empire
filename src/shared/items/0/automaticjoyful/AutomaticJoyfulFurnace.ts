import Difficulty from "@rbxts/ejt";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Formula from "shared/currency/Formula";
import { Server } from "shared/api/APIExpose";
import RoboticCauldron from "shared/items/0/walkthrough/RoboticCauldron";
import Class0Shop from "../Class0Shop";

const mul = new CurrencyBundle().set("Power", 1);

export = new Item(script.Name)
    .setName("Automatic Joyful Furnace")
    .setDescription(
        `Processes Power at a higher value, boost increasing with Power. Could be better than the ${RoboticCauldron.name} depending on your use case.`,
    )
    .setDifficulty(Difficulty.AutomaticJoyful)
    .setPrice(new CurrencyBundle().set("Purifier Clicks", 1e21), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)

    .setFormula(new Formula().add(1).log(5).mul(32.8).add(5))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 10e24))

    .trait(Furnace)
    .applyFormula(
        (v, item) => item.setMul(mul.set("Power", v)),
        () => Server.Currency.get("Power"),
    )

    .exit();
