import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import CompactReactor from "shared/items/negative/reversedperipherality/CompactReactor";
import Class0Shop from "shared/items/0/Class0Shop";

export = new Item(script.Name)
    .setName("Normal Reactor")
    .setDescription(
        "This reactor has two entrances, each giving a %mul% boost. I wish you the best of luck in configuring this.",
    )
    .setDifficulty(Difficulty.Millisecondless)
    .setPrice(new CurrencyBundle().set("Funds", 454e21), 1)
    .setRequiredItemAmount(CompactReactor, 1)
    .addPlaceableArea("BarrenIslands")
    .soldAt(Class0Shop)
    .setCreator("simple13579")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Funds", 3.5))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
