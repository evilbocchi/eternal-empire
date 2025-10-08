import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Anti-clockwise Conveyor Corner")
    .setDescription(
        "Originally developed by the legend himself, Speed Bobs, his legacy lives on in the name of transporting droplets anti-clockwise.",
    )
    .setDifficulty(Difficulty.Friendliness)
    .setPrice(new CurrencyBundle().set("Funds", 9500000), 1, 5)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
