import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import NormalReactor from "shared/items/0/millisecondless/NormalReactor";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Reinforced Reactor")
    .setDescription(
        "This reactor is extremely cheap, providing a %mul% boost to droplets in both of its entrances. However... be completely sure you really want to use this.",
    )
    .setDifficulty(Difficulty.Automatic)
    .setPrice(
        new CurrencyBundle()
            .set("Funds", 10e42)
            .set("Power", 25e24)
            .set("Bitcoin", 10e9)
            .set("Skill", 50e6)
            .set("Purifier Clicks", 2.5e21)
            .set("Dark Matter", 100e24),
        1,
    )
    .setRequiredItemAmount(NormalReactor, 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)
    .setCreator("sanjay2133")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 4))

    .trait(Conveyor)
    .setSpeed(10)

    .exit();
