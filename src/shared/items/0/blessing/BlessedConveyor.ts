import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Blessed Conveyor")
    .setDescription(
        "A conveyor you can place in Barren Islands and Slamo Village! Droplets gain %mul% value as a bonus for touching the center.",
    )
    .setDifficulty(Difficulty.Blessing)
    .setPrice(new CurrencyBundle().set("Bitcoin", 1000), 1, 5)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .persists("Skillification")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.04))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
