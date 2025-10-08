import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Abnormal Reactor")
    .setDescription(
        `This reactor has two entrances, each giving a %mul% boost.
It is said that this machine was made solely to piss off its users... but anything for that sweet, sweet Skill, right?`,
    )
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new CurrencyBundle().set("Skill", 300000), 1)
    .addPlaceableArea("SlamoVillage")
    .soldAt(Class0Shop)
    .setCreator("butterman_toast")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 2.6))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
