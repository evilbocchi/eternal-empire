import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import LaserFan from "shared/item/traits/other/LaserFan";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import ClassLowerNegativeShop from "shared/items/negative/ClassLowerNegativeShop";

export = new Item(script.Name)
    .setName("Laser Fan")
    .setDescription("Increases droplet value by %mul% compounding per blade.")
    .setDifficulty(Difficulty.Unimpossible)
    .setPrice(new CurrencyBundle().set("Funds", 150000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 350000), 2)
    .addPlaceableArea("BarrenIslands")
    .soldAt(ClassLowerNegativeShop)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.3))

    .trait(LaserFan)
    .setSpeed(3)

    .exit();
