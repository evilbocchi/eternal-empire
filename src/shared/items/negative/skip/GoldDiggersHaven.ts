import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import Crystal from "shared/items/excavation/Crystal";
import Gold from "shared/items/excavation/Gold";

export = new Item(script.Name)
    .setName("Gold Digger's Haven")
    .setDescription(
        "Are you living in a dream? Everywhere around you is the beautiful color of gold... %add% droplet value.",
    )
    .setDifficulty(Difficulty.Skip)
    .setPrice(new CurrencyBundle().set("Skill", 7), 1)
    .setPrice(new CurrencyBundle().set("Skill", 20), 2)
    .setRequiredItemAmount(Crystal, 15)
    .setRequiredItemAmount(Gold, 1)
    .setCreator("CoPKaDT")
    .addPlaceableArea("SlamoVillage")
    .persists()

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Skill", 0.01))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
