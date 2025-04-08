import Difficulty from "@antivivi/jjt-difficulties";
import Generator from "shared/item/traits/Generator";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Peripheral Generator")
    .setDescription("Produces %gain%. We're getting somewhere now.")
    .setDifficulty(Difficulty.ReversedPeripherality)
    .setPrice(new CurrencyBundle().set("Funds", 201e15).set("Power", 16700000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 427e15).set("Power", 152000000), 2)
    .setPrice(new CurrencyBundle().set("Funds", 870e15).set("Power", 371000000), 3)
    .addPlaceableArea("BarrenIslands")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Power", 15000))

    .exit();