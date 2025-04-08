import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/Conveyor";
import Upgrader from "shared/item/traits/Upgrader";

export = new Item(script.Name)
    .setName("Abnormal Reactor")
    .setDescription("This reactor has two entrances, each giving a %mul% boost. I wish you the best of luck in configuring this.")
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new CurrencyBundle().set("Skill", 2454000), 1)
    .addPlaceableArea("SlamoVillage")
    .setCreator("butterman_toast")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 1.6))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();