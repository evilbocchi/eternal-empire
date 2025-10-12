import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Formula from "shared/currency/Formula";
import { Server } from "shared/api/APIExpose";
import Class1Shop from "../Class1Shop";

const mul = new CurrencyBundle();

export = new Item(script.Name)
    .setName("Tesseract Injector")
    .setDescription(
        "An upgrader that uses the energy of Tesseracts, allowing it to boost Bitcoin at an extremely small rate.",
    )
    .setDifficulty(Difficulty.Placid)
    .setPrice(new CurrencyBundle().set("Bitcoin", 100e27))
    .addPlaceableArea("SlamoVillage")
    .setCreator("WelshRedBird")
    .persists("Winification")

    .setFormula(new Formula().pow(0.01))
    .setFormulaX("Dark Matter")
    .setFormulaXCap(new CurrencyBundle().set("Dark Matter", 1e42))

    .trait(Upgrader)
    .applyFormula(
        (v, item) => item.setMul(mul.set("Bitcoin", v)),
        () => Server.Currency.get("Dark Matter"),
    )

    .exit();
