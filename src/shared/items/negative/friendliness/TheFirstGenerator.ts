import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Generator from "shared/item/traits/generator/Generator";
import Item from "shared/item/Item";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Basic Generator")
    .setDescription("Start producing Power at %gain%.")
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Funds", 1000000000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 1450000000).set("Power", 50), 2)
    .setPrice(new CurrencyBundle().set("Funds", 3000000000).set("Power", 250), 3)
    .setPrice(new CurrencyBundle().set("Funds", 42200000000).set("Power", 1200), 4)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Generator)
    .setPassiveGain(new CurrencyBundle().set("Power", 1))

    .exit();
