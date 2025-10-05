import Difficulty from "@rbxts/ejt";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("The First Furnace")
    .setDescription("Processes droplets, converting them into liquid currency.")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setPrice(new CurrencyBundle().set("Funds", 0), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 1))

    .exit();
