import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Generator from "shared/item/traits/generator/Generator";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("'Happy' Tesseract")
    .setDescription(
        "That smile... It has spiralled out of control. It's menacing. Trying to find any opening to catch you. Produces %gain%.",
    )
    .setDifficulty(Difficulty.Happylike)
    .setPrice(new CurrencyBundle().set("Funds", 1e33).set("Skill", 90), 1)
    .addPlaceableArea("SlamoVillage")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Dark Matter", 11.4e9))

    .exit();
