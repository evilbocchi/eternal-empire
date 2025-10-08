import Difficulty from "@rbxts/ejt";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Elevated Conveyor")
    .setDescription("In case you really love your droplets with an altitude.")
    .setDifficulty(Difficulty.FelixTheDA)
    .setPrice(new CurrencyBundle().set("Funds", 30e12), 1, 15)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Conveyor)
    .setSpeed(6)

    .exit();
