import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Generator from "shared/item/traits/generator/Generator";
import Item from "shared/item/Item";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Advanced Tesseract")
    .setDescription(
        "Apparently taps into the fifth dimension to produce %gain%. Don't let that smile deceive you, it has connections with the underworld.",
    )
    .setDifficulty(Difficulty.Vintage)
    .setPrice(new CurrencyBundle().set("Funds", 600e27).set("Skill", 35), 1)
    .setPrice(new CurrencyBundle().set("Funds", 1.2e30).set("Skill", 35), 2)
    .setPrice(new CurrencyBundle().set("Funds", 2.4e30).set("Skill", 35), 3)
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Dark Matter", 2507331))

    .exit();
