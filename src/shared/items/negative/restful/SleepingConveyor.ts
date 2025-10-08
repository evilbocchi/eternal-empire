import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Sleeping Conveyor")
    .setDescription("Wait, you don't want speed? Fine then. Take some slow conveyors.")
    .setDifficulty(Difficulty.Restful)
    .setPrice(new CurrencyBundle().set("Funds", 225e15), 1, 10)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Conveyor)
    .setSpeed(3)

    .exit();
