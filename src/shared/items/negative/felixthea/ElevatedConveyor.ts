import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Elevated Conveyor")
    .setDescription("In case you really love your droplets with an altitude.")
    .setDifficulty(Difficulty.FelixTheA)
    .setPrice(new CurrencyBundle().set("Funds", 30e12), 1, 15)
    .addPlaceableArea("BarrenIslands")

    .trait(Conveyor)
    .setSpeed(6)

    .exit();
