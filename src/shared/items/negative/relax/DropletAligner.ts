import Difficulty from "@rbxts/ejt";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Droplet Aligner")
    .setDescription(
        "Moves droplets to the direct center of the conveyor and pushes them forward. Useful for a few things.",
    )
    .setDifficulty(Difficulty.Relax)
    .setPrice(new CurrencyBundle().set("Funds", 345e15), 1, 5)
    .setPrice(new CurrencyBundle().set("Funds", 3.45e18), 6, 10)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Conveyor)
    .setSpeed(6)

    .exit();
