import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class1Shop from "../Class1Shop";

export = new Item(script.Name)
    .setName("Childhood Slide")
    .setDescription(
        "After all these years, you still remember the joy of sliding down a slide. This slide is no different, except it boosts your droplets by %mul%.",
    )
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Skill", 20), 1)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class1Shop)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 2).set("Skill", 2))

    .trait(Conveyor)
    .setSpeed(7)

    .exit();
