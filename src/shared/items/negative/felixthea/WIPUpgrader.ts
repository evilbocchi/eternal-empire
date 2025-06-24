import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Upgrader from "shared/item/traits/Upgrader";

export = new Item(script.Name)
    .setName("Work-In-Progress Upgrader")
    .setDescription("This upgrader's structure is still being built, but is still able to boost Funds by %add% on each upgrader. However, this drains %drain%.")
    .setDifficulty(Difficulty.FelixTheA)
    .setPrice(new CurrencyBundle().set("Funds", 20e12), 1)
    .setRequiredHarvestableAmount("Grass", 50)
    .setRequiredHarvestableAmount("StaleWood", 20)
    .addPlaceableArea("BarrenIslands")
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 2))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();