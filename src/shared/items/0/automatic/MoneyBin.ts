import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Bin from "shared/item/traits/Bin";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Money Bin")
    .setDescription("A bin that collects money while you are offline.")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Funds", 2.5e42), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .soldAt(Class0Shop)
    .setCreator("simple13579")

    .trait(Bin)
    .setMul(new CurrencyBundle().set("Funds", 0.1))

    .exit();
