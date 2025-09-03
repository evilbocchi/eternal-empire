import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Droplet Aligner")
    .setDescription(
        "Moves droplets to the direct center of the conveyor and pushes them forward. Useful for a few things.",
    )
    .setDifficulty(Difficulty.Relax)
    .setPrice(new CurrencyBundle().set("Funds", 345e15), 1, 5)
    .setPrice(new CurrencyBundle().set("Funds", 3.45e18), 6, 10)
    .addPlaceableArea("BarrenIslands")

    .trait(Conveyor)
    .setSpeed(6)

    .exit();
