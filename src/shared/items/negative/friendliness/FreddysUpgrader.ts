import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";

export = new Item(script.Name)
    .setName("Freddy's Upgrader")
    .setDescription("A well-built upgrader that adds %add% to droplet value.")
    .setDifficulty(Difficulty.Friendliness)
    .placeableEverywhere()

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Funds", 400))

    .trait(Conveyor)
    .setSpeed(3)

    .exit();
