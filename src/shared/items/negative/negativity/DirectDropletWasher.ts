import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Direct Droplet Washer")
    .setDescription("Upgrades droplets dropped directly above it for a %add% gain.")
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new CurrencyBundle().set("Funds", 25000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 30000), 2)
    .setPrice(new CurrencyBundle().set("Funds", 40000), 3)
    .setPrice(new CurrencyBundle().set("Funds", 60000), 4)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 80))

    .trait(Conveyor)
    .setSpeed(3)

    .exit();
