import Difficulty from "@rbxts/ejt";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Elevated Upgrader")
    .setDescription("A little high... Increases droplet value by %mul%.")
    .setDifficulty(Difficulty.FelixTheDA)
    .setPrice(new CurrencyBundle().set("Funds", 25e12), 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 2))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
