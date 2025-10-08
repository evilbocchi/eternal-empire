import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
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
    .soldAt(MagicalCraftingTable)
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 2))

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
