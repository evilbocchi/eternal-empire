import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("Spatial Furnace")
    .setDescription("A basic furnace placeable in Slamo Village.")
    .setDifficulty(Difficulty.Astronomical)
    .setPrice(new CurrencyBundle().set("Funds", 3e24), 1)
    .addPlaceableArea("SlamoVillage")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 1))

    .exit();
