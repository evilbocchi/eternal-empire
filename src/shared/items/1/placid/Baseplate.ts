import Difficulty from "@rbxts/ejt";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Class1Shop from "shared/items/1/Class1Shop";

export = new Item(script.Name)
    .setName("Baseplate")
    .setDescription(
        "Stop wasting time rebuilding everything from scratch. Provides a %mul% boost to droplets passing through.",
    )
    .setDifficulty(Difficulty.Placid)
    .setPrice(new CurrencyBundle().set("Wins", 1), 1, 3)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class1Shop)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 1.2).set("Power", 1.2).set("Skill", 1.2))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
