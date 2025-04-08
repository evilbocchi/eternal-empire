import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Generator from "shared/item/traits/Generator";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Reinforced Tesseract")
    .setDescription("Scientists are still trying to figure out what qualifies as a tesseract. Against all odds, this particular piece of machinery produces an absurd %gain%.")
    .setDifficulty(Difficulty.Unlosable)
    .setPrice(new CurrencyBundle().set("Funds", 60e36).set("Power", 10e21).set("Skill", 90000).set("Dark Matter", 70e9), 1)
    .addPlaceableArea("SlamoVillage")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Dark Matter", 1.7e15))

    .exit();