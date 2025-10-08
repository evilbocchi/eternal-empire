import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Half Sleeping Conveyor")
    .setDescription("Didn't this item already exist?")
    .setDifficulty(Difficulty.Restful)
    .setPrice(new CurrencyBundle().set("Funds", 225e15), 1, 10)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Conveyor)
    .setSpeed(3)

    .exit();
