import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Basic Refiner")
    .setDescription(
        `A flag-like device used to refine droplets.
Increases the value of droplets passing through its laser by %add%.`,
    )
    .setDifficulty(Difficulty.TheLowerGap)
    .setPrice(new CurrencyBundle().set("Funds", 1000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 3600), 2)
    .setPrice(new CurrencyBundle().set("Funds", 12200), 3)
    .setPrice(new CurrencyBundle().set("Funds", 50000), 4)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 10))
    .exit();
