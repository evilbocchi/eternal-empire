import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Generator from "shared/item/traits/generator/Generator";
import Item from "shared/item/Item";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Improved Tesseract")
    .setDescription("Just a tesseract doing its tesseract things for %gain%. Don't mind it, please.")
    .setDifficulty(Difficulty.Win)
    .setPrice(new CurrencyBundle().set("Skill", 4), 1)
    .setPrice(new CurrencyBundle().set("Skill", 10), 2)
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Dark Matter", 96))

    .exit();
