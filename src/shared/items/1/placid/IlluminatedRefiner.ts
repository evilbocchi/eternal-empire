import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Jade from "shared/items/excavation/Jade";

export = new Item(script.Name)
    .setName("Illuminated Refiner")
    .setDescription(
        "A high-end refiner that uses light to purify materials at an incredible rate. Requires Bitcoin to operate.",
    )
    .setDifficulty(Difficulty.Placid)
    .setPrice(new CurrencyBundle().set("Wins", 0.01))
    .setRequiredItemAmount(Jade, 5)
    .addPlaceableArea("BarrenIslands")
    .setCreator("sanjay2133")
    .persists()

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Bitcoin", 200))

    .exit();
