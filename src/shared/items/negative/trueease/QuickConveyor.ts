import Difficulty from "@antivivi/jjt-difficulties";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import CurrencyBundle from "shared/currency/CurrencyBundle";

export = new Item(script.Name)
    .setName("Quick Conveyor")
    .setDescription(
        "Less droplets in a single moment means less worry about droplet limits. Transports droplets at a quicker rate than all previous conveyors!",
    )
    .setDifficulty(Difficulty.TrueEase)
    .setPrice(new CurrencyBundle().set("Funds", 200e9), 1, 10)
    .addPlaceableArea("BarrenIslands")

    .trait(Conveyor)
    .setSpeed(8)

    .exit();
