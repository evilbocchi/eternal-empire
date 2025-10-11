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
        "A device used to inject Tesseract energy into objects, enhancing their properties and capabilities.",
    )
    .setDifficulty(Difficulty.Placid)
    .setPrice(new CurrencyBundle().set("Bitcoin", 100e27))
    .addPlaceableArea("SlamoVillage")
    .setCreator("WelshRedBird")
    .persists()

    .setFormula(new Formula().pow(0.01))
    .setFormulaX("Dark Matter")
    .setFormulaXCap(new CurrencyBundle().set("Dark Matter", 1e42))

    .trait(Upgrader)
    .applyFormula(
        (v, item) => item.setMul(mul.set("Bitcoin", v)),
        () => Server.Currency.get("Dark Matter"),
    )

    .exit();
