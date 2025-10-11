import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Automatic Railgun")
    .setDescription("Boom! Launches droplets to the skyline with a %mul% bang.")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Funds", 2.5e42).set("Bitcoin", 5e9), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage", "SkyPavilion")
    .soldAt(Class0Shop)
    .setCreator("simple13579")

    .trait(Conveyor)
    .setSpeed(20)

    .trait(Upgrader)
    .setSky(true)
    .setMul(new CurrencyBundle().set("Bitcoin", 5))

    .exit();
