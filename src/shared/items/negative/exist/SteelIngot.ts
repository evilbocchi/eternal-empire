import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Stone from "shared/items/0/millisecondless/Stone";
import Iron from "shared/items/excavation/Iron";
import WhiteGem from "shared/items/excavation/WhiteGem";
import CraftingTable from "shared/items/negative/tfd/CraftingTable";

export = new Item(script.Name)
    .setName("Steel Ingot")
    .setDescription("A dense, gleaming bar forged from iron, stone, and rare gems.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Power", 1_048_576))
    .setRequiredItemAmount(Iron, 6)
    .setRequiredItemAmount(WhiteGem, 1)
    .setRequiredItemAmount(Stone, 1)
    .placeableEverywhere()
    .soldAt(CraftingTable)
    .persists();
