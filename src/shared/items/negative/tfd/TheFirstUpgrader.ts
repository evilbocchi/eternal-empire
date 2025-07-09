import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("The First Upgrader")
    .setDescription("Increases the monetary value of droplets. Pass droplets through the laser to increase revenue.")
    .setDifficulty(Difficulty.TheFirstDifficulty)
    .setPrice(new CurrencyBundle().set("Funds", 30), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 4))

    .trait(Conveyor)
    .setSpeed(3)

    .exit();