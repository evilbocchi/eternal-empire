import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Reversed Upgrader")
    .setDescription(
        "An elevated upgrader that does not appreciate Power, boosting Funds by x2 but nerfing Power by x0.5 in droplet value.",
    )
    .setDifficulty(Difficulty.ReversedPeripherality)
    .setPrice(new CurrencyBundle().set("Funds", 1.45e18), 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("CoPKaDT")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 2).set("Power", 0.5))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
