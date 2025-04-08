import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Generator from "shared/item/traits/Generator";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Basic Tesseract")
    .setDescription("A generator that produces %gain%. You'll need to skillify for this!")
    .setDifficulty(Difficulty.Millisecondless)
    .setPrice(new CurrencyBundle().set("Skill", 1), 1)
    .setPrice(new CurrencyBundle().set("Skill", 2), 2)
    .setPrice(new CurrencyBundle().set("Skill", 4), 3)
    .addPlaceableArea("SlamoVillage")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Dark Matter", 1))

    .exit();