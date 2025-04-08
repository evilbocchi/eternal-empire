import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Blessed Conveyor")
    .setDescription("A conveyor you can place in Barren Islands and Slamo Village! Droplets gain %mul% value as a bonus for touching the center.")
    .setDifficulty(Difficulty.Blessing)
    .setPrice(new CurrencyBundle().set("Bitcoin", 1000), 1, 5)
    .addPlaceableArea("BarrenIslands")
    .addPlaceableArea("SlamoVillage")
    .persists("Skillification")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.04))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();