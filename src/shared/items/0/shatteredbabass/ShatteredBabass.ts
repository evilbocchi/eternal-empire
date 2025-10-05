import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Formula from "shared/currency/Formula";
import { Server } from "shared/api/APIExpose";

const mul = new CurrencyBundle().set("Funds", 0);

export = new Item(script.Name)
    .setName(Difficulty.ShatteredBabass.name!)
    .setDescription("Shattered Babass is here to charge up your setup. Boosts Funds with Power.")
    .setDifficulty(Difficulty.ShatteredBabass)
    .setPrice(new CurrencyBundle().set("Funds", 200e36).set("Power", 10e21).set("Skill", 200000), 1)
    .addPlaceableArea("BarrenIslands")

    .setFormula(new Formula().div(1e21).add(1).log(10).pow(1.5).add(1))
    .setFormulaX("power")
    .setFormulaXCap(new CurrencyBundle().set("Power", 1e303))

    .trait(Upgrader)
    .applyFormula(
        (v, item) => item.setMul(mul.set("Funds", v)),
        () => Server.Currency.get("Power"),
    )

    .exit();
