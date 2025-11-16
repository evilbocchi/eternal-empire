import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";

export = new Item(script.Name)
    .setName("Automated Stairs Conveyor")
    .setDescription("Moves very small droplets up the stairs to the skyline, all in a 2x2 space.")
    .setDifficulty(Difficulty.Automatic)
    .setPrice(new CurrencyBundle().set("Skill", 700000).set("Dark Matter", 50e30), 1)
    .setCreator("superGirlygamer8o")
    .addPlaceableArea("BarrenIslands", "SlamoVillage")
    .soldAt(MagicalCraftingTable)
    .persists()

    .trait(Conveyor)
    .setSpeed(10)

    .exit();
