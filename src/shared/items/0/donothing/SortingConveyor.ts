import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Conveyor from "shared/item/traits/conveyor/Conveyor";
import MagicalCraftingTable from "shared/items/0/millisecondless/MagicalCraftingTable";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import WhiteGem from "shared/items/excavation/WhiteGem";

export = new Item(script.Name)
    .setName("Sorting Conveyor")
    .setDescription("Sorts stuff... I don't know how this works either.")
    .setDifficulty(Difficulty.DoNothing)
    .setPrice(new CurrencyBundle().set("Funds", 8.2e27), 1)
    .setRequiredItemAmount(WhiteGem, 40)
    .setRequiredItemAmount(ExcavationStone, 20)
    .setCreator("CoPKaDT")
    .addPlaceableArea("BarrenIslands")
    .soldAt(MagicalCraftingTable)
    .persists()

    .trait(Conveyor)
    .setSpeed(5)

    .exit();
