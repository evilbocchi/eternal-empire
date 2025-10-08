import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Generator from "shared/item/traits/generator/Generator";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Basic Tesseract")
    .setDescription("A generator that produces %gain%. You'll need to skillify for this!")
    .setDifficulty(Difficulty.Millisecondless)
    .setPrice(new CurrencyBundle().set("Skill", 0.5), 1)
    .setPrice(new CurrencyBundle().set("Skill", 1), 2)
    .setPrice(new CurrencyBundle().set("Skill", 2), 3)
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Dark Matter", 1))

    .exit();
