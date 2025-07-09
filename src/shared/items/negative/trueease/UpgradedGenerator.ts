import Difficulty from "@antivivi/jjt-difficulties";
import Generator from "shared/item/traits/generator/Generator";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Upgraded Generator")
    .setDescription("Let's work on that Power gain. Produces %gain%.")
    .setDifficulty(Difficulty.TrueEase)
    .setPrice(new CurrencyBundle().set("Funds", 205e9).set("Power", 3500), 1)
    .setPrice(new CurrencyBundle().set("Funds", 1.32e12).set("Power", 6600), 2)
    .addPlaceableArea("BarrenIslands")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Power", 7).set("Funds", 2e9))

    .exit();