import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";

export = new Item(script.Name)
    .setName("The First Conveyor")
    .setDescription("Moves stuff from one place to another. Use this to push droplets into furnaces.")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setPrice(new CurrencyBundle().set("Funds", 5), 1, 5)
    .addPlaceableArea("BarrenIslands")

    .trait(Conveyor)
    .setSpeed(6)

    .exit();
