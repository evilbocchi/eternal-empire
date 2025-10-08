import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import ExcavationStone from "shared/items/excavation/ExcavationStone";
import CraftingTable from "shared/items/negative/tfd/CraftingTable";

export = new Item(script.Name)
    .setName("Lamp")
    .setDescription("Provides visibility at night.")
    .setDifficulty(Difficulty.Negativity)
    .setPrice(new CurrencyBundle().set("Funds", 200))
    .setRequiredItemAmount(ExcavationStone, 10)
    .placeableEverywhere()
    .soldAt(CraftingTable)
    .persists();
