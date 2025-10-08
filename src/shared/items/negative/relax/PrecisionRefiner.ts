import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Precision Refiner")
    .setDescription("A thin laser requiring utmost precision to upgrade droplets for %mul% value.")
    .setDifficulty(Difficulty.Relax)
    .setPrice(new CurrencyBundle().set("Funds", 5e18), 1)
    .setPrice(new CurrencyBundle().set("Funds", 11e18), 2)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 2))

    .exit();
