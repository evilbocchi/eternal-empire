import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Elevated Upgrader")
    .setDescription("A little high... Increases droplet value by %mul%.")
    .setDifficulty(Difficulty.FelixTheA)
    .setPrice(new CurrencyBundle().set("Funds", 25e12), 1)
    .addPlaceableArea("BarrenIslands")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 2))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();