import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Grass from "shared/items/excavation/harvestable/Grass";
import StaleWood from "shared/items/excavation/harvestable/StaleWood";

export = new Item(script.Name)
    .setName("Work-In-Progress Upgrader")
    .setDescription("This upgrader's structure is still being built, but is still able to boost Funds by %add% on each upgrader. However, this drains %drain%.")
    .setDifficulty(Difficulty.FelixTheA)
    .setPrice(new CurrencyBundle().set("Funds", 20e12), 1)
    .setRequiredItemAmount(Grass, 50)
    .setRequiredItemAmount(StaleWood, 20)
    .addPlaceableArea("BarrenIslands")
    .persists()

    .setDrain(new CurrencyBundle().set("Funds", 400e9))

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 1000))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();