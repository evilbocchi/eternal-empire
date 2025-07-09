import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Small Reactor")
    .setDescription("This 'small' reactor gives a %mul% boost to any droplets passing through it.")
    .setDifficulty(Difficulty.Unimpossible)
    .setPrice(new CurrencyBundle().set("Funds", 3500000), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 3.5))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
