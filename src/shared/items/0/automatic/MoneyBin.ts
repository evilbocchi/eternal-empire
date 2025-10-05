import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Bin from "shared/item/traits/Bin";

export = new Item(script.Name)
    .setName("Money Bin")
    .setDescription("A bin that collects money while you are offline.")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Funds", 1e42), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .setCreator("simple13579")

    .trait(Bin)
    .setMul(new CurrencyBundle().set("Funds", 0.1))

    .exit();
