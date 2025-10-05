import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import UnleashedConveyor from "shared/item/traits/conveyor/UnleashedConveyor";
import UnleashedElevatedConveyor from "shared/items/0/locomotion/UnleashedElevatedConveyor";
import Crystal from "shared/items/excavation/Crystal";
import EnchantedGrass from "shared/items/excavation/harvestable/EnchantedGrass";

export = new Item(script.Name)
    .setName("Unleashed Elevated Mini Conveyor")
    .setDescription(`The junior to ${UnleashedElevatedConveyor.name}.`)
    .setDifficulty(Difficulty.Locomotion)
    .setPrice(new CurrencyBundle().set("Funds", 2e30), 1, 30)
    .setRequiredItemAmount(EnchantedGrass, 20)
    .setRequiredItemAmount(Crystal, 5)
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .setCreator("CoPKaDT")
    .persists()

    .trait(Conveyor)
    .setSpeed(9)

    .trait(UnleashedConveyor)
    .exit();
