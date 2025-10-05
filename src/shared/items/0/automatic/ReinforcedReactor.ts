import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import NormalReactor from "shared/items/0/millisecondless/NormalReactor";

export = new Item(script.Name)
    .setName("Reinforced Reactor")
    .setDescription(
        "This reactor is extremely cheap, providing a %mul% boost to droplets in both of its entrances. However... be completely sure you really want to use this.",
    )
    .setDifficulty(Difficulty.Automatic)
    .setPrice(
        new CurrencyBundle()
            .set("Funds", 100e3)
            .set("Power", 100e3)
            .set("Bitcoin", 100e3)
            .set("Skill", 100e3)
            .set("Purifier Clicks", 10)
            .set("Dark Matter", 10),
        1,
    )
    .setRequiredItemAmount(NormalReactor, 1)
    .addPlaceableArea("BarrenIslands")
    .setCreator("sanjay2133")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 4))

    .trait(Conveyor)
    .setSpeed(10)

    .exit();
