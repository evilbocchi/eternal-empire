import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import OverheadUpgrader from "shared/items/0/win/OverheadUpgrader";
import CorruptedGrass from "shared/items/excavation/harvestable/CorruptedGrass";

export = new Item(script.Name)
    .setName("OverOverhead Upgrader")
    .setDescription(
        "A sequel to the Overhead Upgrader. Stacks on top of the original for even more value! %mul% value to droplets.",
    )
    .setDifficulty(Difficulty.Frivolous)
    .setPrice(new CurrencyBundle().set("Skill", 1000), 1)
    .setRequiredItemAmount(OverheadUpgrader, 1)
    .setRequiredItemAmount(CorruptedGrass, 1)
    .setCreator("welshredbird")
    .addPlaceableArea("SlamoVillage")
    .persists()

    .trait(Upgrader)
    .setMul(new CurrencyBundle().set("Skill", 3))

    .trait(Conveyor)
    .setSpeed(7)

    .exit();
