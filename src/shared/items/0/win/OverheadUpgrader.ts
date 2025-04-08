import Difficulty from "@antivivi/jjt-difficulties";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Conveyor from "shared/item/traits/Conveyor";
import Item from "shared/item/Item";
import Upgrader from "shared/item/traits/Upgrader";
import Crystal from "shared/items/excavation/Crystal";
import Iron from "shared/items/excavation/Iron";

export = new Item(script.Name)
    .setName("Overhead Upgrader")
    .setDescription("Why would you craft something so weirdly shaped? Who knows. %mul% value to droplets.")
    .setDifficulty(Difficulty.Win)
    .setPrice(new CurrencyBundle().set("Skill", 6), 1)
    .setPrice(new CurrencyBundle().set("Skill", 270), 2)
    .setRequiredItemAmount(Crystal, 15)
    .setRequiredItemAmount(Iron, 3)
    .setCreator("filipthesuperstar")
    .addPlaceableArea("SlamoVillage")

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 2))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();