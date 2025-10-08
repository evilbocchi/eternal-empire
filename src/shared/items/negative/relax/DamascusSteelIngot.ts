import Difficulty from "@rbxts/ejt";
import CurrencyBundle from "shared/currency/CurrencyBundle";
import Item from "shared/item/Item";
import Iron from "shared/items/excavation/Iron";
import WhiteGem from "shared/items/excavation/WhiteGem";
import IronIngot from "shared/items/negative/exist/IronIngot";
import SteelIngot from "shared/items/negative/exist/SteelIngot";

export = new Item(script.Name)
    .setName("Damascus Steel Ingot")
    .setDescription("A superior alloy made by layering iron and steel, known for its strength and resilience.")
    .setDifficulty(Difficulty.Relax)
    .setPrice(new CurrencyBundle().set("Power", 1_073_741_824))
    .setRequiredItemAmount(SteelIngot, 1)
    .setRequiredItemAmount(IronIngot, 1)
    .setRequiredItemAmount(Iron, 1)
    .setRequiredItemAmount(WhiteGem, 1)
    .placeableEverywhere()
    .persists();
