import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";

export = new Item(script.Name)
    .setName("Freddy's Upgrader")
    .setDescription("A well-built upgrader that adds $250 to droplet value.")
    .setDifficulty(Difficulty.Miscellaneous)
    .placeableEverywhere()

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 250))

    .trait(Conveyor)
    .setSpeed(3)

    .exit();