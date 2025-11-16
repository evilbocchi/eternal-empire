import Difficulty from "@rbxts/ejt";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Class1Shop from "shared/items/1/Class1Shop";

export = new Item(script.Name)
    .setName("Abrupt Bridge")
    .setDescription(
        "A bridge in the sky and a river, cutting off like nothing was ever there. %mul% for droplets passing underneath the bridge.",
    )
    .setDifficulty(Difficulty.Joyful)
    .setPrice(new CurrencyBundle().set("Skill", 230e9), 1)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands", "SkyPavilion")
    .soldAt(Class1Shop)

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 3))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
