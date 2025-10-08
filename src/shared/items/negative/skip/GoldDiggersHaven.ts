import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
import Gold from "shared/items/excavation/Gold";
import ElectroshockedCoil from "shared/items/negative/a/ElectroshockedCoil";
import EmpoweredBrick from "shared/items/negative/instantwin/EmpoweredBrick";
import CrystalIngot from "shared/items/negative/unimpossible/CrystalIngot";

export = new Item(script.Name)
    .setName("Gold Digger's Haven")
    .setDescription(
        "Are you living in a dream? Everywhere around you is the beautiful color of gold... %add% droplet value.",
    )
    .setDifficulty(Difficulty.Skip)
    .setPrice(new CurrencyBundle().set("Skill", 7), 1)
    .setPrice(new CurrencyBundle().set("Skill", 20), 2)
    .setRequiredItemAmount(CrystalIngot, 3)
    .setRequiredItemAmount(Gold, 1)
    .setRequiredItemAmount(EmpoweredBrick, 5)
    .setRequiredItemAmount(ElectroshockedCoil, 1)
    .setCreator("CoPKaDT")
    .addPlaceableArea("SlamoVillage")
    .soldAt(MagicalCraftingTable)
    .persists()

    .trait(Upgrader)
    .setAdd(new CurrencyBundle().set("Skill", 0.01))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
