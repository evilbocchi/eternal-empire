import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Droplet from "shared/item/Droplet";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import Upgrader from "shared/item/traits/upgrader/Upgrader";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
import CorruptedGrass from "shared/items/0/happylike/CorruptedGrass";
import GrassConveyor from "shared/items/negative/friendliness/GrassConveyor";

export = new Item("GrassDropletInfuser")
    .setName("Grass Droplet Infuser")
    .setDescription("Infuses grass droplets with %mul%. Only upgrades grass droplets.")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Funds", 5e36), 1)
    .setRequiredItemAmount(CorruptedGrass, 2)
    .setRequiredItemAmount(GrassConveyor, 3)
    .setCreator("sanjay2133")
    .addPlaceableArea("BarrenIslands")
    .soldAt(MagicalCraftingTable)
    .persists()

    .trait(Upgrader)
    .setRequirement(
        (dropletInfo) =>
            dropletInfo.DropletId === Droplet.GrassDroplet.id ||
            dropletInfo.DropletId === Droplet.NativeGrassDroplet.id ||
            dropletInfo.DropletId === Droplet.MassiveGrassDroplet.id,
    )
    .setMul(new CurrencyBundle().set("Funds", 2000))

    .trait(Conveyor)
    .setSpeed(4)

    .exit();
