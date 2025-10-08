import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Iron from "shared/items/excavation/Iron";

export = new Item(script.Name)
    .setName("Iron Ingot")
    .setDescription("A refined bar of iron.")
    .setDifficulty(Difficulty.Exist)
    .setPrice(new CurrencyBundle().set("Power", 1_048_576))
    .setRequiredItemAmount(Iron, 6)
    .placeableEverywhere()
    .persists();
