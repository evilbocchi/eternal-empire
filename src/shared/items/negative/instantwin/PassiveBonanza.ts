import Difficulty from "@rbxts/ejt";
import Generator from "shared/item/traits/generator/Generator";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Passive Bonanza")
    .setDescription("A chained beast waiting to be unleashed, producing %gain%.")
    .setDifficulty(Difficulty.InstantWin)
    .setPrice(new CurrencyBundle().set("Funds", 8.16e21).set("Power", 400e9), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Power", 100000000))

    .exit();
