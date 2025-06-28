import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Upgrader from "shared/item/traits/Upgrader";

export = new Item(script.Name)
    .setName("Abnormal Reactor")
    .setDescription(`This reactor has two entrances, each giving a %mul% boost.
It is said that this machine was made solely to piss off its users... but anything for that sweet, sweet Skill, right?`
    )
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new CurrencyBundle().set("Skill", 300000), 1)
    .addPlaceableArea("SlamoVillage")
    .setCreator("butterman_toast")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 2.6))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();