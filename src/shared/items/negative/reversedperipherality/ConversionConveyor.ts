import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Conversion Conveyor")
    .setDescription("From wide to narrow.")
    .setDifficulty(Difficulty.ReversedPeripherality)
    .setPrice(new CurrencyBundle().set("Funds", 1e15), 1, 5)
    .addPlaceableArea("BarrenIslands")

    .trait(Conveyor)
    .setSpeed(4)

    .exit();