import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Furnace from "shared/item/traits/Furnace";
import Item from "shared/item/Item";
import Class1Shop from "shared/items/1/Class1Shop";

export = new Item(script.Name)
    .setName("Silent Memory")
    .setDescription("The price you pay for a basic furnace placeable in Sky Pavilion.")
    .setDifficulty(Difficulty.DoSomething)
    .setPrice(new CurrencyBundle().set("Funds", 3e45), 1)
    .addPlaceableArea("SkyPavilion")
    .soldAt(Class1Shop)
    .setCreator("CoPKaDT")

    .trait(Furnace)
    .setMul(new CurrencyBundle().set("Funds", 1))

    .exit();
