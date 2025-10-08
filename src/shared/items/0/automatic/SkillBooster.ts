import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class0Shop from "../Class0Shop";

export = new Item(script.Name)
    .setName("Skill Booster")
    .setDescription(
        "A convoluted piece of machinery that has one purpose: to boost droplets by %mul%. We must continue pushing Skill.",
    )
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Funds", 100e39).set("Power", 100e24).set("Skill", 6000000), 1)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(Class0Shop)
    .setCreator("CoPKaDT")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 4))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
