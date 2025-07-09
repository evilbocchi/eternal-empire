import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Direct Droplet Washer")
    .setDescription("Upgrades droplets dropped directly above it for a %add% gain.")
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new CurrencyBundle().set("Funds", 25000), 1)
    .setPrice(new CurrencyBundle().set("Funds", 30000), 2)
    .setPrice(new CurrencyBundle().set("Funds", 40000), 3)
    .setPrice(new CurrencyBundle().set("Funds", 60000), 4)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 80))

    .trait(Conveyor)
    .setSpeed(3)

    .exit();
