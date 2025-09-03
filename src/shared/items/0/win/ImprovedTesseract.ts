import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Generator from "shared/item/traits/generator/Generator";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Improved Tesseract")
    .setDescription("Just a tesseract doing its tesseract things for %gain%. Don't mind it, please.")
    .setDifficulty(Difficulty.Win)
    .setPrice(new CurrencyBundle().set("Skill", 4), 1)
    .setPrice(new CurrencyBundle().set("Skill", 10), 2)
    .addPlaceableArea("SlamoVillage")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Dark Matter", 96))

    .exit();
